/// <reference path="./globais.d.ts" />
import { avaliar, descreverMao, melhoresCinco } from "./avaliador";
import type { Carta } from "./cartas";
import { calcularPotes } from "./potes";
import {
  ErroAcao,
  type Acao,
  type AcoesValidas,
  type ConfigMesa,
  type EntradaJogador,
  type EstadoMao,
  type Evento,
  type Fase,
  type JogadorNaMao,
  type MaoRevelada,
  type PoteDecidido,
  type Transicao,
} from "./tipos";

/**
 * Reducer puro de uma mão de Texas Hold'em No-Limit.
 *
 * - `iniciarMao` recebe o baralho JÁ embaralhado (a aleatoriedade vem de fora).
 * - `aplicarAcao` valida a intenção do jogador da vez e devolve o novo estado + eventos.
 * - Nada aqui lê relógio, rede ou `Math.random`: a mesma entrada sempre gera a mesma saída,
 *   então qualquer mão pode ser reconstruída a partir de configuração + baralho + ações.
 */

export interface EntradaMao {
  config: ConfigMesa;
  numero: number;
  jogadores: EntradaJogador[];
  /** Índice (no array de jogadores ordenado por assento) de quem está com o botão. */
  botao: number;
  /** Baralho completo (52 cartas) já embaralhado. */
  baralho: Carta[];
}

function proximo(i: number, n: number): number {
  return (i + 1) % n;
}

function podeAgir(j: JogadorNaMao): boolean {
  return !j.desistiu && !j.allIn;
}

/** Tira fichas do jogador para a aposta (limitado ao que ele tem). Devolve quanto saiu. */
function colocarFichas(j: JogadorNaMao, quanto: number, contaNaRodada: boolean): number {
  const valor = Math.min(quanto, j.fichas);
  j.fichas -= valor;
  j.totalApostado += valor;
  if (contaNaRodada) j.apostaRodada += valor;
  if (j.fichas === 0) j.allIn = true;
  return valor;
}

function tirarCarta(estado: EstadoMao): Carta {
  const carta = estado.baralho.shift();
  if (carta === undefined) throw new Error("O baralho acabou: isso não deveria acontecer.");
  return carta;
}

export function iniciarMao(entrada: EntradaMao): Transicao {
  const { config } = entrada;
  if (config.smallBlind <= 0 || config.bigBlind < config.smallBlind || config.ante < 0) {
    throw new RangeError("Blinds inválidos.");
  }
  const ordenados = [...entrada.jogadores].sort((a, b) => a.assento - b.assento);
  if (ordenados.length < 2) throw new RangeError("Uma mão precisa de pelo menos 2 jogadores.");
  if (ordenados.some((j) => j.fichas <= 0)) throw new RangeError("Todo jogador da mão precisa ter fichas.");
  if (entrada.botao < 0 || entrada.botao >= ordenados.length) throw new RangeError("Botão inválido.");
  if (new Set(entrada.baralho).size !== 52 || entrada.baralho.length !== 52) {
    throw new RangeError("O baralho precisa ter as 52 cartas, sem repetição.");
  }

  const n = ordenados.length;
  const baralho = [...entrada.baralho];

  // Distribuição: uma carta por vez, começando à esquerda do botão.
  const maos: Carta[][] = ordenados.map(() => []);
  for (let volta = 0; volta < 2; volta++) {
    for (let k = 1; k <= n; k++) {
      maos[(entrada.botao + k) % n]!.push(baralho.shift()!);
    }
  }

  const jogadores: JogadorNaMao[] = ordenados.map((j, i) => ({
    id: j.id,
    nome: j.nome,
    assento: j.assento,
    fichas: j.fichas,
    fichasIniciais: j.fichas,
    apostaRodada: 0,
    totalApostado: 0,
    cartas: [maos[i]![0]!, maos[i]![1]!] as const,
    desistiu: false,
    allIn: false,
    agiu: false,
    nivelQuandoAgiu: -1,
    ultimaAcao: null,
  }));

  // Heads-up: o botão posta o small blind e age primeiro no pré-flop.
  const sb = n === 2 ? entrada.botao : proximo(entrada.botao, n);
  const bb = proximo(sb, n);

  const estado: EstadoMao = {
    config,
    numero: entrada.numero,
    jogadores,
    botao: entrada.botao,
    smallBlind: sb,
    bigBlind: bb,
    fase: "preflop",
    board: [],
    baralho,
    queimadas: [],
    vez: null,
    apostaAtual: config.bigBlind,
    ultimoAumento: config.bigBlind,
    nivelUltimoAumentoCompleto: config.bigBlind,
    acoes: [],
    resultado: null,
  };

  const eventos: Evento[] = [
    { tipo: "inicio", numero: entrada.numero, botao: entrada.botao, smallBlind: sb, bigBlind: bb },
  ];

  if (config.ante > 0) {
    jogadores.forEach((j, i) => {
      const valor = colocarFichas(j, config.ante, false);
      eventos.push({ tipo: "blind", indice: i, qual: "ante", valor });
    });
  }
  eventos.push({
    tipo: "blind",
    indice: sb,
    qual: "pequeno",
    valor: colocarFichas(jogadores[sb]!, config.smallBlind, true),
  });
  eventos.push({
    tipo: "blind",
    indice: bb,
    qual: "grande",
    valor: colocarFichas(jogadores[bb]!, config.bigBlind, true),
  });

  // Pré-flop começa à esquerda do big blind (no heads-up, isso é o próprio botão/SB).
  const primeiro = n === 2 ? sb : proximo(bb, n);
  seguirOuAvancar(estado, eventos, primeiro, true);
  return { estado, eventos };
}

