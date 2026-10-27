/**
 * Cartas como números de 0 a 51: `(valor - 2) * 4 + naipe`.
 * Número inteiro é rápido para o avaliador e para simulações Monte Carlo dos bots.
 */
export type Carta = number;

/** Naipes na ordem dos índices: espadas, copas, ouros, paus. */
export const NAIPES = ["s", "h", "d", "c"] as const;
export type Naipe = (typeof NAIPES)[number];

const LETRAS_VALOR = "23456789TJQKA";

/** Valor de 2 a 14 (Ás = 14). */
export function valorDe(carta: Carta): number {
  return (carta >> 2) + 2;
}

/** Índice do naipe de 0 a 3. */
export function naipeDe(carta: Carta): number {
  return carta & 3;
}

export function criarCarta(valor: number, naipe: number): Carta {
  if (valor < 2 || valor > 14 || naipe < 0 || naipe > 3) {
    throw new RangeError(`Carta inválida: valor ${valor}, naipe ${naipe}`);
  }
  return (valor - 2) * 4 + naipe;
}

/** "As" para Ás de espadas, "Td" para Dez de ouros. */
export function cartaParaTexto(carta: Carta): string {
  return `${LETRAS_VALOR[valorDe(carta) - 2]}${NAIPES[naipeDe(carta)]}`;
}

export function textoParaCarta(texto: string): Carta {
  const valor = LETRAS_VALOR.indexOf(texto[0]?.toUpperCase() ?? "");
  const naipe = NAIPES.indexOf((texto[1]?.toLowerCase() ?? "") as Naipe);
  if (texto.length !== 2 || valor < 0 || naipe < 0) {
    throw new RangeError(`Carta inválida: "${texto}"`);
  }
  return criarCarta(valor + 2, naipe);
}

/** Atalho para testes e cenários: cartas("As Kd 7h") => [..]. */
export function cartas(texto: string): Carta[] {
  return texto.trim().split(/\s+/).filter(Boolean).map(textoParaCarta);
}

export function baralhoOrdenado(): Carta[] {
  return Array.from({ length: 52 }, (_, i) => i);
}

/**
 * Fisher-Yates com a fonte de aleatoriedade injetada: `inteiroAleatorio(n)` deve devolver
 * um inteiro em [0, n). No servidor use `crypto.randomInt`; no treino, `crypto.getRandomValues`.
 */
export function embaralhar(
  baralho: readonly Carta[],
  inteiroAleatorio: (n: number) => number,
): Carta[] {
  const copia = [...baralho];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = inteiroAleatorio(i + 1);
    const temp = copia[i]!;
    copia[i] = copia[j]!;
    copia[j] = temp;
  }
  return copia;
}
