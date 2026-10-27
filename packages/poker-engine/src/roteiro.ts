import { baralhoOrdenado, cartas, type Carta } from "./cartas";

/**
 * Monta um baralho em que cada jogador recebe as cartas pedidas e o board sai como indicado,
 * respeitando a ordem real: duas voltas a partir da esquerda do botão, queima antes de cada rua.
 * Usado nos testes e nos cenários do tutorial: o resultado é um baralho normal de 52 cartas.
 */
export function baralhoRoteirizado(maos: string[], board: string, botao: number): Carta[] {
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

