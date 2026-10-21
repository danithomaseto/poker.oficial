# Consolidação de requisitos

> Junta o `prompt-agente-poker.md` e o `arquitetura-e-infra-poker-privado.md` (cópias em
> [`docs/briefing/`](briefing/)) num lugar só: o que entra no jogo, o que fica para depois, o que
> não entra, onde os dois documentos se contradizem e o que eu acrescentaria ou tiraria.
>
> Legenda das recomendações: **✅ fazer**, **🕒 depois do MVP**, **❌ não fazer**, **❓ você decide**.

---

## 1. O produto em uma frase

Mesa privada de **Texas Hold'em No-Limit** para um grupo fechado de amigos, aberta no navegador,
com entrada só por convite, personagem 2D, chat de texto, fichas 100% virtuais e servidor
autoritativo. A voz fica no Discord, por fora.

## 2. O que já está pronto

O **site público** (`apps/web`), sem o jogo:

| Rota | Estado |
|---|---|
| `/` | Página inicial completa: mesa animada, como entrar, cardápio de recursos, demo da carteirinha (personagem), ranking de mãos interativo, regras da casa, perguntas e convite final. |
| `/entrar` | Formulário com validação no servidor (Server Action + zod). Ainda não autentica: responde "em obras" até a fase 2. |
| `/resgatar-convite` | Formulário com código formatado, medidor de força da senha e validação. Ainda não cria conta. |
| 404 | Página própria. |

Também já existem: monorepo pnpm + Turborepo, TypeScript `strict` (com `noUncheckedIndexedAccess`),
ESLint, Prettier, Vitest (20 testes dos schemas e utilitários) e build estático passando.

---

## 3. Escopo do jogo, fase a fase

### MVP (fases 0 a 5): termina no teste fechado com os amigos

| # | Item | Fase | Decisão |
|---|---|---|---|
| 1 | Monorepo completo: `game-server`, `poker-engine`, `shared-types`, CI no GitHub Actions, Supabase CLI, Docker Compose de dev | 0 | ✅ (parte já feita, ver §9) |
| 2 | Motor de regras puro (reducer `aplicarAcao`, `obterAcoesValidas`, `projetarParaJogador`) | 1 | ✅ |
| 3 | Regras: blinds, ante opcional, botão, heads-up, ordem de ação, raise mínimo, all-in incompleto que não reabre, side pots, ficha ímpar, run-out automático, vitória por desistência, showdown revelando tudo, queima de carta | 1 | ✅ |
| 4 | Avaliador 7→5 cartas com benchmark | 1 | ✅ |
| 5 | Testes de propriedade (conservação de fichas, sem saldo negativo, mão sempre termina) e side pots com 3, 4 e 5 all-ins | 1 | ✅ |
| 6 | Mesa local no navegador (hotseat ou bot aleatório) | 1 | ✅ |
| 7 | Convite individual de uso único, consumido em transação | 2 | ✅ |
| 8 | `/admin`: gerar, listar e revogar convites; listar e revogar usuários | 2 | ✅ |
| 9 | Revogação imediata, inclusive em conexões abertas | 2 | ✅ |
| 10 | Perfil, criador de personagem no primeiro acesso, nome único, edição posterior | 3 | ✅ |
| 11 | Mesa online autoritativa (uma mesa): entrar, sentar, jogar, timer, desconexão/reconexão, chat, avatar no assento, controles do anfitrião | 4 | ✅ |
| 12 | Persistência do início da mão + ações, recuperação após reinício | 4 | ✅ |
| 13 | Teste automatizado provando que nenhum cliente recebe carta alheia | 4 | ✅ |
| 14 | Deploy: Vercel + VM (Docker Compose + Caddy/WSS) + Supabase `sa-east-1`, firewall, backup, healthcheck, alerta, runbook | 5 | ✅ |

### Depois do MVP

