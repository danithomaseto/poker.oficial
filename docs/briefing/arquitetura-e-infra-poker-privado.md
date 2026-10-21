# Arquitetura e infraestrutura do jogo de poker privado

## Objetivo

Jogo web privado para amigos, aberto no navegador sem instalar aplicativo. O domínio oficial explica o jogo e oferece cadastro/login; depois do login autorizado, a pessoa entra na página do jogo. No primeiro acesso ao jogo, cada pessoa precisa criar um personagem 2D, definindo nome, roupa e aparência, antes de entrar no lobby. O personagem individual aparece junto ao lugar do jogador durante as partidas. Conforme joga, a pessoa ganha moeda virtual cosmética para comprar roupas e itens de personalização; essa moeda não tem valor real e fica separada das fichas usadas nas mãos. Texas Hold’em No-Limit, até 9 lugares por mesa e várias mesas simultâneas. Fichas e prêmios são exclusivamente virtuais. O jogo inclui partidas online, chat por mensagem, tutorial e treino offline com dificuldade ajustável. A comunicação por voz fica no Discord, usado separadamente, sem integração no MVP. A prioridade é não ter custo de hospedagem durante o protótipo e manter baixo custo no grupo fechado.

## Decisões de arquitetura

- Aplicação web: Next.js, React e TypeScript, hospedados na Vercel. O mesmo domínio contém as páginas públicas e o jogo, por exemplo `/`, `/entrar`, `/resgatar-convite`, `/jogo` e `/admin`.
- Contas e dados: Supabase Auth para email/senha e Supabase PostgreSQL para perfis, permissões, convites, configurações e histórico essencial. Escolher São Paulo (`sa-east-1`) se a maioria do grupo estiver no Brasil.
- Personagem 2D e cosméticos: após autenticar e ter acesso aprovado, o jogador passa por um criador obrigatório na primeira entrada. Guardar no perfil o nome exibido e as opções visuais (modelo/base, cabelo, roupa, cores e acessórios); permitir alterações posteriores. Exibir o avatar e o nome no lobby e junto ao assento do jogador na mesa. Incluir uma loja de itens cosméticos comprados com moeda virtual cosmética, ganha por jogar; manter esse saldo separado das fichas de poker.
- Servidor de jogo: NestJS e TypeScript numa VM Linux. Ele controla as mesas online por WebSocket/Socket.IO e trata chat de texto, reconexão e autorização.
- Frontend web, servidor e motor de jogo podem compartilhar tipos TypeScript. O servidor na VM é sempre autoridade para partidas online.
- O jogo requer HTTPS para proteger login, sessão e tráfego. Atualizações da página do jogo são publicadas no servidor, sem instalador ou mecanismo desktop de atualização.
- Se o projeto crescer, a mesma interface React/TypeScript poderá ser empacotada com Tauri para Windows. Manter o motor de regras separado dos serviços do navegador reduz retrabalho nessa etapa.

## Estrutura sugerida do repositório

```text
poker-amigos/
  apps/
    web/           # Next.js: site público, login, jogo, treino e painel admin
    game-server/   # NestJS: convites, salas, partidas e WebSocket autoritativo
  packages/
    poker-engine/  # regras, avaliação de cartas e estados da mão
    shared-types/  # contratos de mensagens e tipos compartilhados
    ui/            # componentes compartilhados, se fizer sentido
  infra/
    local/         # configuração para desenvolvimento local
    deploy/        # configuração dos ambientes hospedados
  docs/
    requirements.md
    architecture.md
    security.md
```

## Regras de segurança do jogo

- O servidor embaralha o baralho, valida as ações, controla os turnos e calcula os resultados online.
- Cada jogador recebe somente as próprias cartas ocultas; cartas comunitárias são compartilhadas. Espectadores nunca recebem cartas privadas.
- Cada mesa é processada em sequência por um único controlador de estado. Uma falha deve permitir reconexão ou recuperação a partir do último estado persistido.
- Treino offline usa o mesmo modelo de regras, mas resultados, fichas e premiações nunca entram nas contas online.
- Dificuldades de bots vão de fácil a extrema. “Extremo” significa desafio avançado, sem prometer equivalência a jogadores profissionais reais.

## Acesso por convites

