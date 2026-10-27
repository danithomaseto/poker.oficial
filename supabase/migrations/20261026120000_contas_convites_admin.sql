-- =====================================================================
-- Contas por convite, perfis (carteirinha), moedas e painel do dono.
--
-- Decisão: o site (Vercel) usa só a chave pública. Tudo o que precisa de
-- privilégio roda em funções SECURITY DEFINER que conferem quem chamou, e o
-- cadastro só é aceito por um gatilho que consome um convite válido.
-- A chave secreta do Supabase continua restrita ao futuro servidor de jogo.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.papel as enum ('dono', 'jogador');
create type public.status_acesso as enum ('ativo', 'revogado');

-- ---------------------------------------------------------------------
-- Configuração interna (ex.: email do dono). Sem acesso pelo cliente.
-- ---------------------------------------------------------------------
create table public.configuracao (
  chave text primary key,
  valor text not null
);
alter table public.configuracao enable row level security;

-- ---------------------------------------------------------------------
-- Perfis: só dados de jogo. Nada de email, telefone ou dado pessoal.
-- ---------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  numero_socio bigint generated always as identity unique,
  nome text not null check (char_length(nome) between 3 and 20 and nome = btrim(nome)),
  aparencia jsonb,
  papel public.papel not null default 'jogador',
  status public.status_acesso not null default 'ativo',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index perfis_nome_unico on public.perfis (lower(nome));
alter table public.perfis enable row level security;

-- ---------------------------------------------------------------------
-- Convites: o código em si nunca é guardado, só o hash SHA-256.
-- ---------------------------------------------------------------------
create table public.convites (
  id uuid primary key default gen_random_uuid(),
  codigo_hash text not null unique,
  dica text not null, -- 4 primeiros caracteres, para o dono reconhecer
  observacao text check (char_length(observacao) <= 60),
  criado_por uuid references public.perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  usado_por uuid unique references public.perfis (id) on delete set null,
  usado_em timestamptz,
  revogado_em timestamptz
);
alter table public.convites enable row level security;

-- ---------------------------------------------------------------------
-- Moedas cosméticas como ledger: cada crédito/débito é uma linha.
-- Escrita só pelo servidor (nenhuma política de insert para clientes).
-- ---------------------------------------------------------------------
create table public.moedas_lancamentos (
  id bigint generated always as identity primary key,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  valor integer not null check (valor <> 0),
  motivo text not null,
  criado_em timestamptz not null default now()
);
create index moedas_lancamentos_perfil on public.moedas_lancamentos (perfil_id);
alter table public.moedas_lancamentos enable row level security;

-- ---------------------------------------------------------------------
-- Funções auxiliares
-- ---------------------------------------------------------------------
create or replace function public.eh_dono()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and papel = 'dono' and status = 'ativo'
  );
$$;

create or replace function public.normalizar_codigo(p_codigo text)
returns text
language sql immutable set search_path = ''
as $$
  select upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

create or replace function public.hash_codigo(p_codigo text)
returns text
language sql immutable set search_path = ''
as $$
  select encode(extensions.digest(public.normalizar_codigo(p_codigo), 'sha256'), 'hex');
$$;

-- ---------------------------------------------------------------------
-- Políticas RLS: cada um lê o próprio; o dono lê tudo.
-- ---------------------------------------------------------------------
create policy "perfil próprio ou dono" on public.perfis
  for select using (id = auth.uid() or public.eh_dono());

create policy "dono lê convites" on public.convites
  for select using (public.eh_dono());

create policy "moedas próprias ou dono" on public.moedas_lancamentos
  for select using (perfil_id = auth.uid() or public.eh_dono());

-- ---------------------------------------------------------------------
-- Cadastro: só com convite válido (ou o email configurado como dono).
-- Se o convite não vale, a exceção desfaz a criação do usuário.
-- ---------------------------------------------------------------------
create or replace function public.ao_criar_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_nome text := btrim(coalesce(new.raw_user_meta_data ->> 'nome', ''));
  v_hash text := public.hash_codigo(new.raw_user_meta_data ->> 'codigo_convite');
  v_email_dono text;
  v_convite_id uuid;
begin
  select valor into v_email_dono from public.configuracao where chave = 'email_dono';

  if v_email_dono is not null
     and lower(new.email) = lower(v_email_dono)
     and not exists (select 1 from public.perfis where papel = 'dono') then
    insert into public.perfis (id, nome, papel)
    values (new.id, case when char_length(v_nome) between 3 and 20 then v_nome else 'Dono da mesa' end, 'dono');
    return new;
  end if;

  select id into v_convite_id
  from public.convites
  where codigo_hash = v_hash and usado_por is null and revogado_em is null
  for update;

  if v_convite_id is null then
    raise exception 'convite_invalido' using errcode = 'P0001';
  end if;

  insert into public.perfis (id, nome, papel) values (new.id, v_nome, 'jogador');
  update public.convites set usado_por = new.id, usado_em = now() where id = v_convite_id;
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.ao_criar_usuario();

-- ---------------------------------------------------------------------
-- RPCs públicas (usadas antes do cadastro, para mensagens de erro claras)
-- ---------------------------------------------------------------------
create or replace function public.verificar_convite(p_codigo text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.convites
    where codigo_hash = public.hash_codigo(p_codigo) and usado_por is null and revogado_em is null
  );
$$;

