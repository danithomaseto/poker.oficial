-- =====================================================================
-- Progressão: XP por eventos (idempotente), níveis derivados do XP,
-- catálogo de baralhos, baralho equipado e preferências do jogador.
--
-- Regras espelham packages/progressao (um teste confere os valores).
-- O cliente nunca envia "quanto XP": envia o evento e o servidor calcula,
-- recusando chave repetida, tipo inválido e o que passar do teto diário.
-- O progresso do tutorial é derivado dos eventos "tutorial_modulo".
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabelas de referência (somente leitura para todos)
-- ---------------------------------------------------------------------
create table public.niveis (
  nivel integer primary key check (nivel between 1 and 30),
  xp_total integer not null unique check (xp_total >= 0),
  titulo text not null
);

insert into public.niveis (nivel, xp_total, titulo) values
  (1, 0, 'Novato'),
  (2, 40, 'Aprendiz'),
  (3, 140, 'Curioso do Flop'),
  (4, 310, 'Calouro da Mesa'),
  (5, 550, 'Leitor de Board'),
  (6, 870, 'Conta-Fichas'),
  (7, 1280, 'Paciente'),
  (8, 1780, 'Posicional'),
  (9, 2380, 'Caçador de Odds'),
  (10, 3080, 'Regular da Casa'),
  (11, 3880, 'Mão Firme'),
  (12, 4780, 'Disciplinado'),
  (13, 5790, 'Estrategista'),
  (14, 6910, 'Sangue Frio'),
  (15, 8150, 'Veterano'),
  (16, 9500, 'Leitor de Range'),
  (17, 10970, 'Calculista'),
  (18, 12560, 'Tubarão do Treino'),
  (19, 14270, 'Mestre do River'),
  (20, 16110, 'Lenda da Varanda'),
  (21, 18080, 'Dono do Botão'),
  (22, 20170, 'Blefe Calibrado'),
  (23, 22390, 'Fichas de Aço'),
  (24, 24750, 'Mesa Final'),
  (25, 27240, 'Craque do Clube'),
  (26, 29870, 'Olho de Lince'),
  (27, 32630, 'Coração Gelado'),
  (28, 35530, 'Grande Sócio'),
  (29, 38570, 'Quase Lenda'),
  (30, 41760, 'Mestre da Mesa');

create table public.regras_xp (
  tipo text primary key,
  xp integer not null check (xp > 0),
  limite_diario integer check (limite_diario > 0)
);

insert into public.regras_xp (tipo, xp, limite_diario) values
  ('tutorial_modulo', 60, null),
  ('tutorial_completo', 150, null),
  ('mao_treino', 3, 100),
  ('sessao_treino', 40, 3),
  ('objetivo_diario', 60, 1);

create table public.catalogo_baralhos (
  id text primary key,
  nivel_minimo integer not null check (nivel_minimo between 1 and 30),
  disponivel boolean not null default true
);

insert into public.catalogo_baralhos (id, nivel_minimo) values
  ('classico', 1), ('meia-noite', 1), ('esmeralda', 1), ('carmim', 1), ('oceano', 1),
  ('monocromo', 1), ('realeza', 1), ('circuito', 1), ('deserto', 1), ('aurora', 1),
  ('feltro', 3), ('art-deco', 5), ('cartografia', 8), ('vitral', 10), ('carvao', 13),
  ('jade', 15), ('safira', 18), ('obsidiana', 20), ('cobre', 23), ('luar', 25), ('mestres', 30);

alter table public.niveis enable row level security;
alter table public.regras_xp enable row level security;
alter table public.catalogo_baralhos enable row level security;
create policy "leitura pública" on public.niveis for select using (true);
create policy "leitura pública" on public.regras_xp for select using (true);
create policy "leitura pública" on public.catalogo_baralhos for select using (true);

-- ---------------------------------------------------------------------
-- Eventos de XP (ledger) e campos novos no perfil
-- ---------------------------------------------------------------------
create table public.xp_eventos (
  id uuid primary key, -- gerado no aparelho: reenviar o mesmo evento não duplica
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  tipo text not null references public.regras_xp (tipo),
  chave text not null check (char_length(chave) <= 100),
  xp integer not null check (xp between 0 and 1000),
  ocorrido_em timestamptz not null,
  registrado_em timestamptz not null default now(),
  unique (perfil_id, chave)
);
create index xp_eventos_por_dia on public.xp_eventos (perfil_id, tipo, ocorrido_em);
alter table public.xp_eventos enable row level security;
create policy "eventos próprios ou dono" on public.xp_eventos
  for select using (perfil_id = auth.uid() or public.eh_dono());
