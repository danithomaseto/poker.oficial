# Progresso, XP, níveis e sincronização

Tudo aqui vale igual no aparelho (`packages/progressao`) e no banco
(`supabase/migrations/20261027120000_progressao_baralhos.sql`). Um teste
(`packages/progressao/src/progressao.test.ts`) lê o SQL e falha se os números divergirem.

## Premissas

- XP premia **aprender e participar**, nunca ganhar fichas. Nada envolve dinheiro real.
- Nível nunca é guardado: é sempre calculado do XP total. Ninguém "escolhe" o próprio nível.
- O cliente nunca manda "quanto XP ganhou": manda um **evento** com uma **chave única**. O valor sai
  da tabela de regras. Chave repetida não paga de novo (idempotência).

## Fontes de XP

| Evento | XP | Teto por dia (São Paulo) | Chave | Requisito conferido no servidor |
|---|---|---|---|---|
| Módulo do tutorial | 60 | sem teto, 1 vez por módulo | `tutorial:<módulo>` (só os 10 módulos reais) | — |
| Tutorial completo | 150 | 1 vez | `tutorial:completo` | 10 módulos registrados |
| Mão de treino | 3 | 100 | `mao:<sessão>:<número>` | — |
| Sessão de treino (15+ mãos) | 40 | 3 | `sessao:<sessão>` | 15 mãos daquela sessão |
| Objetivo do dia (30 mãos) | 60 | 1 | `diario:AAAA-MM-DD` | 30 mãos no dia e data de hoje |

Teto diário máximo vindo do treino: 300 + 120 + 60 = **480 XP/dia**.

## Curva de níveis

`xpParaSubir(n) = arredondar(40 × n^1,3 / 10) × 10`, do nível 1 ao 30 (`VERSAO_CURVA = 1`).

| Nível | XP total | | Nível | XP total |
|---|---|---|---|---|
| 2 | 40 | | 15 | 8.150 |
| 3 | 140 | | 20 | 16.110 |
| 5 | 550 | | 25 | 27.240 |
| 10 | 3.080 | | 30 | 41.760 |

O tutorial inteiro (750 XP) leva ao nível 5. Jogando o teto todo dia, o nível 30 sai em uns 3 meses;
num ritmo normal (umas 40 mãos por semana), bem mais. Os valores exatos de cada nível estão na tabela
`public.niveis`.

## Recompensas

Todo nível dá um **título** (30 no total, de "Novato" a "Mestre da Mesa"). Nos níveis 3, 5, 8, 10, 13, 15,
18, 20, 23, 25 e 30 também libera um **baralho**. Dez baralhos são gratuitos desde o começo. A subida
de nível mostra uma animação só quando o nível muda de verdade (pela soma do XP), nunca ao recarregar.

## Onde o progresso fica

- **Aparelho:** IndexedDB (`poker-amigos`, store `eventos`), com estado `local`, `sincronizado` ou
  `recusado`. Sem IndexedDB (algumas abas anônimas), fica em memória enquanto a aba estiver aberta.
- **Conta:** `public.xp_eventos` (um registro por evento aceito). Preferências e baralho equipado ficam
  em `public.perfis`.

## Sincronização

1. Sem internet, ou sem conta, tudo fica no aparelho e conta para o nível mostrado ("neste aparelho").
2. Com conta e internet, o app manda os eventos pendentes **em ordem** (mãos e módulos antes de sessão,
   objetivo e tutorial completo, porque estes dependem daqueles) para `registrar_evento_xp`.
3. Cada resposta marca o evento: aceito vira `sincronizado`; recusado (duplicado, teto, requisito,
   prazo) vira `recusado` e deixa de contar no aparelho também.
4. Depois, `meu_progresso()` traz o XP da conta. **O servidor é a referência:** o nível mostrado é o
   XP da conta mais o que ainda está pendente neste aparelho.

Quando roda: ao abrir o app, quando a internet volta, quando você volta para a aba e alguns segundos
depois de ganhar XP (em lote).

### Conflitos

- **Mesmo evento em dois aparelhos:** a chave é única por conta; o segundo envio é recusado como
  duplicado e não soma duas vezes.
- **Teto diário estourado em dois aparelhos offline:** o servidor aplica o teto na ordem de chegada;
  o excedente vira `recusado`.
- **Evento muito antigo ou "do futuro":** recusado se tiver mais de 30 dias ou mais de 5 minutos à frente
  do relógio do servidor.
- **Progresso de convidado ao entrar numa conta:** o app pergunta se você quer juntar o progresso deste
  aparelho à conta. Se sim, os eventos são enviados (com as mesmas regras acima). Se não, ficam no
  aparelho e não são enviados para essa conta. Eventos de uma conta nunca vão para outra: o aparelho
  lembra de quem são.
- **Baralho equipado:** vale o último que você escolheu. Na conta, o servidor confere o nível antes de
  aceitar; ao entrar, o baralho da conta é aplicado uma vez.

## Limites conhecidos

- XP do treino offline é **declarado pelo aparelho**: os tetos diários e as chaves únicas limitam o
  ganho, mas o servidor não tem como reproduzir uma mão que rodou só no navegador. Quando as mesas
  online existirem, o XP delas virá do servidor de jogo, que é autoritativo.
- Apagar os dados do navegador apaga o progresso de convidado (o da conta continua no banco).