| Item | Fase | Decisão |
|---|---|---|
| Várias mesas, lobby, espectadores, moderação | 6 | 🕒 |
| Moeda cosmética (ledger), recompensa com limite diário, loja, inventário | 7 | 🕒 |
| Treino offline com bots (fácil → extremo) em Web Worker, PWA, tutorial | 8 | 🕒 |
| Histórico com replay, resumo de sessão, acessibilidade, temas | 9 | 🕒 |

### Fora do escopo (os dois documentos concordam)

❌ pagamento ou qualquer troca por valor real · ❌ integração com Discord ou voz no jogo ·
❌ app desktop (Tauri) ou mobile nativo · ❌ Redis e múltiplas instâncias · ❌ torneios (MTT/SNG).

---

## 4. Onde os dois documentos se contradizem

| # | Tema | Arquitetura diz | Prompt diz | Minha recomendação |
|---|---|---|---|---|
| 1 | Ordem das fases | Bots e tutorial logo no passo 2; loja (passo 5) **antes** da mesa online (passo 6) | Treino é a fase 8 e loja a fase 7, ambas **depois** do MVP | Seguir o **prompt**: a mesa online é o que o grupo quer usar; bots e loja não bloqueiam ninguém. |
| 2 | Treino offline | "Autorização local assinada e limitada" após o primeiro login | "O treino offline **não exige** autorização" | Sem autorização. O treino não toca em dado online, então não há o que proteger; assinar token local só adiciona complexidade. |
| 3 | Nome único | "Definir se precisa ser único" | Único, sem diferenciar maiúsculas | Único, ignorando maiúsculas **e acentos** (`unaccent` + `lower`), com `trim` e espaços colapsados. "João" e "joao" na mesma mesa confunde. |
| 4 | Quem consome o convite | O servidor NestJS cuida de convites | "O backend consome o código"; a chave `service_role` só existe no game-server | Ver §5.1: criar a conta pelo **game-server** com o cadastro público do Supabase desligado. |
| 5 | Banco no dev local | PostgreSQL local no Docker Compose | Supabase CLI (stack local) | **Supabase CLI**: já traz Auth, RLS e Studio iguais aos da nuvem. |
| 6 | Ambientes | Dev, teste fechado **e produção** | Dev e teste fechado | Dev e teste fechado no MVP. O plano gratuito do Supabase permite só **2 projetos ativos**, então um terceiro ambiente já custaria. |
| 7 | Endereço do WSS | — | Frontend em `*.vercel.app` e Caddy com TLS automático na VM | O Caddy precisa de um **nome de domínio** apontando para a VM para emitir o certificado; `vercel.app` não serve. Opções em §5.4. |

---

## 5. Decisões que preciso de você (com sugestão)

### 5.1 Criação de conta pelo convite ❓

1. **(Recomendado)** Desligar "Allow new users to sign up" no Supabase. O site envia código + email + senha
   para um endpoint HTTP do game-server, que valida e consome o convite numa transação e cria o usuário
   pela Admin API. Ninguém consegue criar conta sem convite, nem chamando a API do Supabase direto.
2. Cadastro público + função `resgatar_convite()` (security definer) chamada logo depois. Mais simples,
   mas deixa contas "órfãs" sem convite (sem acesso, porém existindo).
3. Hook do Supabase Auth "before user created" validando o código. Elegante, mas confirmar disponibilidade
   no plano gratuito antes.

### 5.2 Email e recuperação de senha ❓

O SMTP embutido do Supabase é só para testes: tem limite baixo de envio e só entrega para endereços da
equipe do projeto. Sugestão: **desligar a confirmação de email** (o convite já prova quem é a pessoa) e
oferecer "redefinir senha" pelo `/admin` (o dono gera um link). Se quiser recuperação por email, configurar
um SMTP gratuito (Resend ou Brevo).

### 5.3 Perguntas que o próprio prompt deixou em aberto (§13)

