import { naipeDe, valorDe, type Carta } from "./cartas";

/**
 * Avaliador de mãos de 5 a 7 cartas.
 *
 * Devolve uma pontuação inteira: quanto maior, melhor. A categoria fica nos bits altos e os
 * valores de desempate (kickers) em cinco "nibbles" de 4 bits, do mais importante ao menos:
 *
 *   pontuação = categoria * 16^5 + v1 * 16^4 + v2 * 16^3 + v3 * 16^2 + v4 * 16 + v5
 *
 * Sem alocação por chamada além de arrays pequenos e reaproveitados: rápido o bastante para
 * milhares de simulações por decisão de bot.
 */
export const Categoria = {
  CartaAlta: 0,
  Par: 1,
  DoisPares: 2,
  Trinca: 3,
  Sequencia: 4,
  Flush: 5,
  FullHouse: 6,
  Quadra: 7,
  StraightFlush: 8,
} as const;
export type Categoria = (typeof Categoria)[keyof typeof Categoria];

const NOMES_CATEGORIA = [
  "Carta alta",
  "Par",
  "Dois pares",
  "Trinca",
  "Sequência",
  "Flush",
  "Full house",
  "Quadra",
  "Straight flush",
] as const;

const BASE = 0x100000;

function compor(categoria: number, v1 = 0, v2 = 0, v3 = 0, v4 = 0, v5 = 0): number {
  return categoria * BASE + v1 * 0x10000 + v2 * 0x1000 + v3 * 0x100 + v4 * 0x10 + v5;
}

/** Maior carta de uma sequência presente na máscara de valores (bit v = valor v), ou 0. */
function topoDaSequencia(mascara: number): number {
  // O Ás também vale 1 para a "roda" (A-2-3-4-5).
  const m = mascara & (1 << 14) ? mascara | (1 << 1) : mascara;
  for (let topo = 14; topo >= 5; topo--) {
    if (((m >> (topo - 4)) & 0b11111) === 0b11111) return topo;
  }
  return 0;
}

/** Os `quantos` maiores valores da máscara, do maior para o menor. */
function maioresDaMascara(mascara: number, quantos: number, saida: number[]): void {
  saida.length = 0;
  for (let v = 14; v >= 2 && saida.length < quantos; v--) {
    if (mascara & (1 << v)) saida.push(v);
  }
}

const contagem = new Uint8Array(15);
const porNaipe = new Int32Array(4);
const quantosPorNaipe = new Uint8Array(4);
const auxiliar: number[] = [];

export function avaliar(cartas: readonly Carta[]): number {
  if (cartas.length < 5 || cartas.length > 7) {
    throw new RangeError(`O avaliador recebe de 5 a 7 cartas (recebeu ${cartas.length}).`);
  }
  contagem.fill(0);
  porNaipe.fill(0);
  quantosPorNaipe.fill(0);
  let mascara = 0;

  for (const carta of cartas) {
    const v = valorDe(carta);
    const n = naipeDe(carta);
    contagem[v]!++;
    porNaipe[n]! |= 1 << v;
    quantosPorNaipe[n]!++;
    mascara |= 1 << v;
  }

  // Flush e straight flush
  let mascaraFlush = 0;
  for (let n = 0; n < 4; n++) {
    if (quantosPorNaipe[n]! >= 5) {
      mascaraFlush = porNaipe[n]!;
      const topo = topoDaSequencia(mascaraFlush);
      if (topo) return compor(Categoria.StraightFlush, topo);
      break;
    }
  }

  // Agrupamentos, do maior valor para o menor
  let quadra = 0;
  let trinca1 = 0;
  let trinca2 = 0;
  let par1 = 0;
  let par2 = 0;
  let par3 = 0;
  for (let v = 14; v >= 2; v--) {
    const c = contagem[v]!;
    if (c === 4) quadra = v;
    else if (c === 3) {
      if (!trinca1) trinca1 = v;
      else if (!trinca2) trinca2 = v;
    } else if (c === 2) {
      if (!par1) par1 = v;
      else if (!par2) par2 = v;
      else if (!par3) par3 = v;
    }
  }

  if (quadra) {
    maioresDaMascara(mascara & ~(1 << quadra), 1, auxiliar);
    return compor(Categoria.Quadra, quadra, auxiliar[0]);
  }

  if (trinca1 && (trinca2 || par1)) {
    return compor(Categoria.FullHouse, trinca1, Math.max(trinca2, par1));
  }

  if (mascaraFlush) {
    maioresDaMascara(mascaraFlush, 5, auxiliar);
    return compor(Categoria.Flush, auxiliar[0], auxiliar[1], auxiliar[2], auxiliar[3], auxiliar[4]);
  }

  const topoSequencia = topoDaSequencia(mascara);
  if (topoSequencia) return compor(Categoria.Sequencia, topoSequencia);

  if (trinca1) {
    maioresDaMascara(mascara & ~(1 << trinca1), 2, auxiliar);
    return compor(Categoria.Trinca, trinca1, auxiliar[0], auxiliar[1]);
  }

  if (par1 && par2) {
    // Com três pares, o terceiro pode virar kicker.
    maioresDaMascara(mascara & ~(1 << par1) & ~(1 << par2), 1, auxiliar);
    return compor(Categoria.DoisPares, par1, par2, Math.max(auxiliar[0] ?? 0, par3));
  }

  if (par1) {
    maioresDaMascara(mascara & ~(1 << par1), 3, auxiliar);
    return compor(Categoria.Par, par1, auxiliar[0], auxiliar[1], auxiliar[2]);
  }

  maioresDaMascara(mascara, 5, auxiliar);
  return compor(
    Categoria.CartaAlta,
    auxiliar[0],
    auxiliar[1],
    auxiliar[2],
    auxiliar[3],
    auxiliar[4],
  );
}

