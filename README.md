# Poker entre Amigos

Mesa privada de Texas Hold'em No-Limit para um grupo fechado de amigos, direto no navegador.
Entrada só por convite, fichas 100% virtuais, voz no Discord por fora.

> **Estado atual:** site público, **treino offline contra bots** (`/treino`, do Fácil ao Extremo),
> contas por convite, lobby com carteirinha e **painel do dono** (`/admin`). Mesas online vêm depois.
> Para ativar as contas, siga [`docs/supabase.md`](docs/supabase.md). Progresso em [`docs/progresso.md`](docs/progresso.md).

## Rodando localmente

Requisitos: **Node 22.12+** e **pnpm 12**.

```bash
npm i -g pnpm@12
pnpm install
pnpm dev
```

O site abre em http://localhost:3000.

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o site em modo desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Gera os tipos de rota do Next e roda o `tsc` |
| `pnpm test` | Testes (Vitest) |
| `pnpm format` | Prettier |

Sem variáveis de ambiente o site roda sem contas (o treino fica aberto). Para contas e admin, veja
[`.env.example`](.env.example) e [`docs/supabase.md`](docs/supabase.md).

## Estrutura

```text
packages/
  poker-engine/     regras puras de Texas Hold'em, avaliador, side pots (com testes)
  bots/             bots fácil, médio, difícil e extremo
supabase/
  migrations/       tabelas, RLS e funções (convites, perfis, moedas, admin)
apps/
  web/              Next.js 16 (App Router), React 19, Tailwind v4
    src/app/        rotas: (site) = página inicial, (acesso) = entrar e resgatar convite
    src/components/ seções, ilustrações (mesa, cartas, avatar), formulários
    src/lib/        validação (zod) e utilitários, com testes
docs/
  requirements.md   consolidação do que entra ou não no jogo, conflitos e sugestões
  architecture.md   decisões de arquitetura (ADRs)
  briefing/         documentos originais do projeto
```

## Regras que não mudam

1. Fichas, prêmios e moeda cosmética são 100% virtuais. Não existe pagamento.
2. O servidor é a autoridade das partidas; o cliente só envia intenções.
3. Cartas fechadas nunca saem do servidor para quem não é dono delas.
4. A chave secreta do Supabase só existe no servidor de jogo.

> Dica: se o projeto estiver dentro do OneDrive, a sincronização do `node_modules` deixa tudo lento.
> Prefira uma pasta fora do OneDrive (ex.: `C:\dev\poker`).
