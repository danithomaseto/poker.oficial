# Progresso

> Checklist vivo. Se a sessão parar no meio (limite de uso), a próxima continua do primeiro item
> não marcado daqui.

## Etapa atual: treino offline + painel de admin (pedido de 26/10/2026)

- [x] Rodapé com "Desenvolvido por Daniel Thomaseto" + link do Instagram
- [x] `packages/poker-engine`: cartas, avaliador de mãos, reducer da mão, side pots, projeção por jogador
- [x] Testes do motor: regras, side pots com 3/4/5 all-ins, propriedades (fast-check)
- [x] `packages/bots`: níveis fácil, médio, difícil e extremo
- [x] `/treino`: escolha de mesa (vários níveis e tamanhos) e mesa jogável contra bots
- [x] Redesign profissional da mesa (assentos, centro, fichas animadas, cartas, dock de ações)
- [x] Supabase: migração com perfis, convites, RLS e gatilho de cadastro só com convite
- [x] Login, resgate de convite e sair funcionando
- [x] `/jogo` (lobby do jogador) e proteção de rotas no `proxy.ts`
- [x] Carteirinha (personagem) no primeiro acesso, salva no perfil
- [x] `/admin`: gerar, listar e revogar convites; jogadores com carteirinha, moedas e status (sem dado pessoal); banir e desbanir
- [x] Guia de configuração do Supabase na Vercel (`docs/supabase.md`)
- [x] Lint, tipos, testes e build passando; commit e push

## Redesign do sistema (27/10/2026)

- [x] Tokens de superfície, borda e raio; carregamento e notificações padronizados
- [x] Cabeçalho do app com página ativa, menu no celular e menu do usuário
- [x] Lobby com lista de mesas, filtro por nível e link direto (`/treino?mesa=...`)
- [x] Preferências reais em `/jogo/preferencias` (4 cores, dicas, bots rápidos, próxima mão automática, reduzir animações)
- [x] Log da mão atual com mensagens do sistema; admin com retorno de erro; vitrine `/dev/vitrine` (só em dev)
- [x] Home com conteúdo fiel ao que existe; mesa da home alinhada à mesa real
- [ ] Conferir carteirinha compacta do lobby (avatar aparecia apagado na vitrine)
- [ ] Conferir menu do app no celular e a página de preferências no navegador
- [ ] Relatório final do redesign para o usuário

## Evolução da plataforma (27/10/2026)

- [x] `packages/progressao`: curva de 30 níveis, títulos, regras de XP, catálogo de 21 baralhos, módulos do tutorial
- [x] Migração de progressão (níveis, regras, eventos de XP, baralho e preferências na conta, RPCs seguras)
- [x] Progresso local em IndexedDB e sincronização idempotente com a conta (com consentimento para juntar)
- [x] 21 temas de baralho (10 gratuitos + 11 por nível) aplicados em todas as cartas do jogo
- [x] `/baralhos` (coleção) e `/progresso` (nível, recompensas, histórico); animação de subida de nível
- [x] Tutorial com 10 módulos práticos (`/tutorial`), mãos roteirizadas no motor real e desafio final contra bots
- [x] Treino, tutorial, coleção e progresso públicos (sem login) e offline (service worker + manifesto)
- [x] Primeiro acesso do dono pelo site (`/primeiro-acesso`) e nível/XP dos jogadores no admin
- [x] Documentação: `docs/supabase.md`, `docs/progresso-e-sincronizacao.md`, ADR-013 a 015
- [x] Build, validação no navegador (páginas, celular, offline real com o servidor desligado) e push

## Depende de você

- [ ] Seguir `docs/supabase.md`: criar o banco, rodar as 3 migrações, gravar o email do dono, redeploy e criar a conta em `/primeiro-acesso`

## Próximas etapas sugeridas

- Fase 0 restante: `apps/game-server` (NestJS + Socket.IO), `packages/shared-types`, CI no GitHub Actions
- Mesas online autoritativas (fase 4), reaproveitando o motor e a mesa já redesenhada

## Concluído

- Site público (`/`, `/entrar`, `/resgatar-convite`), identidade visual e documentação inicial.