export function categoriaDe(pontuacao: number): Categoria {
  return Math.floor(pontuacao / BASE) as Categoria;
}

const NOMES_VALOR: Record<number, [string, string]> = {
  2: ["Dois", "Dois"],
  3: ["Três", "Três"],
  4: ["Quatro", "Quatros"],
  5: ["Cinco", "Cincos"],
  6: ["Seis", "Seis"],
  7: ["Sete", "Setes"],
  8: ["Oito", "Oitos"],
  9: ["Nove", "Noves"],
  10: ["Dez", "Dez"],
  11: ["Valete", "Valetes"],
  12: ["Dama", "Damas"],
  13: ["Rei", "Reis"],
  14: ["Ás", "Ases"],
};

function nibble(pontuacao: number, posicao: number): number {
  return Math.floor(pontuacao / 16 ** (4 - posicao)) % 16;
}

/** Nome da mão em português, ex.: "Dois pares, Valetes e Cincos". */
export function descreverMao(pontuacao: number): string {
  const categoria = categoriaDe(pontuacao);
  const v1 = nibble(pontuacao, 0);
  const v2 = nibble(pontuacao, 1);
  const um = (v: number) => NOMES_VALOR[v]?.[0] ?? "?";
  const plural = (v: number) => NOMES_VALOR[v]?.[1] ?? "?";
  switch (categoria) {
    case Categoria.StraightFlush:
      return v1 === 14 ? "Royal flush" : `Straight flush até o ${um(v1)}`;
    case Categoria.Quadra:
      return `Quadra de ${plural(v1)}`;
    case Categoria.FullHouse:
      return `Full house, ${plural(v1)} com ${plural(v2)}`;
    case Categoria.Flush:
      return `Flush, ${um(v1)} alto`;
    case Categoria.Sequencia:
      return v1 === 5 ? "Sequência baixa (A-5)" : `Sequência até o ${um(v1)}`;
    case Categoria.Trinca:
      return `Trinca de ${plural(v1)}`;
    case Categoria.DoisPares:
      return `Dois pares, ${plural(v1)} e ${plural(v2)}`;
    case Categoria.Par:
      return `Par de ${plural(v1)}`;
    default:
      return `Carta alta, ${um(v1)}`;
  }
}

export function nomeCategoria(categoria: Categoria): string {
  return NOMES_CATEGORIA[categoria];
}

/** As cinco cartas que formam a melhor mão (para destacar na tela). Força bruta: 21 combinações. */
export function melhoresCinco(cartas: readonly Carta[]): Carta[] {
  if (cartas.length <= 5) return [...cartas];
  let melhor: Carta[] = [];
  let melhorPontuacao = -1;
  const n = cartas.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++)
          for (let e = d + 1; e < n; e++) {
            const mao = [cartas[a]!, cartas[b]!, cartas[c]!, cartas[d]!, cartas[e]!];
            const p = avaliar(mao);
            if (p > melhorPontuacao) {
              melhorPontuacao = p;
              melhor = mao;
            }
          }
  return melhor;
}