create or replace function public.nome_disponivel(p_nome text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (select 1 from public.perfis where lower(nome) = lower(btrim(p_nome)));
$$;

-- ---------------------------------------------------------------------
-- Jogador: salvar a aparência da carteirinha (só a própria)
-- ---------------------------------------------------------------------
create or replace function public.salvar_aparencia(p_aparencia jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_cor text := '^#[0-9a-fA-F]{6}$';
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  -- coalesce: campo ausente vira falso (sem ele, NULL passaria pela checagem).
  if not coalesce((
    (p_aparencia ->> 'pele') ~ v_cor
    and (p_aparencia ->> 'roupa') ~ v_cor
    and (p_aparencia ->> 'fundo') ~ v_cor
    and (p_aparencia -> 'cabelo' ->> 'cor') ~ v_cor
    and (p_aparencia -> 'cabelo' ->> 'estilo') in ('curto', 'longo', 'coque', 'moicano', 'careca')
    and (p_aparencia ->> 'acessorio') in ('nenhum', 'oculos', 'bone', 'brinco')
  ), false) then
    raise exception 'aparencia_invalida';
  end if;
  update public.perfis
     set aparencia = jsonb_build_object(
           'pele', p_aparencia ->> 'pele',
           'roupa', p_aparencia ->> 'roupa',
           'fundo', p_aparencia ->> 'fundo',
           'acessorio', p_aparencia ->> 'acessorio',
           'cabelo', jsonb_build_object('estilo', p_aparencia -> 'cabelo' ->> 'estilo', 'cor', p_aparencia -> 'cabelo' ->> 'cor')
         ),
         atualizado_em = now()
   where id = auth.uid() and status = 'ativo';
end;
$$;

-- ---------------------------------------------------------------------
-- Dono: convites
-- ---------------------------------------------------------------------
create or replace function public.gerar_convite(p_observacao text default null)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 símbolos, sem I/O/0/1
  v_bytes bytea := extensions.gen_random_bytes(12);
  v_codigo text := '';
begin
  if not public.eh_dono() then raise exception 'apenas_dono'; end if;
  for i in 0..11 loop
    v_codigo := v_codigo || substr(v_alfabeto, (get_byte(v_bytes, i) % 32) + 1, 1);
  end loop;
  insert into public.convites (codigo_hash, dica, observacao, criado_por)
  values (public.hash_codigo(v_codigo), left(v_codigo, 4), nullif(btrim(p_observacao), ''), auth.uid());
  -- O código só existe nesta resposta: o banco guarda apenas o hash.
  return substr(v_codigo, 1, 4) || '-' || substr(v_codigo, 5, 4) || '-' || substr(v_codigo, 9, 4);
end;
$$;

create or replace function public.revogar_convite(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_dono() then raise exception 'apenas_dono'; end if;
  update public.convites set revogado_em = now()
   where id = p_id and usado_por is null and revogado_em is null;
end;
$$;

create or replace function public.admin_listar_convites()
returns table (
  id uuid,
  dica text,
  observacao text,
  criado_em timestamptz,
  usado_em timestamptz,
  revogado_em timestamptz,
  usado_por_nome text,
  usado_por_numero bigint
)
language sql stable security definer set search_path = ''
as $$
  select c.id, c.dica, c.observacao, c.criado_em, c.usado_em, c.revogado_em, p.nome, p.numero_socio
  from public.convites c
  left join public.perfis p on p.id = c.usado_por
  where public.eh_dono()
  order by c.criado_em desc;
$$;

-- ---------------------------------------------------------------------
-- Dono: jogadores (só dados de jogo) e banimento
-- ---------------------------------------------------------------------
create or replace function public.admin_listar_jogadores()
returns table (
  id uuid,
  numero_socio bigint,
  nome text,
  aparencia jsonb,
  papel public.papel,
  status public.status_acesso,
  criado_em timestamptz,
  moedas bigint
)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.numero_socio, p.nome, p.aparencia, p.papel, p.status, p.criado_em,
         coalesce((select sum(l.valor) from public.moedas_lancamentos l where l.perfil_id = p.id), 0)::bigint
  from public.perfis p
  where public.eh_dono()
  order by p.numero_socio;
$$;

create or replace function public.definir_status_jogador(p_id uuid, p_status public.status_acesso)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_dono() then raise exception 'apenas_dono'; end if;
  if p_id = auth.uid() then raise exception 'nao_pode_alterar_a_si_mesmo'; end if;
  update public.perfis set status = p_status, atualizado_em = now() where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Permissões das funções
-- ---------------------------------------------------------------------

revoke execute on function public.salvar_aparencia(jsonb) from public, anon;
revoke execute on function public.gerar_convite(text) from public, anon;
revoke execute on function public.revogar_convite(uuid) from public, anon;
revoke execute on function public.admin_listar_convites() from public, anon;
revoke execute on function public.admin_listar_jogadores() from public, anon;
revoke execute on function public.definir_status_jogador(uuid, public.status_acesso) from public, anon;

grant execute on function public.salvar_aparencia(jsonb) to authenticated;
grant execute on function public.gerar_convite(text) to authenticated;
grant execute on function public.revogar_convite(uuid) to authenticated;
grant execute on function public.admin_listar_convites() to authenticated;
grant execute on function public.admin_listar_jogadores() to authenticated;
grant execute on function public.definir_status_jogador(uuid, public.status_acesso) to authenticated;

grant execute on function public.verificar_convite(text) to anon, authenticated;
grant execute on function public.nome_disponivel(text) to anon, authenticated;
