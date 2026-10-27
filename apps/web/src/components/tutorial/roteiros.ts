import {
  aplicarAcao,
  baralhoRoteirizado,
  iniciarMao,
  type Acao,
  type EstadoMao,
  type TipoAcao,
} from "@poker/engine";

/**
 * Mãos do tutorial: cartas e ações dos bots combinadas de antemão, jogadas pelo MESMO motor
 * das mesas. Assim a lição é sempre igual e o que você aprende vale para o jogo de verdade.
 * Um teste executa cada roteiro do início ao fim (roteiros.test.ts).
 */

export interface JogadaBot {
  tipo: "bot";
  /** Índice do jogador: o teste confere que é mesmo a vez dele. */
  quem: number;
  acao: Acao;
}

export interface JogadaVoce {
  tipo: "voce";
  espera: TipoAcao;
  /** Total na rodada para apostar/aumentar (o botão já vem com esse valor). */
  valor?: number;
  /** O que pensar antes de decidir. */
  dica: string;
  /** Por que essa era a jogada. */
  certo: string;
  /** Resposta para quando a escolha foi outra. */
  errado: string;
}

export type Jogada = JogadaBot | JogadaVoce;

export interface Roteiro {
  id: string;
  /** Índice 0 é você. Ordem = ordem dos assentos (sentido horário a partir de você). */
  nomes: string[];
  fichas: number;
  blinds: [number, number];
  botao: number;
  maos: string[];
  board: string;
  jogadas: Jogada[];
  /** Quem deve levar o pote no fim (conferido no teste). Vazio para cenários só de ilustração. */
  vencedores: number[];
  introducao: string;
  final: string;
}

const BOTS = ["Rafa", "Bia", "Caio"];

export function acaoDaJogada(j: Jogada): Acao {
  return j.tipo === "bot" ? j.acao : j.valor !== undefined ? { tipo: j.espera, valor: j.valor } : { tipo: j.espera };
}

export function iniciarRoteiro(r: Roteiro, nomeVoce = "Você"): EstadoMao {
  return iniciarMao({
    config: { smallBlind: r.blinds[0], bigBlind: r.blinds[1], ante: 0 },
    numero: 1,
    botao: r.botao,
    jogadores: r.nomes.map((nome, i) => ({ id: i === 0 ? "voce" : `bot-${i}`, nome: i === 0 ? nomeVoce : nome, assento: i, fichas: r.fichas })),
    baralho: baralhoRoteirizado(r.maos, r.board, r.botao),
  }).estado;
}

/** Estado depois das `n` primeiras jogadas (para as mesas ilustrativas). */
export function estadoApos(r: Roteiro, n: number, nomeVoce?: string): EstadoMao {
  let estado = iniciarRoteiro(r, nomeVoce);
  for (const j of r.jogadas.slice(0, n)) estado = aplicarAcao(estado, estado.vez!, acaoDaJogada(j)).estado;
  return estado;
}

const bot = (quem: number, tipo: TipoAcao, valor?: number): JogadaBot => ({
  tipo: "bot",
  quem,
  acao: valor === undefined ? { tipo } : { tipo, valor },
});

/** Mesa de 4 com você no botão: serve aos módulos "mesa" e "ordem". */
export const ROTEIRO_ORDEM: Roteiro = {
  id: "ordem",
  nomes: ["Você", ...BOTS],
  fichas: 1000,
  blinds: [10, 20],
  botao: 0,
  maos: ["Qs Js", "8c 8d", "Ah 5c", "Kh 9h"],
  board: "Qd 7s 3h 9c 4d",
  jogadas: [
    bot(3, "pagar"),
    { tipo: "voce", espera: "pagar", dica: "", certo: "", errado: "" },
    bot(1, "pagar"),
    bot(2, "passar"),
  ],
  vencedores: [],
  introducao: "",
  final: "",
};