1. O proprietário gera códigos individuais no painel.
2. O convidado resgata um código e cria uma conta Supabase Auth com email e senha.
3. O backend consome o código uma só vez e vincula-o permanentemente ao ID de usuário Supabase.
4. No login e ao abrir o WebSocket, o servidor da VM valida o token Supabase e confirma no banco que a conta continua autorizada.
5. Revogar o acesso bloqueia a conta; o código consumido não pode ser transferido.

Após concluir esse fluxo e entrar no jogo, uma conta sem personagem configurado deve ser encaminhada ao criador de personagem. Só depois de salvar um nome válido e a aparência inicial ela pode seguir ao lobby. O nome exibido deve ser validado e protegido contra conteúdo impróprio; definir se nomes precisam ser únicos no grupo. O personagem e os itens da loja são cosméticos e não afetam cartas, fichas de poker, premiações ou regras. A moeda cosmética é apenas virtual, não pode ser comprada com dinheiro real, sacada ou trocada por valor real. Registrar compras e recompensas no servidor para impedir edição do saldo pelo cliente.

Para permitir treino sem internet, o navegador precisa carregar e guardar previamente os arquivos essenciais do jogo. Um service worker/PWA pode manter a interface e o motor de jogo em cache; depois da primeira autenticação, uma autorização local assinada e limitada pode liberar apenas o treino offline. Partidas e chat online sempre precisam de conexão. O armazenamento offline do navegador pode ser limpo pelo usuário ou pelo sistema, então isso deve ser apresentado como conveniência, não como garantia de persistência.

## Infraestrutura inicial recomendada

- Frontend Next.js hospedado na Vercel.
- Supabase Auth e PostgreSQL em São Paulo, se adequado à localização do grupo; configurar RLS e exportação/backup dos dados.
- Uma VM Linux próxima dos jogadores para o servidor NestJS autoritativo, com HTTPS/WSS e firewall.
- Não há instalador nem distribuição de binários: o navegador recebe a versão atual ao abrir o jogo.
- O chat de texto acompanha a conexão WebSocket do jogo. Para falar, os jogadores usam o Discord por fora do jogo; não há integração ou dependência técnica do Discord no MVP.
- Domínio, HTTPS, gestão de segredos, logs e alerta de indisponibilidade.
- Ambientes separados para desenvolvimento, teste fechado e produção.
- Começar com uma instância do backend; adotar Redis e múltiplas instâncias só quando a quantidade de conexões exigir.

## Opções de custo

### Zero custo para protótipo: computador do proprietário

Rodar a API e PostgreSQL em Docker no computador do proprietário. Não há custo de servidor, mas o computador precisa ficar ligado e a rede doméstica precisa aceitar conexões externas. CGNAT, mudança de IP, energia, firewall e upload podem impedir ou piorar o acesso. Para uma prova inicial, pode-se testar em LAN ou numa rede privada VPN com todos os amigos; isso não é uma boa hospedagem permanente.

### Zero custo em nuvem: Cloudflare Workers/Durable Objects

É uma opção para experimentar partidas de baixo tráfego com WebSockets e estado isolado por mesa, além de banco SQLite/D1 e site estático. Exige adaptar a arquitetura NestJS/PostgreSQL para o ambiente Workers/Durable Objects. Os limites gratuitos são rígidos; conexões WebSocket consomem duração enquanto abertas e, quando um limite é atingido, operações podem falhar.

### Recomendação prática para o primeiro grupo fechado

1. Durante a construção, rode tudo localmente com Docker Compose: Next.js, servidor NestJS e PostgreSQL local. O treino offline roda no navegador depois de carregado/cacheado. O Discord é aberto separadamente pelos jogadores quando quiserem conversar por voz.
2. Para um teste remoto com custo de hospedagem potencialmente zero, tente uma VM Oracle Cloud Always Free para o servidor NestJS. A oferta documentada inclui até 2 OCPUs e 12 GB de memória Ampere A1 dentro dos limites, mas confirme disponibilidade. O frontend fica na Vercel e Auth/banco ficam no Supabase.
3. Deixe o frontend na Vercel e use o endereço `vercel.app` durante o protótipo. O domínio próprio pode vir depois. Embora a Vercel ofereça WebSockets, mantenha o WebSocket das mesas na VM, que conserva a lógica autoritativa e o estado contínuo da partida.
4. Se a VM gratuita não estiver disponível, estiver longe dos jogadores ou ficar instável, use um VPS Linux na região mais próxima. A Vultr oferece região em São Paulo; escolha a VM pelo conjunto de recursos, rede e custo, não pelo menor plano de entrada. Um VPS simples com API deve ser medido antes de ampliar o grupo.

