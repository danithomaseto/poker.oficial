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

## Depende de você

- [ ] Seguir `docs/supabase.md` (criar o banco, rodar a migração, criar a conta de dono, redeploy)

## Próximas etapas sugeridas

- Fase 0 restante: `apps/game-server` (NestJS + Socket.IO), `packages/shared-types`, CI no GitHub Actions
- Mesas online autoritativas (fase 4), reaproveitando o motor e a mesa já redesenhada
- Tutorial roteirizado e PWA para o treino funcionar sem internet

## Concluído

- Site público (`/`, `/entrar`, `/resgatar-convite`), identidade visual e documentação inicial.