| Pergunta | Sugestão |
|---|---|
| Fichas iniciais e recompra | 10.000 fichas ao sentar (100 big blinds com blinds 50/100). Recompra liberada pelo anfitrião, sempre registrada no histórico. |
| Retenção do chat | Não guardar no MVP (só em memória durante a mesa). Se guardar, 30 dias. |
| Retenção das mãos | 180 dias. Cabe folgado nos 500 MB do Supabase Free para um grupo pequeno. |
| Valores da moeda cosmética | Decidir na fase 7, depois de ver quantas mãos o grupo joga por semana. |
| Provedor da VM | Decidir na fase 5, depois de medir latência (ver §6, infraestrutura). |

### 5.4 Domínio para o WSS ❓

- **DuckDNS** (subdomínio grátis) + Caddy: custo zero.
- **Domínio próprio** `.com.br` (por volta de R$ 40/ano): mais estável e serve também para o site.
- **Cloudflare Tunnel**: dispensa abrir portas e o Caddy, funciona até atrás de CGNAT, mas exige o domínio
  na Cloudflare.

### 5.5 Outras

- **Nome do produto**: "Poker entre Amigos" é provisório (trocar em `apps/web/src/config/site.ts`).
- **Tamanho do grupo**: quantas pessoas no total? Muda limites de rate limit e o dimensionamento da VM.
- **Celular**: a mesa precisa funcionar no celular já no MVP? Eu recomendo que sim (ver §6).

---

## 6. Melhorias que eu colocaria

### Segurança e confiança

| Melhoria | Por quê | Fase |
|---|---|---|
| Cadastro público desligado no Supabase (§5.1) | Fecha a porta de criar conta sem convite. | 2 |
| Revogar também via `ban` do Supabase Auth, além do status no perfil | O JWT continua válido até expirar; o ban invalida o refresh token. O status no banco cobre o WebSocket. | 2 |
| Conferir o status da conta no `proxy.ts` (o antigo middleware do Next 16) para `/jogo` e `/admin` | Revogado não abre nem a página. | 2 |
| Baralho **criptografado** na tabela `hands` com chave que só o game-server tem | RLS protege do cliente, mas quem tiver acesso ao painel do banco ainda leria o baralho. Defesa em camadas. | 4 |
| Nunca registrar cartas fechadas ou baralho nos logs (redação automática) | Log vazado não pode virar vazamento de mão. | 4 |
| `idAcao` (UUID) em toda intenção do cliente | Evita aposta duplicada quando a conexão cai e o cliente reenvia. | 4 |
| Teste de vazamento que inspeciona **todas** as mensagens de **todos** os sockets numa mão simulada | Prova o requisito mais importante de forma automática, inclusive para espectadores. | 4 |
| Nenhuma tela ou endpoint que mostre cartas ao vivo, nem para o dono | Ver §7. | sempre |

### Jogo e experiência

| Melhoria | Por quê | Fase |
|---|---|---|
| Mesa responsiva em modo retrato no celular | Muita gente vai jogar no celular com o Discord aberto no PC. | 4 |
| Botões "ausente" e "sair depois desta mão" | Essencial em mesa de amigos: alguém sempre vai buscar uma cerveja. | 4 |
| Banco de tempo além dos 30 s por ação | Evita fold automático numa decisão difícil sem travar a mesa. | 4 |
| Aviso de "sua vez" com a aba em segundo plano (título piscando, som opcional) | Quem está no Discord em outra janela perde a vez. | 4 |
| Sons e animações de fichas e cartas, com opção de desligar | O site já tem a base de animação; na mesa isso dá vida. | 4 |
| Reações rápidas na mesa (emojis curtos, com limite) | Zoeira sem poluir o chat. Pode virar item da loja depois. | 6 |
| Avatares em camadas de uma biblioteca aberta (ex.: DiceBear), conferindo a licença de cada estilo | Sai do placeholder rápido sem depender de artista. | 3 |
| Testes e2e com 3 contextos de navegador no Playwright | É o critério de pronto da fase 4. | 4 |