/** Módulo 5: passar, pagar, apostar e all-in numa mão só. */
export const ROTEIRO_ACOES: Roteiro = {
  id: "acoes",
  nomes: ["Você", ...BOTS],
  fichas: 1000,
  blinds: [10, 20],
  botao: 1,
  maos: ["8h 7h", "9d 9s", "Kc 4d", "Qd 5s"],
  board: "9h 6c 2h Th 3s",
  jogadas: [
    {
      tipo: "voce",
      espera: "pagar",
      dica: "Você é o primeiro a falar. O big blind é 20 e ninguém aumentou. Para ver o flop, pague os 20.",
      certo: "Você pagou o big blind. 8 e 7 do mesmo naipe é uma mão que gosta de ver o flop barato.",
      errado: "Aqui a ideia é só PAGAR os 20 do big blind e ver o flop sem gastar muito.",
    },
    bot(1, "pagar"),
    bot(2, "pagar"),
    bot(3, "passar"),
    bot(2, "passar"),
    bot(3, "passar"),
    {
      tipo: "voce",
      espera: "passar",
      dica: "Flop 9-6-2 com duas copas. Ninguém apostou ainda nesta rodada, então você pode PASSAR sem pagar nada.",
      certo: "Passar = continuar sem colocar fichas, só possível quando ninguém apostou na rodada.",
      errado: "Ninguém apostou: dá para PASSAR de graça e ver o que os outros fazem.",
    },
    bot(1, "apostar", 40),
    bot(2, "desistir"),
    bot(3, "pagar"),
    {
      tipo: "voce",
      espera: "pagar",
      dica: "Rafa apostou 40. Você tem chance de flush (copas) e de sequência. Para continuar, PAGUE os 40.",
      certo: "Pagar = igualar a aposta. Com tantas cartas que te ajudam, vale pagar pouco para ver o turn.",
      errado: "Desistir jogaria fora uma boa chance. Aumentar é arriscado ainda. Aqui o certo é PAGAR 40.",
    },
    bot(3, "passar"),
    {
      tipo: "voce",
      espera: "apostar",
      valor: 120,
      dica: "Saiu o 10 de copas: você fez FLUSH (cinco copas). Caio passou. Aposte 120 para ganhar fichas de quem tem mão pior.",
      certo: "Apostar = colocar as primeiras fichas da rodada. Com mão forte, aposte para valer.",
      errado: "Você tem uma mão muito forte agora. Passar desperdiça a chance: APOSTE 120.",
    },
    bot(1, "aumentar", 360),
    bot(3, "desistir"),
    {
      tipo: "voce",
      espera: "allin",
      dica: "Rafa AUMENTOU para 360. Seu flush é quase imbatível aqui: coloque todas as fichas (all-in).",
      certo: "All-in = apostar tudo o que tem. Faça isso quando a mão é forte o bastante para arriscar o resto.",
      errado: "Com flush contra um aumento, a jogada mais forte é ir ALL-IN.",
    },
    bot(1, "pagar"),
  ],
  vencedores: [0],
  introducao: "Você vai usar cada ação na hora certa. Leia a dica e escolha o botão certo.",
  final: "Rafa tinha trinca de noves, mas seu flush vence trinca. Você usou passar, pagar, apostar e all-in.",
};

/** Módulo 6: as quatro rodadas de apostas, com você no big blind. */
export const ROTEIRO_RODADAS: Roteiro = {
  id: "rodadas",
  nomes: ["Você", ...BOTS],
  fichas: 1000,
  blinds: [10, 20],
  botao: 2,
  maos: ["Ah Jd", "Ts 9s", "7c 4h", "Kd 6c"],
  board: "Js 8d 3c 5h 2s",
  jogadas: [
    bot(1, "pagar"),
    bot(2, "desistir"),
    bot(3, "pagar"),
    {
      tipo: "voce",
      espera: "passar",
      dica: "PRÉ-FLOP (cartas fechadas, ninguém vê a mesa ainda). Você é o big blind e já colocou 20. Ninguém aumentou, então você pode passar.",
      certo: "Quem está no big blind fala por último no pré-flop e pode passar se ninguém aumentou.",
      errado: "Você já pagou 20 como big blind e ninguém aumentou: basta PASSAR.",
    },
    bot(3, "passar"),
    {
      tipo: "voce",
      espera: "apostar",
      valor: 40,
      dica: "FLOP: saíram 3 cartas comunitárias. Você fez par de valetes com ás. Aposte 40 (dois terços do pote).",
      certo: "No flop começa uma nova rodada de apostas. Par alto com ás é uma mão boa: apostar faz o pote crescer.",
      errado: "Com par de valetes, APOSTE 40: mãos piores ainda pagam.",
    },
    bot(1, "pagar"),
    bot(3, "desistir"),
    {
      tipo: "voce",
      espera: "apostar",
      valor: 100,
      dica: "TURN: a quarta carta (um 5) não muda muito. Rafa só pagou. Continue apostando: 100.",
      certo: "No turn, mais uma rodada de apostas. As apostas costumam crescer junto com o pote.",
      errado: "Sua mão ainda está na frente: APOSTE 100.",
    },
    bot(1, "pagar"),
    {
      tipo: "voce",
      espera: "passar",
      dica: "RIVER: a quinta e última carta. Saiu uma terceira espadas: Rafa pode ter feito algo. Passe e veja se ele aposta.",
      certo: "No river é a última rodada. Passar controla o pote quando a mão é boa, mas não é imbatível.",
      errado: "Agora o mais prudente é PASSAR: a mesa ficou perigosa.",
    },
    bot(1, "passar"),
  ],
  vencedores: [0],
  introducao: "Uma mão completa, rodada por rodada. Repare no nome de cada fase no alto da mesa.",
  final: "Showdown: as cartas foram abertas e seu par de valetes venceu a carta alta do Rafa (ele tentava a sequência).",
};