/** Quem precisa agir: pode agir e (não agiu ou ainda deve fichas para a aposta atual). */
function precisaAgir(estado: EstadoMao, j: JogadorNaMao): boolean {
  return podeAgir(j) && (!j.agiu || j.apostaRodada < estado.apostaAtual);
}

function rodadaCompleta(estado: EstadoMao): boolean {
  const ativos = estado.jogadores.filter(podeAgir);
  if (ativos.length === 0) return true;
  // Só um ainda tem fichas e já cobriu a aposta: não há mais com quem apostar.
  if (ativos.length === 1 && ativos[0]!.apostaRodada >= estado.apostaAtual) return true;
  return ativos.every((j) => j.agiu && j.apostaRodada === estado.apostaAtual);
}

/**
 * Depois de cada ação: termina a mão se só sobrou um, avança a rodada se ela fechou ou
 * passa a vez para o próximo que precisa agir a partir de `aPartirDe` (inclusive se `incluir`).
 */
function seguirOuAvancar(estado: EstadoMao, eventos: Evento[], aPartirDe: number, incluir: boolean): void {
  const vivos = estado.jogadores.filter((j) => !j.desistiu);
  if (vivos.length === 1) {
    encerrarSemShowdown(estado, eventos);
    return;
  }
  if (rodadaCompleta(estado)) {
    avancarRodada(estado, eventos);
    return;
  }
  const n = estado.jogadores.length;
  for (let k = incluir ? 0 : 1; k <= n; k++) {
    const i = (aPartirDe + k) % n;
    if (precisaAgir(estado, estado.jogadores[i]!)) {
      estado.vez = i;
      return;
    }
  }
  // Ninguém precisa agir: a rodada está fechada.
  avancarRodada(estado, eventos);
}

const PROXIMA_FASE: Record<"preflop" | "flop" | "turn", Fase> = {
  preflop: "flop",
  flop: "turn",
  turn: "river",
};

function avancarRodada(estado: EstadoMao, eventos: Evento[]): void {
  for (const j of estado.jogadores) {
    j.apostaRodada = 0;
    j.agiu = false;
    j.nivelQuandoAgiu = -1;
    if (!j.desistiu) j.ultimaAcao = null;
  }
  estado.apostaAtual = 0;
  estado.ultimoAumento = estado.config.bigBlind;
  estado.nivelUltimoAumentoCompleto = 0;
  estado.vez = null;

  if (estado.fase === "river") {
    resolverShowdown(estado, eventos);
    return;
  }
  if (estado.fase === "encerrada") return;

  const fase = PROXIMA_FASE[estado.fase];
  estado.fase = fase;
  // Queima uma carta antes de flop, turn e river.
  estado.queimadas.push(tirarCarta(estado));
  const novas = fase === "flop" ? [tirarCarta(estado), tirarCarta(estado), tirarCarta(estado)] : [tirarCarta(estado)];
  estado.board.push(...novas);
  eventos.push({ tipo: "rodada", fase, cartas: novas });

  // Se menos de dois ainda podem apostar, o board corre até o river sem novas apostas.
  if (estado.jogadores.filter(podeAgir).length < 2) {
    avancarRodada(estado, eventos);
    return;
  }

  // Pós-flop: primeiro jogador ativo à esquerda do botão.
  seguirOuAvancar(estado, eventos, proximo(estado.botao, estado.jogadores.length), true);
}

