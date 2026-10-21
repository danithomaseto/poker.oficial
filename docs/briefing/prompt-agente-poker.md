# Prompt para o agente de construção — Poker privado entre amigos

> Cole este documento inteiro no agente (ou salve como `docs/agent-brief.md` / `CLAUDE.md` na raiz do repositório e peça para ele ler).

---

## 1. Seu papel e como trabalhar

Você é o engenheiro principal deste projeto. Eu sou o dono do produto e também dev. Quero aprender com o código, então priorize clareza, tipagem forte e testes em vez de mágica.

Regras de trabalho:

1. **Trabalhe por fases** (seção 11). Nunca implemente mais de uma fase por vez.
2. **No início de cada fase**, apresente um plano curto com arquivos a criar ou alterar, decisões e riscos. Espere minha confirmação antes de escrever o código.
3. **No fim de cada fase**, entregue:
   - o código;
   - os testes, passando;
   - os comandos para rodar localmente;
   - as variáveis de ambiente necessárias, com um `.env.example` atualizado;
   - o checklist dos critérios de conclusão marcado;
   - o que ficou pendente ou foi simplificado.
4. **Pare e pergunte** quando uma decisão não estiver coberta aqui ou contrariar este documento. Não invente requisito.
5. Commits pequenos, com mensagens no padrão Conventional Commits.
6. TypeScript em modo `strict` em todo o monorepo. Proibido `any` sem justificativa em comentário.
7. Documente decisões relevantes em `docs/architecture.md` (formato ADR curto: contexto, decisão, consequência).

---

## 2. Visão do produto

Jogo web **privado** de **Texas Hold'em No-Limit** para um grupo fechado de amigos. Abre no navegador, sem instalar nada.

- O domínio tem um site público com explicação, login e resgate de convite. Depois de autenticado e autorizado, o jogador entra em `/jogo`.
- Entrada só por **convite individual de uso único**.
- Cada jogador tem um **personagem 2D** (nome exibido e aparência), mostrado no lobby e ao lado do assento na mesa.
- Mesas com **até 9 lugares**, e **várias mesas simultâneas** (pós-MVP).
- **Chat de texto** na mesa. A voz fica no **Discord**, usado por fora, sem nenhuma integração.
- **Treino offline** contra bots com dificuldade de fácil a extrema, mais um tutorial.
- **Moeda cosmética** ganha jogando, para comprar roupas e itens na loja (pós-MVP).
- Prioridade de custo: **zero** no protótipo e baixo no grupo fechado.

---

## 3. Restrições inegociáveis

1. **Fichas, prêmios e moeda cosmética são 100% virtuais.** Nada é comprado com dinheiro real, sacado, transferido entre jogadores ou trocado por valor real. Não crie nenhum fluxo de pagamento.
2. **O servidor é a autoridade das partidas online.** O cliente só envia *intenções* (ex.: "quero apostar 200"). O servidor valida, aplica e transmite o resultado.
3. **Cartas ocultas nunca saem do servidor para quem não é dono delas.** Espectadores nunca recebem cartas privadas. O baralho e a semente do embaralhamento nunca são enviados ao cliente nem ficam legíveis pelo cliente no banco.
4. A chave `service_role` do Supabase existe **apenas** no servidor de jogo. Nunca no frontend nem no repositório.
5. HTTPS/WSS em qualquer ambiente hospedado.
6. Personagem, itens e moeda cosmética **não afetam** cartas, fichas, regras ou resultados.
7. Resultados do treino offline **nunca** entram nas contas online.

---

## 4. Stack e decisões de arquitetura

