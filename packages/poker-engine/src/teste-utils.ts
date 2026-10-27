import { baralhoOrdenado, cartas, type Carta } from "./cartas";
import { aplicarAcao, iniciarMao, type EntradaMao } from "./mao";
import type { Acao, EstadoMao } from "./tipos";

/**
 * Monta um baralho em que cada jogador recebe as cartas pedidas e o board sai como indicado,
 * respeitando a ordem real: duas voltas a partir da esquerda do botão, queima antes de cada rua.
 * Só para testes e cenários roteirizados (tutorial).
 */
export function montarBaralho(maos: string[], board: string, botao: number): Carta[] {
  const n = maos.length;
  const posicoes: (Carta | undefined)[] = new Array(52).fill(undefined);
  maos.forEach((texto, jogador) => {
    const [c1, c2] = cartas(texto);
    const k = ((jogador - botao - 1 + n) % n) + 1;
    posicoes[k - 1] = c1;
    posicoes[n + k - 1] = c2;
  });
  const b = cartas(board);
  const base = 2 * n;
  // base: queima, base+1..3: flop, base+4: queima, base+5: turn, base+6: queima, base+7: river
  [base + 1, base + 2, base + 3, base + 5, base + 7].forEach((pos, i) => {
    if (b[i] !== undefined) posicoes[pos] = b[i];
  });
  const usadas = new Set(posicoes.filter((c): c is Carta => c !== undefined));
  const resto = baralhoOrdenado().filter((c) => !usadas.has(c));
  return posicoes.map((c) => (c === undefined ? resto.shift()! : c));
}

export function entrada(
  fichas: number[],
  opcoes: { botao?: number; sb?: number; bb?: number; ante?: number; maos?: string[]; board?: string } = {},
): EntradaMao {
  const botao = opcoes.botao ?? 0;
  return {
    config: { smallBlind: opcoes.sb ?? 5, bigBlind: opcoes.bb ?? 10, ante: opcoes.ante ?? 0 },
    numero: 1,
    botao,
    jogadores: fichas.map((f, i) => ({ id: `j${i}`, nome: `Jogador ${i}`, assento: i, fichas: f })),
    baralho: opcoes.maos ? montarBaralho(opcoes.maos, opcoes.board ?? "", botao) : baralhoOrdenado(),
  };
}

/** Aplica uma sequência de ações, sempre para quem está na vez. */
export function jogar(estado: EstadoMao, acoes: Acao[]): EstadoMao {
  let atual = estado;
  for (const acao of acoes) {
    if (atual.vez === null) throw new Error(`Sem jogador na vez para aplicar ${acao.tipo}`);
    atual = aplicarAcao(atual, atual.vez, acao).estado;
  }
  return atual;
}

/** Todo mundo vai all-in (ou paga all-in) até a mão acabar. */
export function todosAllIn(estado: EstadoMao): EstadoMao {
  let atual = estado;
  while (atual.vez !== null) atual = aplicarAcao(atual, atual.vez, { tipo: "allin" }).estado;
  return atual;
}

export function iniciar(...args: Parameters<typeof entrada>): EstadoMao {
  return iniciarMao(entrada(...args)).estado;
}