function encerrarSemShowdown(estado: EstadoMao, eventos: Evento[]): void {
  const vencedor = estado.jogadores.findIndex((j) => !j.desistiu);
  const total = estado.jogadores.reduce((soma, j) => soma + j.totalApostado, 0);
  const ganhos = estado.jogadores.map(() => 0);
  ganhos[vencedor] = total;
  estado.jogadores[vencedor]!.fichas += total;
  estado.resultado = {
    showdown: false,
    potes: [{ valor: total, elegiveis: [vencedor], ganhadores: [vencedor] }],
    ganhos,
    maos: [],
  };
  finalizar(estado, eventos);
  eventos.splice(eventos.length - 1, 0, { tipo: "pote", valor: total, ganhadores: [vencedor] });
}

function resolverShowdown(estado: EstadoMao, eventos: Evento[]): void {
  const n = estado.jogadores.length;
  const maos: MaoRevelada[] = [];
  const pontuacoes = estado.jogadores.map((j, i) => {
    if (j.desistiu) return -1;
    const sete = [...j.cartas, ...estado.board];
    const pontuacao = avaliar(sete);
    maos.push({
      indice: i,
      cartas: j.cartas,
      pontuacao,
      descricao: descreverMao(pontuacao),
      melhoresCinco: melhoresCinco(sete),
    });
    return pontuacao;
  });
  eventos.push({ tipo: "showdown", maos });

  const ganhos = estado.jogadores.map(() => 0);
  const potesDecididos: PoteDecidido[] = [];
  for (const pote of calcularPotes(estado.jogadores)) {
    const melhor = Math.max(...pote.elegiveis.map((i) => pontuacoes[i]!));
    const ganhadores = pote.elegiveis.filter((i) => pontuacoes[i] === melhor);
    // Ordem a partir da esquerda do botão: quem estiver primeiro leva a ficha ímpar.
    ganhadores.sort((a, b) => ((a - estado.botao - 1 + n) % n) - ((b - estado.botao - 1 + n) % n));
    const parte = Math.floor(pote.valor / ganhadores.length);
    let resto = pote.valor - parte * ganhadores.length;
    for (const g of ganhadores) {
      const extra = resto > 0 ? 1 : 0;
      resto -= extra;
      ganhos[g]! += parte + extra;
    }
    potesDecididos.push({ ...pote, ganhadores });
    eventos.push({ tipo: "pote", valor: pote.valor, ganhadores });
  }
  estado.jogadores.forEach((j, i) => {
    j.fichas += ganhos[i]!;
  });
  estado.resultado = { showdown: true, potes: potesDecididos, ganhos, maos };
  finalizar(estado, eventos);
}

function finalizar(estado: EstadoMao, eventos: Evento[]): void {
  estado.fase = "encerrada";
  estado.vez = null;
  for (const j of estado.jogadores) {
    j.apostaRodada = 0;
  }
  eventos.push({ tipo: "fim" });
}

/** Pode aumentar quem ainda não agiu na rodada ou viu um aumento completo depois de agir. */
function temDireitoDeAumentar(estado: EstadoMao, j: JogadorNaMao): boolean {
  return j.nivelQuandoAgiu < 0 || estado.nivelUltimoAumentoCompleto > j.nivelQuandoAgiu;
}

export function obterAcoesValidas(estado: EstadoMao, indice: number): AcoesValidas {
  const nenhuma: AcoesValidas = {
    podeDesistir: false,
    podePassar: false,
    valorParaPagar: 0,
    apostar: null,
    aumentar: null,
    valorAllIn: 0,
  };
  const j = estado.jogadores[indice];
  if (!j || estado.fase === "encerrada" || estado.vez !== indice || !podeAgir(j)) return nenhuma;

  const devendo = estado.apostaAtual - j.apostaRodada;
  const maximo = j.apostaRodada + j.fichas;
  const outrosComFichas = estado.jogadores.some((o, i) => i !== indice && podeAgir(o));

  let apostar: AcoesValidas["apostar"] = null;
  let aumentar: AcoesValidas["aumentar"] = null;
  if (outrosComFichas) {
    if (estado.apostaAtual === 0 && j.fichas > 0) {
      apostar = { min: Math.min(estado.config.bigBlind, maximo), max: maximo };
    } else if (j.fichas > devendo && temDireitoDeAumentar(estado, j)) {
      aumentar = { min: Math.min(estado.apostaAtual + estado.ultimoAumento, maximo), max: maximo };
    }
  }

  return {
    podeDesistir: true,
    podePassar: devendo <= 0,
    valorParaPagar: devendo > 0 ? Math.min(devendo, j.fichas) : 0,
    apostar,
    aumentar,
    valorAllIn: maximo,
  };
}

