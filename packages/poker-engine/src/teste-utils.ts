import { baralhoOrdenado } from "./cartas";
import { aplicarAcao, iniciarMao, type EntradaMao } from "./mao";
import type { Acao, EstadoMao } from "./tipos";

export { baralhoRoteirizado as montarBaralho } from "./roteiro";
import { baralhoRoteirizado as montarBaralho } from "./roteiro";

export function entrada(
  fichas: number[],
  opcoes: {
    botao?: number;
    sb?: number;
    bb?: number;
    ante?: number;
    maos?: string[];
    board?: string;
  } = {},
): EntradaMao {
  const botao = opcoes.botao ?? 0;
  return {
    config: { smallBlind: opcoes.sb ?? 5, bigBlind: opcoes.bb ?? 10, ante: opcoes.ante ?? 0 },
    numero: 1,
    botao,
    jogadores: fichas.map((f, i) => ({ id: `j${i}`, nome: `Jogador ${i}`, assento: i, fichas: f })),
    baralho: opcoes.maos
      ? montarBaralho(opcoes.maos, opcoes.board ?? "", botao)
      : baralhoOrdenado(),
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
