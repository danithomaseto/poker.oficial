-- =====================================================================
-- Primeiro acesso do dono
--
-- A página /primeiro-acesso cria a conta do dono pelo próprio site, sem convite. Quem decide
-- se a conta vira "dono" continua sendo o gatilho ao_criar_usuario (migração de contas): o
-- email precisa ser igual a configuracao.email_dono e ainda não pode existir um dono.
--
-- Esta função só diz SE a vaga está aberta, sem revelar o email configurado. Depois que o
-- dono existe, ela passa a responder false para sempre e a página some com o formulário.
-- =====================================================================

create or replace function public.vaga_de_dono_aberta()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.configuracao where chave = 'email_dono')
     and not exists (select 1 from public.perfis where papel = 'dono');
$$;

revoke execute on function public.vaga_de_dono_aberta() from public;
grant execute on function public.vaga_de_dono_aberta() to anon, authenticated;