| Camada | Escolha |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js (App Router), React, TypeScript, hospedado na Vercel |
| Estilo | Tailwind CSS (ou outra escolha justificada no plano da fase 0) |
| Auth | Supabase Auth (email e senha) |
| Banco | Supabase PostgreSQL, região `sa-east-1` (São Paulo), com RLS em todas as tabelas |
| Servidor de jogo | NestJS + Socket.IO (gateways WebSocket), TypeScript, numa VM Linux |
| Motor de regras | Pacote TypeScript puro, sem dependência de Node, navegador ou framework |
| Testes | Vitest (unidade), Playwright (e2e no web) |
| Dev local | Supabase CLI (stack local) + Docker Compose para o game-server |
| Deploy da VM | Docker Compose com game-server + Caddy (TLS automático para WSS) |
| CI | GitHub Actions: lint, typecheck, testes e build |

Notas:

- **Escala:** comece com **uma instância** do game-server. Redis e múltiplas instâncias só se as conexões exigirem; não implemente isso agora.
- **WebSocket:** fica na VM, não na Vercel, porque as mesas precisam de estado contínuo.
- **Futuro desktop (Tauri):** mantenha o motor e a UI desacoplados de APIs específicas do navegador para não gerar retrabalho. Não implemente agora.
- **Supabase Free:** o projeto pausa após cerca de 1 semana sem atividade. Documente isso no README do deploy e proponha uma mitigação simples na fase de deploy.

---

## 5. Estrutura do repositório

```text
poker-amigos/
  apps/
    web/            # Next.js: site público, login, convite, jogo, treino, admin
    game-server/    # NestJS: autorização, mesas, partidas, chat, WebSocket autoritativo
  packages/
    poker-engine/   # regras puras, avaliador de mãos, side pots, reducer de estado
    shared-types/   # contratos de mensagens (com validação zod) e tipos compartilhados
    bots/           # estratégias de bot (rodam no navegador via Web Worker e opcionalmente no servidor)
    ui/             # componentes compartilhados, só se fizer sentido
  infra/
    local/          # docker-compose de dev, seeds
    deploy/         # docker-compose de produção, Caddyfile, scripts de backup
  supabase/
    migrations/     # SQL versionado + políticas RLS
  docs/
    requirements.md
    architecture.md
    security.md
    protocol.md     # todas as mensagens WebSocket documentadas
```

Rotas do web: `/`, `/entrar`, `/resgatar-convite`, `/jogo` (lobby), `/jogo/mesa/[id]`, `/jogo/personagem`, `/treino`, `/tutorial`, `/admin`.

---

## 6. Motor de poker (`packages/poker-engine`)

Esta é a peça mais importante. Ela precisa ser **pura, determinística e exaustivamente testada**.

### 6.1 Modelo

- O motor é um **reducer puro**: `aplicarAcao(estado, acao) => { estado, eventos }`. Sem I/O, sem relógio, sem `Math.random`.
- A aleatoriedade entra de fora: o servidor gera o baralho embaralhado e o passa no evento de início da mão.
- `obterAcoesValidas(estado, assento)` retorna quais ações e quais limites de valor são permitidos naquele momento.
- `projetarParaJogador(estado, assento | 'espectador')` gera a **visão filtrada** do estado. É a única forma de estado que pode sair do servidor.
- Toda mão pode ser reconstruída a partir de: configuração da mesa + baralho + lista ordenada de ações. Use isso para recuperação após falha e para replays.

### 6.2 Regras que precisam estar corretas (com testes para cada uma)

- Blinds pequeno e grande; ante opcional (desligado por padrão).
- Botão avança para o próximo jogador ativo a cada mão. Jogador que senta entra na próxima mão. Use uma regra simples e documentada para blinds de quem entra; não implemente "dead button" no MVP.
- **Heads-up:** o botão posta o small blind, age primeiro no pré-flop e por último no pós-flop.
- Ordem de ação: pré-flop começa à esquerda do big blind; pós-flop, no primeiro jogador ativo à esquerda do botão.
- Ações: fold, check, call, bet, raise, all-in.
- **Raise mínimo** = tamanho da última aposta ou raise completo da rodada (no mínimo o big blind).
- **All-in menor que um raise completo não reabre a ação** para quem já agiu naquela rodada.
- **Side pots:** monte por níveis de contribuição. Fichas de quem desistiu ficam nos potes, mas essa pessoa não concorre a eles. Cada pote é decidido separadamente entre os elegíveis.
- **Empate e ficha ímpar:** divide igualmente; a ficha que sobra vai ao primeiro vencedor à esquerda do botão.
- Quando não houver mais apostas possíveis (todos all-in, ou só um jogador com fichas), o board é distribuído até o river automaticamente.
- Se todos desistirem, o último jogador ganha sem mostrar as cartas.
- **Showdown no MVP:** revelar todas as mãos que chegaram ao showdown. A opção de "muck" fica para depois.
- Queima de carta antes de flop, turn e river (para fidelidade e replay).

