# Ativar contas, convites e o painel do dono (Supabase)

Sem estes passos o site funciona, mas **sem contas**: o treino contra bots fica aberto para
qualquer um e `/entrar`, `/jogo` e `/admin` avisam que falta conectar o banco. Leva uns 10 minutos.

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

## 2. Criar as tabelas

No painel do Supabase: **SQL Editor → New query**, cole o conteúdo de
[`supabase/migrations/20261026120000_contas_convites_admin.sql`](../supabase/migrations/20261026120000_contas_convites_admin.sql)
e clique em **Run**.

## 3. Dizer quem é o dono

Ainda no SQL Editor, rode trocando pelo **seu** email (fica só no banco, não no repositório):

```sql
insert into public.configuracao (chave, valor) values ('email_dono', 'seu-email@exemplo.com');
```

## 4. Ajustar a autenticação

Em **Authentication**:

- **Sign In / Providers → Email**: desligue **Confirm email**. O convite já prova quem é a pessoa, e o
  envio de email gratuito do Supabase é limitado. Deixe **Allow new users to sign up** ligado: quem barra
  cadastro sem convite é um gatilho no banco.
- **URL Configuration → Site URL**: `https://poker-oficial.vercel.app`.

## 5. Criar a sua conta de dono

**Authentication → Users → Add user → Create new user**, com o mesmo email do passo 3, uma senha e
**Auto Confirm User** marcado. A conta nasce como dono, com o nome "Dono da mesa". Para trocar o nome:

```sql
update public.perfis set nome = 'Seu nome na mesa' where papel = 'dono';
```

## 6. Publicar de novo

Na Vercel, **Deployments → ⋯ → Redeploy** (variáveis novas só valem a partir de um deploy novo).

## 7. Usar

1. Entre em `/entrar` com a conta de dono e monte sua carteirinha.
2. Em `/admin`, clique em **Gerar convite** e mande a mensagem pronta para a pessoa.
3. Ela resgata em `/resgatar-convite`, escolhe o nome na mesa e já cai no criador de carteirinha.
4. Para tirar o acesso de alguém: **Banir** no card da pessoa. A sessão dela cai na próxima página que
   abrir. **Devolver acesso** desfaz.

## Como a segurança funciona

- O código do convite nunca é salvo: só o hash SHA-256. Por isso ele aparece uma única vez no painel.
- O gatilho `ao_criar_usuario` consome o convite na mesma transação do cadastro; código inválido, usado
  ou revogado desfaz a criação da conta.
- Todas as tabelas têm RLS. Cada jogador lê só o próprio perfil; o dono lê tudo pelas funções `admin_*`,
  que devolvem apenas dados de jogo (sem email).
- Moedas são um ledger: cada crédito ou débito é uma linha, e o saldo é a soma. Nenhum cliente escreve
  nessa tabela; quem vai creditar é o servidor de jogo, na fase das mesas online.
- O Supabase Free pausa o projeto depois de cerca de 7 dias sem uso. Basta entrar no painel e reativar;
  a mitigação automática (backup diário que também mantém o projeto ativo) está planejada para a fase 5.