export function aplicarAcao(estadoAnterior: EstadoMao, indice: number, acao: Acao): Transicao {
  if (estadoAnterior.fase === "encerrada") throw new ErroAcao("mao_encerrada", "A mão já terminou.");
  if (estadoAnterior.vez !== indice) throw new ErroAcao("fora_da_vez", "Não é a vez deste jogador.");

  const validas = obterAcoesValidas(estadoAnterior, indice);
  const estado = structuredClone(estadoAnterior);
  const j = estado.jogadores[indice]!;
  const eventos: Evento[] = [];

  // all-in vira a ação equivalente (pagar, apostar ou aumentar com tudo).
  let { tipo } = acao;
  let valor = acao.valor ?? 0;
  if (tipo === "allin") {
    valor = validas.valorAllIn;
    if (valor <= estado.apostaAtual) tipo = "pagar";
    else if (validas.apostar) tipo = "apostar";
    else if (validas.aumentar) tipo = "aumentar";
    else tipo = "pagar"; // sem direito de aumentar: o all-in é só para pagar
  }

  switch (tipo) {
    case "desistir":
      j.desistiu = true;
      break;
    case "passar":
      if (!validas.podePassar) throw new ErroAcao("acao_invalida", "Há uma aposta para pagar: não dá para passar.");
      break;
    case "pagar":
      if (validas.valorParaPagar <= 0) throw new ErroAcao("acao_invalida", "Não há aposta para pagar.");
      colocarFichas(j, validas.valorParaPagar, true);
      break;
    case "apostar":
    case "aumentar": {
      const faixa = tipo === "apostar" ? validas.apostar : validas.aumentar;
      if (!faixa) throw new ErroAcao("acao_invalida", `Não é possível ${tipo} agora.`);
      if (!Number.isInteger(valor) || valor < faixa.min || valor > faixa.max) {
        throw new ErroAcao("valor_invalido", `O valor precisa estar entre ${faixa.min} e ${faixa.max}.`);
      }
      colocarFichas(j, valor - j.apostaRodada, true);
      const acrescimo = valor - estado.apostaAtual;
      const completo =
        tipo === "apostar" ? valor >= estado.config.bigBlind : acrescimo >= estado.ultimoAumento;
      if (completo) {
        estado.ultimoAumento = acrescimo;
        estado.nivelUltimoAumentoCompleto = valor;
      }
      estado.apostaAtual = valor;
      // Todo mundo que ainda tem fichas precisa responder à nova aposta.
      for (const outro of estado.jogadores) {
        if (outro !== j && podeAgir(outro)) outro.agiu = false;
      }
      break;
    }
  }

  j.agiu = true;
  j.nivelQuandoAgiu = estado.apostaAtual;
  const total = j.apostaRodada;
  j.ultimaAcao = { tipo, valor: total, allIn: j.allIn };
  estado.acoes.push({ indice, fase: estado.fase, tipo, valor: total });
  eventos.push({ tipo: "acao", indice, acao: tipo, valor: total, allIn: j.allIn });
  estado.vez = null;

  seguirOuAvancar(estado, eventos, indice, false);
  return { estado, eventos };
}

/** Reconstrói uma mão a partir da entrada e da lista de ações (para replay e recuperação). */
export function reconstruirMao(entrada: EntradaMao, acoes: readonly { indice: number; acao: Acao }[]): EstadoMao {
  let { estado } = iniciarMao(entrada);
  for (const { indice, acao } of acoes) {
    estado = aplicarAcao(estado, indice, acao).estado;
  }
  return estado;
}

/** Próximo botão: o próximo assento ocupado depois do botão anterior (entre quem vai jogar). */
export function proximoBotao(assentosNaProximaMao: readonly number[], assentoBotaoAnterior: number | null): number {
  const ordenados = [...assentosNaProximaMao].sort((a, b) => a - b);
  if (ordenados.length === 0) throw new RangeError("Sem jogadores.");
  if (assentoBotaoAnterior === null) return 0;
  const i = ordenados.findIndex((a) => a > assentoBotaoAnterior);
  return i === -1 ? 0 : i;
}