### 6.3 Avaliador de mãos

- Avalia a melhor mão de 5 cartas dentre 7 e compara mãos, incluindo kickers.
- Precisa ser rápido o bastante para simulações Monte Carlo dos bots. Inclua um benchmark simples no pacote.
- Testes com vetores conhecidos de todas as categorias, desempates por kicker, a "roda" (A-2-3-4-5) e board jogando.

### 6.4 Testes obrigatórios

- Testes unitários para cada regra da seção 6.2.
- Testes de propriedade (fast-check): conservação de fichas (soma total nunca muda), nenhum jogador com saldo negativo e mão sempre terminando.
- Cenários de side pot com 3, 4 e 5 all-ins de tamanhos diferentes.

---

## 7. Servidor de jogo (`apps/game-server`)

- **Embaralhamento:** Fisher-Yates com CSPRNG (`crypto.randomInt`). Nunca `Math.random`.
- **Um controlador por mesa** processa as ações **em sequência** (fila por mesa). Nada de condições de corrida entre ações simultâneas.
- **Handshake do WebSocket:** valide o JWT do Supabase e confira no banco se a conta continua autorizada (não revogada). Revalide em eventos sensíveis e desconecte imediatamente quem for revogado.
- **Validação de entrada:** toda mensagem do cliente é validada com os schemas zod de `shared-types`. Mensagem inválida é rejeitada com código de erro, sem derrubar a mesa.
- **Timer de ação:** padrão de 30 s, configurável pelo anfitrião. Ao estourar, faz check se possível; senão, fold.
- **Desconexão:** o assento fica reservado por um tempo configurável (padrão de 3 min). Nesse período, aplica-se check ou fold automático na vez do jogador. Na reconexão, o jogador recebe a projeção atual do estado.
- **Persistência:** grave o início de cada mão (configuração, assentos, pilhas, baralho) e cada ação aceita. Se o processo reiniciar, recupere as mesas reconstruindo pelo log.
- **Chat:** mensagens de texto por mesa, com limite de tamanho, rate limit por usuário e filtro de conteúdo impróprio.
- **Rate limit** de ações e mensagens por conexão.
- **Logs** estruturados (JSON) e endpoint `/health`.

### 7.1 Protocolo (documentar em `docs/protocol.md`)

Exemplos mínimos (refine no plano da fase de mesa online):

- Cliente → servidor: `mesa:entrar`, `mesa:sentar`, `mesa:levantar`, `mao:acao { tipo, valor? }`, `chat:enviar`.
- Servidor → cliente: `mesa:estado` (projeção filtrada), `mao:evento`, `mao:suasCartas` (só para o dono), `chat:mensagem`, `erro { codigo, mensagem }`.
- Toda mensagem carrega versão do protocolo e, quando aplicável, número de sequência do estado, para o cliente detectar dessincronização e pedir o estado completo.

---

## 8. Dados (Supabase / PostgreSQL)

Proponha o schema na fase correspondente. O mínimo esperado:

