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

## ADR-009 · Motor de poker como reducer puro em `packages/poker-engine`

- **Contexto:** a mesma regra precisa rodar no treino (navegador), nos bots e, depois, no servidor.
- **Decisão:** TypeScript puro, sem DOM nem Node: `iniciarMao` recebe o baralho já embaralhado,
  `aplicarAcao` devolve novo estado + eventos, `projetarParaJogador` é a única visão que sai do estado.
  Índices de jogador são posições no array ordenado por assento.
- **Consequência:** determinístico e reconstruível por entrada + ações. 48 testes, incluindo
  propriedades com fast-check (conservação de fichas, saldo nunca negativo, mão sempre termina,
  nenhuma visão com carta alheia). O avaliador faz ~2,4 milhões de mãos de 7 cartas por segundo.
- **Simplificação documentada:** vários all-ins curtos que somados dariam um aumento completo não
  reabrem a ação (só um aumento completo reabre).

## ADR-010 · Bots decidem só com a visão do próprio jogador

- **Contexto:** bot que lê o estado completo trapaceia.
- **Decisão:** `packages/bots` recebe `VisaoMao` + `AcoesValidas`. Fácil = aleatório ponderado; Médio =
  Chen + Monte Carlo curto + odds do pote; Difícil = Monte Carlo (900) + posição + tamanho de aposta;
  Extremo = Monte Carlo (1800) contra ranges estimados pelas ações, blefe com frequência controlada e
  adaptação por perfil (VPIP, agressão, desistência). No navegador rodam num Web Worker.
- **Consequência:** a dificuldade vem de decisão melhor, não de informação privilegiada.

## ADR-011 · Contas sem chave secreta no site

- **Contexto:** o briefing proíbe a chave `service_role` fora do servidor de jogo, que ainda não existe.
- **Decisão:** o site usa só a chave pública. Criar conta exige convite válido, garantido por um gatilho
  em `auth.users` que consome o convite na mesma transação. Ações do dono são funções
  `SECURITY DEFINER` que conferem `eh_dono()`. Banimento: `perfis.status`, checado no `proxy.ts`
  (encerra a sessão) e na camada `lib/sessao.ts` de cada página.
- **Consequência:** nada sensível no frontend. O cadastro público do Supabase fica ligado, mas sem
  convite a criação da conta é desfeita.

## ADR-012 · Treino aberto enquanto não há banco

- **Contexto:** o site já está publicado e o banco depende de configuração manual.
- **Decisão:** sem as variáveis do Supabase, `/treino` funciona para qualquer um (não há dado a proteger);
  com elas, exige jogador ativo. `/jogo` e `/admin` sempre exigem conta.
- **Consequência:** dá para testar o treino já; ao configurar o banco e publicar de novo, a proteção liga sozinha.
