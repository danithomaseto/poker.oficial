/**
 * Curva de níveis. Todos os parâmetros ficam aqui (e espelhados na função SQL
 * `nivel_por_xp`, conferida por teste), para ajustar o ritmo num lugar só.
 *
 * Premissas (versão 1):
 * - Uma sessão de treino típica de 20 a 30 mãos rende ~150 a 200 XP (3 XP por mão,
 *   bônus de sessão e objetivo diário).
 * - O tutorial completo rende 750 XP: leva o jogador ao nível 5 ou 6 no primeiro dia,
 *   desbloqueando os dois primeiros baralhos (níveis 3 e 5).
 * - Níveis 10 a 20 pedem algumas semanas de treino regular; o nível 30 pede meses.
 */
export const VERSAO_CURVA = 1;
export const NIVEL_MAXIMO = 30;

export const CURVA = { base: 40, expoente: 1.3 } as const;

/** XP necessário para sair do nível `n` e chegar ao `n + 1` (arredondado a dezenas). */
export function xpParaSubir(n: number): number {
  if (!Number.isInteger(n) || n < 1) throw new RangeError("Nível inválido.");
  if (n >= NIVEL_MAXIMO) return 0;
  return Math.round((CURVA.base * n ** CURVA.expoente) / 10) * 10;
}

/** XP total acumulado para chegar ao nível `n` (nível 1 = 0 XP). */
export function xpTotalDoNivel(n: number): number {
  let total = 0;
  for (let i = 1; i < Math.min(n, NIVEL_MAXIMO); i++) total += xpParaSubir(i);
  return total;
}

export interface SituacaoNivel {
  nivel: number;
  xpTotal: number;
  /** XP já feito dentro do nível atual. */
  xpNoNivel: number;
  /** XP necessário para o próximo nível (0 no nível máximo). */
  xpParaProximo: number;
  /** De 0 a 1. */
  fracao: number;
  maximo: boolean;
}

/** O nível é sempre derivado do XP total: nunca é guardado como verdade separada. */
export function situacaoPorXp(xpBruto: number): SituacaoNivel {
  const xpTotal = Math.max(0, Math.floor(Number.isFinite(xpBruto) ? xpBruto : 0));
  let nivel = 1;
  let restante = xpTotal;
  while (nivel < NIVEL_MAXIMO && restante >= xpParaSubir(nivel)) {
    restante -= xpParaSubir(nivel);
    nivel++;
  }
  const maximo = nivel >= NIVEL_MAXIMO;
  const xpParaProximo = maximo ? 0 : xpParaSubir(nivel);
  return {
    nivel,
    xpTotal,
    xpNoNivel: maximo ? 0 : restante,
    xpParaProximo,
    fracao: maximo ? 1 : restante / xpParaProximo,
    maximo,
  };
}

/** Título cosmético de cada nível. Todo nível tem algo: título, baralho ou os dois. */
export const TITULOS: readonly string[] = [
  "Novato",
  "Aprendiz",
  "Curioso do Flop",
  "Calouro da Mesa",
  "Leitor de Board",
  "Conta-Fichas",
  "Paciente",
  "Posicional",
  "Caçador de Odds",
  "Regular da Casa",
  "Mão Firme",
  "Disciplinado",
  "Estrategista",
  "Sangue Frio",
  "Veterano",
  "Leitor de Range",
  "Calculista",
  "Tubarão do Treino",
  "Mestre do River",
  "Lenda da Varanda",
  "Dono do Botão",
  "Blefe Calibrado",
  "Fichas de Aço",
  "Mesa Final",
  "Craque do Clube",
  "Olho de Lince",
  "Coração Gelado",
  "Grande Sócio",
  "Quase Lenda",
  "Mestre da Mesa",
];

export function tituloDoNivel(n: number): string {
  return TITULOS[Math.min(Math.max(Math.floor(n), 1), NIVEL_MAXIMO) - 1]!;
}
