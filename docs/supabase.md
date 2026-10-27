# Ativar contas, convites, progresso e o painel do dono (Supabase)

Sem estes passos o site funciona, mas **sem contas**: tutorial, treino contra bots, coleção de baralhos
e progresso ficam abertos e salvos só no aparelho; `/entrar`, `/jogo` e `/admin` avisam que falta
conectar o banco. Leva uns 10 minutos.

## 1. Criar o banco e ligar na Vercel

Caminho mais curto, pela própria Vercel:

1. No projeto **poker-oficial** na Vercel: **Storage → Create Database → Supabase**.
2. Escolha a região **São Paulo (sa-east-1)** e conecte ao projeto (ambientes Production e Preview).
3. A integração cria sozinha as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Se preferir criar direto em [supabase.com](https://supabase.com), copie em **Project Settings → API** a URL
e a chave pública (*publishable* ou *anon*) e cadastre na Vercel (**Settings → Environment Variables**):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `..._ANON_KEY`) | a chave pública |

> **Nunca** cadastre a chave secreta (`service_role` / *secret key*) no site. Ele não precisa dela:
> tudo o que exige privilégio roda em funções do banco que conferem quem chamou.

## 2. Criar as tabelas (três migrações, nesta ordem)

No painel do Supabase: **SQL Editor → New query**. Para cada arquivo abaixo, cole o conteúdo inteiro,
clique em **Run** e espere o "Success" antes de passar para o próximo:

1. [`20261026120000_contas_convites_admin.sql`](../supabase/migrations/20261026120000_contas_convites_admin.sql): perfis, convites, moedas, banimento.
2. [`20261027120000_progressao_baralhos.sql`](../supabase/migrations/20261027120000_progressao_baralhos.sql): níveis, XP, baralhos e preferências na conta.
3. [`20261027130000_primeiro_acesso_dono.sql`](../supabase/migrations/20261027130000_primeiro_acesso_dono.sql): página de primeiro acesso do dono.

Com a [CLI do Supabase](https://supabase.com/docs/guides/cli) dá para fazer o mesmo com
`supabase link` + `supabase db push`.

## 3. Dizer quem é o dono

Ainda no SQL Editor, rode trocando pelo **seu** email (ele fica só no banco, não no repositório):

```sql
insert into public.configuracao (chave, valor)
values ('email_dono', 'seu-email@exemplo.com')
on conflict (chave) do update set valor = excluded.valor;
```

> Dica: guarde essa linha num arquivo `supabase/dono.local.sql`. Arquivos `*.local.sql` estão no
> `.gitignore` e nunca vão para o GitHub.

Faça o passo 5 logo em seguida: enquanto o dono não existe, quem souber esse email poderia criar a conta.

## 4. Ajustar a autenticação

Em **Authentication**:

- **Sign In / Providers → Email**: desligue **Confirm email**. O convite já prova quem é a pessoa, e o
  envio de email gratuito do Supabase é limitado. Deixe **Allow new users to sign up** ligado: quem barra
  cadastro sem convite é um gatilho no banco.
- **URL Configuration → Site URL**: `https://poker-oficial.vercel.app`.

## 5. Publicar de novo

Na Vercel, **Deployments → ⋯ → Redeploy** (variáveis novas só valem a partir de um deploy novo).

## 6. Criar a sua conta de dono pelo site

1. Abra `https://poker-oficial.vercel.app/primeiro-acesso` (também tem o link "Primeiro acesso" embaixo
   do formulário de `/entrar`).
2. A página mostra **"a vaga de dono está aberta"** quando os passos 2 e 3 deram certo.
3. Preencha seu nome na mesa, **o mesmo email do passo 3** e uma senha. Você cai direto no painel do dono.

Depois que o dono existe, essa página fica fechada para sempre. Outro email é recusado pelo banco.

Alternativa sem o site: **Authentication → Users → Add user → Create new user** com o email do passo 3 e
**Auto Confirm User** marcado. A conta nasce como dono, com o nome "Dono da mesa".

## 7. Gerar os códigos de acesso

1. Entre em `/entrar` com a conta de dono. No menu aparece **Admin**.
2. Em `/admin`, clique em **Gerar convite** (dá para pôr uma observação, como o nome do amigo).
3. O código aparece **uma única vez**, junto com uma mensagem pronta. Copie e mande para a pessoa.
4. Ela abre `/resgatar-convite`, cola o código, escolhe o nome na mesa e cria a conta.
5. Para tirar o acesso de alguém: **Banir** no card da pessoa (a sessão cai na próxima página que ela
   abrir). **Devolver acesso** desfaz. Convite não usado pode ser revogado na lista de convites.

## Como a segurança funciona

- O código do convite nunca é salvo: só o hash SHA-256. Por isso ele aparece uma única vez no painel.
- O gatilho `ao_criar_usuario` consome o convite na mesma transação do cadastro; código inválido, usado
  ou revogado desfaz a criação da conta. A única exceção é o email do dono, e só enquanto não há dono.
- `vaga_de_dono_aberta()` só responde verdadeiro ou falso: nunca revela o email configurado.
- Todas as tabelas têm RLS. Cada jogador lê só o próprio perfil e o próprio XP; o dono lê tudo pelas
  funções `admin_*`, que devolvem apenas dados de jogo (sem email).
- XP: o cliente manda **eventos** (ex.: "terminei o módulo mesa"), nunca "quanto XP ganhei". A função
  `registrar_evento_xp` decide o valor pela tabela `regras_xp`, recusa chave repetida, aplica tetos
  diários e requisitos. Nível é sempre calculado do XP total; baralho só equipa com nível suficiente.
  Regras completas em [`progresso-e-sincronizacao.md`](./progresso-e-sincronizacao.md).
- Moedas são um ledger: cada crédito ou débito é uma linha, e o saldo é a soma. Nenhum cliente escreve
  nessa tabela; quem vai creditar é o servidor de jogo, na fase das mesas online.
- O Supabase Free pausa o projeto depois de cerca de 7 dias sem uso. Basta entrar no painel e reativar;
  a mitigação automática (backup diário que também mantém o projeto ativo) está planejada para a fase 5.

## Conferir se deu certo

- `/primeiro-acesso` diz se o banco respondeu e se falta alguma migração.
- No SQL Editor: `select * from public.niveis order by nivel;` deve listar 30 níveis, e
  `select count(*) from public.catalogo_baralhos;` deve dar 21.
