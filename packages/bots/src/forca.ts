import { naipeDe, valorDe, type Carta } from "@poker/engine";

/**
 * Força pré-flop pela fórmula de Chen (Bill Chen), normalizada para 0..1.
 * Rápida e boa o bastante para montar faixas de mãos ("o oponente aumentou: provavelmente
 * tem uma mão do top 25%").
 */
export function pontosChen(c1: Carta, c2: Carta): number {
  const v1 = valorDe(c1);
  const v2 = valorDe(c2);
  const alto = Math.max(v1, v2);
  const baixo = Math.min(v1, v2);
  const pontosCarta = (v: number) =>
    v === 14 ? 10 : v === 13 ? 8 : v === 12 ? 7 : v === 11 ? 6 : v / 2;

  let pontos = pontosCarta(alto);
  if (v1 === v2) return Math.max(5, pontos * 2);

  if (naipeDe(c1) === naipeDe(c2)) pontos += 2;
  const intervalo = alto - baixo - 1;
  pontos -=
    intervalo <= 0 ? 0 : intervalo === 1 ? 1 : intervalo === 2 ? 2 : intervalo === 3 ? 4 : 5;
  if (intervalo <= 1 && alto < 12) pontos += 1;
  return Math.ceil(pontos);
}

/** Chen vai de -1 (7-2 de naipes diferentes) a 20 (AA). */
export function forcaPreflop(c1: Carta, c2: Carta): number {
  return (pontosChen(c1, c2) + 1) / 21;
}

/**
 * Percentil aproximado da força pré-flop entre as 1326 combinações: 0.9 significa "melhor
 * que 90% das mãos". Calculado uma vez e guardado.
 */
let tabelaPercentil: Map<number, number> | null = null;

export function percentilPreflop(c1: Carta, c2: Carta): number {
  if (!tabelaPercentil) {
    const forcas: number[] = [];
    for (let a = 0; a < 52; a++) for (let b = a + 1; b < 52; b++) forcas.push(forcaPreflop(a, b));
    forcas.sort((x, y) => x - y);
    tabelaPercentil = new Map();
    forcas.forEach((f, i) => tabelaPercentil!.set(f, (i + 1) / forcas.length));
  }
  return tabelaPercentil.get(forcaPreflop(c1, c2)) ?? 0.5;
}
