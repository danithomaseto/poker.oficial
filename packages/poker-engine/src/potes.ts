import type { JogadorNaMao, Pote } from "./tipos";

/**
 * Monta os potes por níveis de contribuição.
 *
 * Os níveis são os totais apostados por quem NÃO desistiu. Cada pote recebe, de todos os
 * jogadores (inclusive quem desistiu), a fatia entre o nível anterior e o atual. Concorre a ele
 * quem não desistiu e chegou àquele nível. Assim, fichas de quem desistiu ficam nos potes,
 * mas essa pessoa não concorre a nenhum.
 */
export function calcularPotes(jogadores: readonly JogadorNaMao[]): Pote[] {
  const niveis = [
    ...new Set(
      jogadores.filter((j) => !j.desistiu && j.totalApostado > 0).map((j) => j.totalApostado),
    ),
  ].sort((a, b) => a - b);

  const potes: Pote[] = [];
  let anterior = 0;
  for (const nivel of niveis) {
    let valor = 0;
    for (const j of jogadores) {
      valor += Math.max(0, Math.min(j.totalApostado, nivel) - anterior);
    }
    const elegiveis = jogadores.flatMap((j, i) =>
      !j.desistiu && j.totalApostado >= nivel ? [i] : [],
    );
    if (valor > 0) potes.push({ valor, elegiveis });
    anterior = nivel;
  }

  // Sobra de quem desistiu acima do maior nível vivo (caso raro) vai para o último pote.
  const sobra = jogadores.reduce((soma, j) => soma + Math.max(0, j.totalApostado - anterior), 0);
  if (sobra > 0) {
    const ultimo = potes.at(-1);
    if (ultimo) ultimo.valor += sobra;
  }

  // Potes seguidos com os mesmos elegíveis viram um só (fica mais claro na tela).
  const unidos: Pote[] = [];
  for (const pote of potes) {
    const anteriorPote = unidos.at(-1);
    if (anteriorPote && mesmosElegiveis(anteriorPote.elegiveis, pote.elegiveis)) {
      anteriorPote.valor += pote.valor;
    } else {
      unidos.push({ valor: pote.valor, elegiveis: [...pote.elegiveis] });
    }
  }
  return unidos;
}

function mesmosElegiveis(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Total no meio da mesa, contando as apostas da rodada atual. */
export function totalNoPote(jogadores: readonly JogadorNaMao[]): number {
  return jogadores.reduce((soma, j) => soma + j.totalApostado, 0);
}