-- Sem política de insert/update/delete: só a função registrar_evento_xp escreve.

alter table public.perfis
  add column baralho text not null default 'classico' references public.catalogo_baralhos (id),
  add column preferencias jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------
-- Funções de leitura
-- ---------------------------------------------------------------------
create or replace function public.nivel_por_xp(p_xp integer)
returns integer
language sql stable set search_path = ''
as $$
  select coalesce(max(nivel), 1) from public.niveis where xp_total <= greatest(p_xp, 0);
$$;

create or replace function public.xp_do_perfil(p_perfil uuid)
returns integer
language sql stable security definer set search_path = ''
as $$
  select coalesce(sum(xp), 0)::integer from public.xp_eventos where perfil_id = p_perfil;
$$;
revoke execute on function public.xp_do_perfil(uuid) from public, anon, authenticated;

create or replace function public.meu_progresso()
returns table (xp_total integer, nivel integer, baralho text, preferencias jsonb, chaves text[])
language sql stable security definer set search_path = ''
as $$
  select public.xp_do_perfil(p.id),
         public.nivel_por_xp(public.xp_do_perfil(p.id)),
         p.baralho,
         p.preferencias,
         coalesce((select array_agg(e.chave order by e.registrado_em) from public.xp_eventos e where e.perfil_id = p.id), '{}')
  from public.perfis p
  where p.id = auth.uid() and p.status = 'ativo';
$$;