### Infraestrutura e custo

| Melhoria | Por quê | Fase |
|---|---|---|
| GitHub Actions diário fazendo `pg_dump` criptografado (age/GPG) e guardando fora da VM | Resolve o backup **e** mantém o Supabase Free ativo (ele pausa após cerca de 7 dias sem uso). | 5 |
| Oracle: escolher **São Paulo** como região inicial no cadastro | A região inicial não muda depois, e a VM Ampere grátis só sai nela. | 5 |
| Oracle: converter a conta para Pay As You Go (continua grátis dentro dos limites) | Instâncias Always Free ociosas podem ser recuperadas pela Oracle; contas pagas não sofrem isso. | 5 |
| Monitor gratuito (UptimeRobot ou Better Stack) no `/health` e no backup | Alerta de queda sem custo. | 5 |
| Medir latência com 3 a 5 amigos antes de escolher o provedor | Decisão por dado, não por palpite. | 5 |

---

## 7. O que eu não colocaria

| Ideia | Por que não |
|---|---|
| "Acerto de contas", quem deve para quem, conversão de fichas em reais, ranking de "lucro" | Incentiva jogar a dinheiro por fora e contraria a regra nº 1 do projeto. O resumo de sessão deve mostrar só fichas virtuais. |
| Comprar moeda ou item, mesmo como "doação" | Proibido pelo próprio projeto; também traria obrigações legais. |
| Modo "deus" para o admin ver cartas | Quebra a confiança do grupo. Nem o dono deve ver carta fechada ao vivo. |
| Revelar o baralho depois da mão ("provably fair" ou rabbit hunt) | Contraria a regra de o baralho nunca sair do servidor e agrega pouco entre amigos. Se quiserem rabbit hunt no futuro, rever essa regra conscientemente. |
| Bots sentando em mesas online com humanos | Misturaria treino com contas online. Bots ficam só no treino. |
| Integração com Discord (bot, voz, presença) | Fora do escopo e cara de manter; o Discord por fora já resolve. |
| Login social (Google etc.) no MVP | O convite já resolve quem entra; mais um provedor é mais configuração. Dá para adicionar depois. |
| Mesa em 3D/WebGL | Pesa no celular e não melhora o jogo. CSS e SVG bastam. |
| Guardar chat para sempre | Privacidade do grupo; retenção curta ou nenhuma. |
| Torneios, Redis, várias instâncias | Já estão fora do escopo; só se o grupo crescer muito. |

---

## 8. Riscos

| Risco | Mitigação |
|---|---|
| A VM é ponto único de falha | Healthcheck + alerta, recuperação de mesa pelo log de ações, runbook de reinstalação. |
| Supabase Free: 500 MB, 2 projetos, pausa por inatividade | Retenção definida, cron diário de backup, monitorar uso. |
| Vercel Hobby é para uso não comercial | Compatível: não há dinheiro envolvido. Não colocar anúncios. |
| Capacidade da VM grátis da Oracle esgotada em São Paulo | Plano B: VPS em São Paulo (ex.: Vultr) já previsto no prompt. |
| Latência alta para quem está longe | Medir na fase 5; o jogo é por turnos e tolera bem 100 a 200 ms. |

---

## 9. Próximo passo sugerido

**Fase 0 (fundação)**: o que falta dela.

- [x] Monorepo pnpm + Turborepo, TS strict, ESLint, Prettier, Vitest no `web`
- [x] Site público (antecipado a pedido)
- [ ] `apps/game-server` (NestJS + Socket.IO) com `/health`
- [ ] `packages/poker-engine` e `packages/shared-types` (esqueleto + Vitest)
- [ ] CI no GitHub Actions (lint, typecheck, testes, build)
- [ ] Supabase CLI local e `infra/local/docker-compose.yml`
- [ ] Esqueleto de `docs/security.md` e `docs/protocol.md`

Depois disso, **fase 1 (motor de poker)**, que é a peça mais importante do projeto.