- `profiles`: id (= auth.users.id), nome exibido, aparência do avatar (JSON validado), status de acesso (ativo/revogado), papel (owner/jogador), datas.
- `invites`: código (guardar **hash**), criado por, criado em, consumido por, consumido em, revogado.
- `tables`: configuração da mesa (blinds, lugares, timer, anfitrião, status).
- `hands`: mesa, número da mão, snapshot inicial, baralho (**acesso só pelo servidor**), resultado.
- `hand_actions`: mão, sequência, assento, ação, valor, timestamp.
- `chat_messages`: só se formos guardar histórico. Defina retenção.
- Pós-MVP: `cosmetic_items`, `inventory`, `wallet_ledger`.

Regras:

- **RLS ligado em todas as tabelas.** O cliente lê só o que é seu ou público. `hands.deck` e qualquer dado secreto ficam inacessíveis ao cliente.
- **Moeda cosmética como ledger**: cada crédito e débito é uma linha; o saldo é derivado. Escrita apenas pelo servidor.
- Migrações versionadas em `supabase/migrations`.
- Backup: script de exportação diária criptografada, guardada fora da VM.

---

## 9. Convites e acesso

1. O owner gera códigos individuais no `/admin`.
2. O convidado acessa `/resgatar-convite`, informa o código e cria uma conta com email e senha.
3. O backend consome o código **uma única vez**, numa transação, e o vincula permanentemente ao ID do usuário. O código consumido não pode ser reutilizado nem transferido.
4. No login e no handshake do WebSocket, o servidor confirma que a conta continua autorizada.
5. Revogar o acesso bloqueia a conta imediatamente, inclusive em conexões abertas.

---

## 10. Personagem 2D e cosméticos

- No primeiro acesso a `/jogo`, uma conta sem personagem vai para `/jogo/personagem`.
- **Para reduzir fricção:** o criador abre com uma aparência padrão já selecionada (ou um botão "aleatório"). A única coisa obrigatória é **definir um nome exibido válido**. Um clique em "Entrar no lobby" já resolve.
- Aparência em **camadas** (base, cabelo, roupa, acessório e cores), renderizada por composição de sprites ou SVG. No MVP, use **placeholders simples gerados por código** (formas e cores) e deixe a arquitetura pronta para trocar por arte real.
- Nome exibido: de 3 a 20 caracteres, com filtro de conteúdo impróprio e **único no grupo** (sem diferenciar maiúsculas e minúsculas).
- O jogador pode editar o personagem depois.
- **Loja e moeda (pós-MVP):**
  - a moeda é ganha por mãos jogadas em mesas com pelo menos 2 humanos;
  - limite diário de ganho para impedir farm;
  - todas as compras e recompensas são registradas e validadas no servidor;
  - o saldo da moeda é totalmente separado das fichas de poker.

---

## 11. Fases

Cada fase termina com o checklist de critérios marcado. **Não avance sem minha confirmação.**

### Fase 0 — Fundação
Monorepo, TS strict, lint e format, Vitest, CI no GitHub Actions, Supabase CLI local, docker-compose de dev, README de setup, esqueleto dos docs.
**Pronto quando:** `pnpm install && pnpm dev` sobe web e game-server localmente; a CI passa.

### Fase 1 — Motor de poker
Tudo da seção 6, mais uma mesa **local** no web (hotseat ou contra bot aleatório) para jogar mãos completas.
**Pronto quando:** todos os testes da 6.4 passam e consigo jogar mãos completas com side pots no navegador.

### Fase 2 — Contas, convites e admin
Seção 9, com o painel `/admin` (gerar, listar e revogar convites; listar e revogar usuários) e o site público com `/`, `/entrar` e `/resgatar-convite`.
**Pronto quando:** consigo convidar alguém, essa pessoa cria a conta, e, ao revogar, ela perde o acesso na hora.

### Fase 3 — Perfil e personagem
Seção 10, sem loja e sem moeda.
**Pronto quando:** o primeiro acesso exige nome, a aparência padrão funciona, a edição posterior funciona e o avatar aparece no lobby.

