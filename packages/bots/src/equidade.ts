import { avaliar, type Carta } from "@poker/engine";
import { percentilPreflop } from "./forca";

export type Aleatorio = () => number;

/**
 * Equidade por Monte Carlo: chance de ganhar (empates contam fração) contra `oponentes`
 * mãos desconhecidas, completando o board ao acaso.
 *
 * `faixas[i]` (opcional) é o percentil pré-flop mínimo da mão do oponente i: com 0.75, só
 * entram mãos do top 25%. Assim o bot "Extremo" estima o range de quem aumentou.
 */
export function equidade(
  minhas: readonly [Carta, Carta],
  board: readonly Carta[],
  oponentes: number,
  iteracoes: number,
  aleatorio: Aleatorio,
  faixas: readonly number[] = [],
): number {
  if (oponentes <= 0) return 1;
  const conhecidas = new Set<Carta>([...minhas, ...board]);
  const restantes: Carta[] = [];
  for (let c = 0; c < 52; c++) if (!conhecidas.has(c)) restantes.push(c);

  const faltamNoBoard = 5 - board.length;
  const minhaMao = [minhas[0], minhas[1], ...board, 0, 0, 0, 0, 0].slice(0, 7);
  const maoOponente = [0, 0, ...board, 0, 0, 0, 0, 0].slice(0, 7);
  let pontos = 0;

  for (let it = 0; it < iteracoes; it++) {
    const baralho = restantes.slice();
    let topo = baralho.length;
    const sacar = (): Carta => {
      const i = Math.floor(aleatorio() * topo);
      topo--;
      const carta = baralho[i]!;
      baralho[i] = baralho[topo]!;
      baralho[topo] = carta;
      return carta;
    };

    // Mãos dos oponentes, respeitando a faixa estimada (com limite de tentativas).
    const maos: [Carta, Carta][] = [];
    for (let o = 0; o < oponentes; o++) {
      const minimo = faixas[o] ?? 0;
      let a = sacar();
      let b = sacar();
      for (let tentativa = 0; minimo > 0 && tentativa < 12 && percentilPreflop(a, b) < minimo; tentativa++) {
        // devolve as duas e tenta outra combinação
        topo += 2;
        a = sacar();
        b = sacar();
      }
      maos.push([a, b]);
    }

    const completar: Carta[] = [];
    for (let k = 0; k < faltamNoBoard; k++) completar.push(sacar());
    for (let k = 0; k < faltamNoBoard; k++) {
      minhaMao[2 + board.length + k] = completar[k]!;
      maoOponente[2 + board.length + k] = completar[k]!;
    }

    const minha = avaliar(minhaMao);
    let melhorOponente = -1;
    let empatados = 0;
    for (const [a, b] of maos) {
      maoOponente[0] = a;
      maoOponente[1] = b;
      const p = avaliar(maoOponente);
      if (p > melhorOponente) {
        melhorOponente = p;
        empatados = 1;
      } else if (p === melhorOponente) empatados++;
    }
    if (minha > melhorOponente) pontos += 1;
    else if (minha === melhorOponente) pontos += 1 / (empatados + 1);
  }
  return pontos / iteracoes;
}