/** Módulo 7: mão forte do começo ao fim, com você no botão. */
export const ROTEIRO_PRATICA: Roteiro = {
  id: "pratica",
  nomes: ["Você", ...BOTS],
  fichas: 1000,
  blinds: [10, 20],
  botao: 0,
  maos: ["As Ah", "9c 4d", "Qh Jh", "Kd 7d"],
  board: "Ad 7c 2s 7h Kc",
  jogadas: [
    bot(3, "pagar"),
    {
      tipo: "voce",
      espera: "aumentar",
      valor: 80,
      dica: "Você recebeu PAR DE ASES, a melhor mão inicial do poker. Caio só pagou. Aumente para 80 (4 big blinds).",
      certo: "Com mão muito forte, aumente: cobra mais de quem quer ver o flop e afasta mãos fracas.",
      errado: "Par de ases pede AUMENTO. Desistir ou só pagar desperdiça a melhor mão possível.",
    },
    bot(1, "desistir"),
    bot(2, "pagar"),
    bot(3, "pagar"),
    bot(2, "passar"),
    bot(3, "apostar", 100),
    {
      tipo: "voce",
      espera: "aumentar",
      valor: 300,
      dica: "Saiu outro ás: você tem TRINCA DE ASES. Caio apostou 100. Aumente para 300.",
      certo: "Quando o rival aposta e você tem uma mão enorme, aumentar faz o pote crescer.",
      errado: "Trinca de ases é fortíssima: AUMENTE para 300.",
    },
    bot(2, "desistir"),
    bot(3, "pagar"),
    bot(3, "passar"),
    {
      tipo: "voce",
      espera: "apostar",
      valor: 300,
      dica: "O turn trouxe um 7: agora você tem FULL HOUSE (ases com setes). Caio passou. Aposte 300.",
      certo: "Full house é uma das mãos mais fortes. Continue colocando fichas no pote.",
      errado: "Não deixe o Caio ver carta de graça: APOSTE 300.",
    },
    bot(3, "pagar"),
    bot(3, "allin"),
    {
      tipo: "voce",
      espera: "pagar",
      dica: "Caio foi ALL-IN com as fichas que sobravam. Você tem full house de ases: pague.",
      certo: "Pagar um all-in com uma mão dessas é fácil. Agora é o showdown.",
      errado: "Seu full house de ases ganha de quase tudo: PAGUE.",
    },
  ],
  vencedores: [0],
  introducao: "Você está no botão (o melhor lugar: fala por último depois do flop). Jogue a mão inteira seguindo as dicas.",
  final: "Caio também fez full house (setes com reis), mas o seu é de ases: o full house com a trinca maior vence.",
};

/** Módulo 5 (parte 2): desistir de uma mão ruim diante de um aumento. */
export const ROTEIRO_DESISTIR: Roteiro = {
  id: "desistir",
  nomes: ["Você", ...BOTS],
  fichas: 1000,
  blinds: [10, 20],
  botao: 0,
  maos: ["7c 2d", "Js 4s", "Kd Qd", "Ac Ad"],
  board: "As 8h 3d Tc 6s",
  jogadas: [
    bot(3, "aumentar", 60),
    {
      tipo: "voce",
      espera: "desistir",
      dica: "Caio aumentou para 60 e você tem 7 e 2 de naipes diferentes, considerada a pior mão inicial. O que fazer?",
      certo: "Desistir = largar a mão e não arriscar mais nada. Com 7-2 contra um aumento, é a decisão certa.",
      errado: "Pagar 60 com 7-2 é jogar fichas fora. Aqui o certo é DESISTIR.",
    },
    bot(1, "desistir"),
    bot(2, "pagar"),
    bot(2, "passar"),
    bot(3, "apostar", 80),
    bot(2, "desistir"),
  ],
  vencedores: [3],
  introducao: "Nem toda mão merece ser jogada. Veja esta.",
  final: "Caio tinha par de ases. Desistindo no começo, você perdeu zero fichas.",
};

export const ROTEIROS = [ROTEIRO_ORDEM, ROTEIRO_ACOES, ROTEIRO_DESISTIR, ROTEIRO_RODADAS, ROTEIRO_PRATICA];
