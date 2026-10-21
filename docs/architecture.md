# Decisões de arquitetura

Formato curto: contexto, decisão, consequência. Uma entrada por decisão relevante.

---

## ADR-001 · Monorepo com pnpm e Turborepo

- **Contexto:** web, game-server e pacotes compartilhados (motor, tipos, bots) precisam evoluir juntos.
- **Decisão:** pnpm 12 workspaces (`apps/*`, `packages/*`) + Turborepo 2 para orquestrar `dev`, `build`,
  `lint`, `typecheck` e `test`. Por enquanto só existe `apps/web`.
- **Consequência:** um `pnpm install` e um `pnpm dev` na raiz. Pacotes novos entram sem configuração extra.

## ADR-002 · TypeScript estrito com `noUncheckedIndexedAccess`

- **Contexto:** o motor de poker vai indexar arrays de assentos e cartas o tempo todo.
- **Decisão:** `tsconfig.base.json` na raiz com `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`
  e `noFallthroughCasesInSwitch`. Cada app estende essa base.
- **Consequência:** acesso por índice vira `T | undefined` e obriga a tratar o caso; um pouco mais de código,
  bem menos bug de "assento inexistente".

## ADR-003 · Tailwind CSS v4 com tema em CSS

- **Contexto:** o prompt pede Tailwind ou alternativa justificada.
- **Decisão:** Tailwind v4 com tokens no `@theme` de `globals.css` (cores `mesa`, `ouro`, `creme`, `tinta`,
  `papel`) e utilitários próprios (`conteiner`, `rotulo`, `pontilhado`, `friso`).
- **Consequência:** sem `tailwind.config`; trocar a identidade é editar um arquivo.

## ADR-004 · Identidade visual "clube de carteado"

- **Contexto:** a primeira versão tinha cara de template genérico (badges com brilho, gradiente dourado,
  grade de ícones).
- **Decisão:** referência de material impresso e mesa de jogo: feltro verde alternando com papel cartão,
  latão envelhecido em vez de dourado brilhante, Fraunces (títulos), Libre Franklin (texto) e IBM Plex Mono
  (rótulos). Peças com metáfora própria: cardápio da casa, carteirinha de sócio, regras emolduradas,
  conversa do grupo e convite picotado com carimbo.
- **Consequência:** o site tem personalidade e já define a linguagem visual da mesa e do lobby.

## ADR-005 · Animações sem biblioteca

- **Contexto:** o site pede bastante movimento, mas o bundle precisa ser leve (o jogo vai rodar no celular).
- **Decisão:** CSS para tudo (keyframes e `cqw` para a mesa escalar), um único componente cliente
  (`EfeitosGlobais`) com um `IntersectionObserver` compartilhado para revelar ao rolar, e o `<ViewTransition>`
  do React 19.3 para transições entre páginas (deslizar e "morph" do cartão de acesso).
- **Consequência:** as seções continuam Server Components e só marcam `data-revelar`. Tudo respeita
  `prefers-reduced-motion` e o conteúdo aparece mesmo sem JavaScript.

## ADR-006 · Formulários com Server Actions e zod, ainda sem autenticação

- **Contexto:** o usuário pediu só o site, sem o jogo; contas e convites são da fase 2.
- **Decisão:** `/entrar` e `/resgatar-convite` já usam Server Actions com validação zod no servidor e
  `useActionState`, mas respondem "em obras" depois de validar. Os pontos de integração estão marcados com
  `TODO(fase-2)` em `apps/web/src/app/(acesso)/acoes.ts`.
- **Consequência:** a fase 2 troca só o corpo das actions. Nenhuma chave do Supabase existe no web (e a
  chave secreta nunca vai existir lá).

## ADR-007 · Site fora dos buscadores

- **Contexto:** é um clube fechado.
- **Decisão:** `robots: { index: false, follow: false }` no layout raiz.
- **Consequência:** o site não aparece no Google. Reverter é uma linha, se um dia quiserem divulgar.

## ADR-008 · Ilustrações geradas por código

- **Contexto:** o prompt pede placeholders de personagem gerados por código e arquitetura pronta para arte real.
- **Decisão:** cartas em HTML/CSS e avatar em SVG por camadas (`fundo`, `corpo`, `cabeça`, `cabelo`,
  `acessório`) em `components/ilustracoes/avatar.tsx`.
- **Consequência:** o mesmo modelo de camadas pode ser reaproveitado no criador de personagem da fase 3.