### Fase 4 — Mesa online autoritativa (uma mesa)
Seção 7 completa para uma mesa: entrar, sentar, jogar, timer, desconexão e reconexão, chat, avatar no assento e controles básicos do anfitrião (iniciar, pausar, configurar blinds e timer).
**Pronto quando:** 3 ou mais navegadores jogam uma sessão completa; derrubar e reconectar um cliente não quebra a mão; reiniciar o servidor recupera a mesa; nenhum cliente recebe cartas alheias (com teste automatizado provando isso).

### Fase 5 — Deploy de teste fechado (gate do MVP)
Frontend na Vercel (`*.vercel.app`) e game-server na VM com Docker Compose + Caddy (WSS), apontando para o Supabase em `sa-east-1`. Ambientes separados de dev e teste fechado. Inclui firewall, backup, healthcheck e alerta simples de indisponibilidade, além de um guia passo a passo de deploy na Oracle Cloud Always Free e alternativa em VPS de São Paulo.
**Pronto quando:** os amigos jogam remotamente; medimos a latência; o runbook de deploy está em `docs/`.

> **MVP termina aqui.** Depois do teste com amigos, revisamos as prioridades abaixo.

### Fase 6 — Várias mesas, espectadores e moderação
Lobby com várias mesas, espectadores (sem cartas privadas), moderação de chat e de jogadores pelo anfitrião.

### Fase 7 — Moeda cosmética, loja e inventário
Ledger, recompensas com limite diário, loja, inventário e itens equipáveis no avatar.

### Fase 8 — Treino offline, bots e tutorial
- `/treino` roda o motor e os bots **inteiramente no navegador**, com bots num Web Worker.
- PWA com service worker que faz cache da interface e do motor. **O treino offline não exige autorização**, porque não toca em dados online.
- Avisar que o cache do navegador pode ser limpo.
- Dificuldades dos bots:
  - **Fácil:** decisões aleatórias ponderadas.
  - **Médio:** força da mão + pot odds.
  - **Difícil:** equity por Monte Carlo + posição + dimensionamento de aposta.
  - **Extremo:** o anterior + estimativa de range do oponente, blefes com frequência controlada e adaptação ao estilo do adversário. "Extremo" significa desafio avançado, sem prometer nível profissional.
- Tutorial interativo usando cenários roteirizados do próprio motor.

### Fase 9 — Acabamento
Histórico de mãos com replay, resumo de sessão, acessibilidade (teclado, contraste, leitores de tela nas ações principais), temas e site público final.

---

## 12. Fora do escopo (não implementar)

- Qualquer pagamento, compra com dinheiro real, saque ou troca de valor.
- Integração com Discord ou voz dentro do jogo.
- App desktop (Tauri) ou mobile nativo.
- Redis e múltiplas instâncias do game-server.
- Torneios (MTT/SNG). Por ora, só cash game com fichas virtuais.

---

## 13. Perguntas em aberto (me pergunte quando chegar a hora)

- Fichas iniciais por jogador e regra de recompra (por mesa, por sessão, ilimitada a critério do anfitrião?).
- Retenção do histórico de chat e de mãos.
- Valores exatos da moeda cosmética (quanto ganha por mão, limite diário, preços).
- Provedor final da VM (Oracle Always Free vs. VPS em São Paulo), depois de medir latência e disponibilidade.

---

## 14. Referências

- Next.js PWA: https://nextjs.org/docs/app/guides/progressive-web-apps
- Service Workers (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- NestJS WebSocket gateways: https://docs.nestjs.com/websockets/gateways
- Supabase regiões: https://supabase.com/docs/guides/platform/regions
- Supabase preços e limites: https://supabase.com/pricing
- Vercel Hobby: https://vercel.com/docs/plans/hobby
- Oracle Always Free: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- Oracle Always Free FAQ: https://www.oracle.com/cloud/free/faq/
- Vultr São Paulo: https://blogs.vultr.com/Ol-Brasil-Vultrs-20th-Cloud-Location-is-in-So-Paulo

---

**Comece pela Fase 0: me apresente o plano dela e aguarde minha confirmação.**