-- ---------------------------------------------------------------------
-- Registro de evento: valida tudo e é idempotente
-- ---------------------------------------------------------------------
create or replace function public.registrar_evento_xp(
  p_id uuid,
  p_tipo text,
  p_chave text,
  p_ocorrido_em timestamptz
)
returns table (aceito boolean, motivo text, xp_ganho integer, xp_total integer, nivel integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_regra public.regras_xp%rowtype;
  v_dia date;
  v_padrao text;
  v_qtd integer;
  v_motivo text := null;
begin
  if v_uid is null then raise exception 'sem_sessao'; end if;
  if not exists (select 1 from public.perfis where id = v_uid and status = 'ativo') then
    raise exception 'sem_acesso';
  end if;

  -- Um jogador por vez: impede duas requisições simultâneas de furarem o teto diário.
  perform pg_advisory_xact_lock(hashtext(v_uid::text));

  select * into v_regra from public.regras_xp where tipo = p_tipo;
  v_padrao := case p_tipo
    when 'tutorial_modulo' then '^tutorial:(mesa|objetivo|ranking|ordem|acoes|rodadas|pratica|vencedor|estrategia|desafio)$'
    when 'tutorial_completo' then '^tutorial:completo$'
    when 'mao_treino' then '^mao:[A-Za-z0-9-]{6,64}:[0-9]{1,6}$'
    when 'sessao_treino' then '^sessao:[A-Za-z0-9-]{6,64}$'
    when 'objetivo_diario' then '^diario:[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  end;
  v_dia := (p_ocorrido_em at time zone 'America/Sao_Paulo')::date;

  if v_regra.tipo is null then
    v_motivo := 'tipo_invalido';
  elsif p_chave is null or p_chave !~ v_padrao then
    v_motivo := 'chave_invalida';
  elsif p_ocorrido_em > now() + interval '5 minutes' or p_ocorrido_em < now() - interval '30 days' then
    v_motivo := 'fora_do_prazo';
  elsif exists (select 1 from public.xp_eventos where id = p_id or (perfil_id = v_uid and chave = p_chave)) then
    v_motivo := 'duplicado';
  else
    if v_regra.limite_diario is not null then
      select count(*) into v_qtd from public.xp_eventos
       where perfil_id = v_uid and tipo = p_tipo
         and (ocorrido_em at time zone 'America/Sao_Paulo')::date = v_dia;
      if v_qtd >= v_regra.limite_diario then v_motivo := 'limite_diario'; end if;
    end if;
    -- Requisitos que o servidor consegue conferir com o que já recebeu.
    if v_motivo is null and p_tipo = 'tutorial_completo' then
      select count(*) into v_qtd from public.xp_eventos where perfil_id = v_uid and tipo = 'tutorial_modulo';
      if v_qtd < 10 then v_motivo := 'requisito'; end if;
    elsif v_motivo is null and p_tipo = 'sessao_treino' then
      select count(*) into v_qtd from public.xp_eventos
       where perfil_id = v_uid and tipo = 'mao_treino'
         and chave like 'mao:' || substr(p_chave, 8) || ':%';
      if v_qtd < 15 then v_motivo := 'requisito'; end if;
    elsif v_motivo is null and p_tipo = 'objetivo_diario' then
      if substr(p_chave, 8) <> to_char(v_dia, 'YYYY-MM-DD') then
        v_motivo := 'chave_invalida';
      else
        select count(*) into v_qtd from public.xp_eventos
         where perfil_id = v_uid and tipo = 'mao_treino'
           and (ocorrido_em at time zone 'America/Sao_Paulo')::date = v_dia;
        if v_qtd < 30 then v_motivo := 'requisito'; end if;
      end if;
    end if;
  end if;

  if v_motivo is null then
    insert into public.xp_eventos (id, perfil_id, tipo, chave, xp, ocorrido_em)
    values (p_id, v_uid, p_tipo, p_chave, v_regra.xp, p_ocorrido_em);
  end if;

  return query
    select v_motivo is null,
           v_motivo,
           case when v_motivo is null then v_regra.xp else 0 end,
           public.xp_do_perfil(v_uid),
           public.nivel_por_xp(public.xp_do_perfil(v_uid));
end;
$$;

-- ---------------------------------------------------------------------
-- Baralho equipado e preferências (validados no servidor)
-- ---------------------------------------------------------------------
create or replace function public.equipar_baralho(p_baralho text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_minimo integer;
begin
  if v_uid is null then raise exception 'sem_sessao'; end if;
  select nivel_minimo into v_minimo from public.catalogo_baralhos where id = p_baralho and disponivel;
  if v_minimo is null then return false; end if;
  if public.nivel_por_xp(public.xp_do_perfil(v_uid)) < v_minimo then return false; end if;
  update public.perfis set baralho = p_baralho, atualizado_em = now() where id = v_uid and status = 'ativo';
  return found;
end;
$$;

create or replace function public.salvar_preferencias(p_preferencias jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  -- Só chaves conhecidas e booleanas/curtas: nada de JSON arbitrário no perfil.
  update public.perfis
     set preferencias = jsonb_strip_nulls(jsonb_build_object(
           'baralho4Cores', case when jsonb_typeof(p_preferencias -> 'baralho4Cores') = 'boolean' then p_preferencias -> 'baralho4Cores' end,
           'dicasTreino', case when jsonb_typeof(p_preferencias -> 'dicasTreino') = 'boolean' then p_preferencias -> 'dicasTreino' end,
           'avancoAutomatico', case when jsonb_typeof(p_preferencias -> 'avancoAutomatico') = 'boolean' then p_preferencias -> 'avancoAutomatico' end,
           'reduzirAnimacoes', case when jsonb_typeof(p_preferencias -> 'reduzirAnimacoes') = 'boolean' then p_preferencias -> 'reduzirAnimacoes' end,
           'velocidadeBots', case when p_preferencias ->> 'velocidadeBots' in ('normal', 'rapida') then p_preferencias -> 'velocidadeBots' end
         )),
         atualizado_em = now()
   where id = auth.uid() and status = 'ativo';
end;
$$;

-- ---------------------------------------------------------------------
-- Painel do dono: agora com XP e nível (continua sem dado pessoal)
-- ---------------------------------------------------------------------
drop function if exists public.admin_listar_jogadores();
create or replace function public.admin_listar_jogadores()
returns table (
  id uuid,
  numero_socio bigint,
  nome text,
  aparencia jsonb,
  papel public.papel,
  status public.status_acesso,
  criado_em timestamptz,
  moedas bigint,
  xp integer,
  nivel integer
)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.numero_socio, p.nome, p.aparencia, p.papel, p.status, p.criado_em,
         coalesce((select sum(l.valor) from public.moedas_lancamentos l where l.perfil_id = p.id), 0)::bigint,
         public.xp_do_perfil(p.id),
         public.nivel_por_xp(public.xp_do_perfil(p.id))
  from public.perfis p
  where public.eh_dono()
  order by p.numero_socio;
$$;

-- ---------------------------------------------------------------------
-- Permissões
-- ---------------------------------------------------------------------
revoke execute on function public.meu_progresso() from public, anon;
revoke execute on function public.registrar_evento_xp(uuid, text, text, timestamptz) from public, anon;
revoke execute on function public.equipar_baralho(text) from public, anon;
revoke execute on function public.salvar_preferencias(jsonb) from public, anon;
revoke execute on function public.admin_listar_jogadores() from public, anon;
grant execute on function public.meu_progresso() to authenticated;
grant execute on function public.registrar_evento_xp(uuid, text, text, timestamptz) to authenticated;
grant execute on function public.equipar_baralho(text) to authenticated;
grant execute on function public.salvar_preferencias(jsonb) to authenticated;
grant execute on function public.admin_listar_jogadores() to authenticated;