Mantenha PostgreSQL em rede privada, faça cópia diária criptografada fora da VM e configure alerta de custo/quota. O jogo não precisa de GPU: o processamento do treino é local e as ações online são mensagens pequenas; disponibilidade da VM será o principal ponto de operação.

### Hospedagem gratuita convencional

Render pode hospedar serviços WebSocket gratuitos para demonstrações, mas o serviço pode suspender após 15 minutos sem tráfego e levar cerca de um minuto para voltar. O PostgreSQL gratuito do Render expira depois de 30 dias e não inclui backups. Supabase Free pode pausar projetos após uma semana sem atividade. Essas opções são úteis para demo ou teste de integração, mas não para prometer disponibilidade contínua.

### Baixo custo e operação simples: VM para o servidor do jogo

Uma VM Linux pequena pode rodar o servidor NestJS. O banco fica no Supabase e o frontend na Vercel. Essa separação deixa a VM responsável pelas partidas longas. Ela precisa de HTTPS/WSS, firewall e atualizações. Nunca coloque a chave Supabase `service_role` no navegador.

Oracle Cloud anuncia recursos Always Free, inclusive Ampere A1 até 2 OCPUs/12 GB de memória em regiões elegíveis. Pode ser uma alternativa de custo zero, mas disponibilidade de capacidade, configuração e rede são responsabilidades do proprietário. Um servidor europeu de baixo custo pode ter preço interessante, mas a latência para amigos no Brasil deve ser medida antes de decidir.

## Fluxo de montagem com o agente de construção

1. Preparar monorepo, decisões de arquitetura, rotas do site, contratos de mensagens e ambiente local.
2. Implementar uma mão completa local, regras, avaliação de cartas, tutorial e bots ajustáveis.
3. Implementar contas, resgate único de convites, painel do proprietário e revogação.
4. Criar perfis e o criador obrigatório de personagem 2D no primeiro acesso, incluindo nome exibido, roupa, aparência e edição posterior; apresentar o avatar ao lado do assento nas mesas.
5. Implementar inventário, loja cosmética e saldo de moeda virtual ganho ao jogar, mantendo-o separado das fichas de poker e validado pelo servidor.
6. Implementar salas privadas, jogo autoritativo, reconexão e múltiplas mesas.
7. Adicionar chat por mensagem, controles de anfitrião, espectadores e moderação. Para voz, orientar o grupo a usar o Discord separadamente.
8. Fechar histórico, resumo de sessão, acessibilidade, temas, site, PWA/cache de treino offline e autorização offline limitada.
9. Fazer teste fechado com amigos, medir latência e custos e corrigir antes de ampliar.

Em cada etapa, pedir ao agente código, instruções para executar localmente, configuração necessária e critérios de conclusão. Evitar pedir tudo numa única geração.

## Fontes oficiais

- [Next.js: guia de PWA e service worker](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [MDN: service workers e cache offline](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vercel: WebSockets agora disponíveis](https://vercel.com/changelog/websocket-support-is-now-generally-available)
- [Vercel: ciclo de vida da conexão WebSocket](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections)
- [Vercel Hobby: recursos e limites](https://vercel.com/docs/plans/hobby)
- [Supabase: regiões disponíveis](https://supabase.com/docs/guides/platform/regions)
- [Supabase: limites e pausas do plano gratuito](https://supabase.com/pricing)
- [NestJS: gateways WebSocket](https://docs.nestjs.com/websockets/gateways)
- [Cloudflare: Durable Objects e preços](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Render: limitações gratuitas](https://render.com/docs/free)
- [Supabase: preços e plano gratuito](https://supabase.com/pricing)
- [Oracle Cloud: recursos Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Oracle Cloud: FAQ do Always Free](https://www.oracle.com/cloud/free/faq/)
- [Oracle Cloud: região de São Paulo](https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm)
- [Hetzner: servidores cloud](https://www.hetzner.com/cloud/regular-performance/)
- [Vultr: localização em São Paulo](https://blogs.vultr.com/Ol-Brasil-Vultrs-20th-Cloud-Location-is-in-So-Paulo)
