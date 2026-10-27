/**
 * Fontes de XP: cada ganho vem de um EVENTO com uma chave única (idempotência). O cliente
 * nunca manda "quanto XP ganhou": manda o evento, e quem calcula é esta tabela (no aparelho,
 * para o progresso local) e a função SQL `registrar_evento_xp` (no servidor, que é a verdade).
 *
 * Princípios: premia aprender e participar, não ganhar fichas; repetíveis têm teto diário.
 */
import { IDS_MODULOS_TUTORIAL } from "./tutorial";

export type TipoEventoXp =
  | "tutorial_modulo"
  | "tutorial_completo"
  | "mao_treino"
  | "sessao_treino"
  | "objetivo_diario";

export interface RegraXp {
  xp: number;
  /** Quantas vezes por dia (fuso de São Paulo) o tipo rende XP. null = sem teto (mas chave única). */
  limiteDiario: number | null;
  descricao: string;
}

export const REGRAS_XP: Record<TipoEventoXp, RegraXp> = {
  tutorial_modulo: { xp: 60, limiteDiario: null, descricao: "Concluir um módulo do tutorial (uma vez por módulo)" },
  tutorial_completo: { xp: 150, limiteDiario: null, descricao: "Concluir os 10 módulos do tutorial (uma vez)" },
  mao_treino: { xp: 3, limiteDiario: 100, descricao: "Jogar uma mão inteira no treino, ganhando ou não (até 100 por dia)" },
  sessao_treino: { xp: 40, limiteDiario: 3, descricao: "Fechar uma sessão de treino com 15 mãos ou mais (até 3 por dia)" },
  objetivo_diario: { xp: 60, limiteDiario: 1, descricao: "Objetivo do dia: jogar 30 mãos de treino" },
};

/** Mãos na mesma sessão para contar como sessão de treino; mãos no dia para o objetivo. */
export const MAOS_POR_SESSAO = 15;
export const MAOS_OBJETIVO_DIARIO = 30;

export interface EventoXp {
  id: string;
  tipo: TipoEventoXp;
  /** Única por jogador: "tutorial:mesa", "mao:<sessao>:<numero>", "diario:2026-10-27"... */
  chave: string;
  xp: number;
  /** ISO 8601. */
  ocorridoEm: string;
}

export type MotivoRecusa = "duplicado" | "limite_diario" | "tipo_invalido" | "chave_invalida";

/** Dia no fuso de São Paulo (AAAA-MM-DD), usado nos tetos diários. */
export function diaSaoPaulo(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "invalido";
  // UTC-3 fixo (o Brasil não tem horário de verão desde 2019).
  return new Date(data.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

const MODULOS = IDS_MODULOS_TUTORIAL.join("|");

const PREFIXOS: Record<TipoEventoXp, RegExp> = {
  tutorial_modulo: new RegExp(`^tutorial:(${MODULOS})$`),
  tutorial_completo: /^tutorial:completo$/,
  mao_treino: /^mao:[A-Za-z0-9-]{6,64}:\d{1,6}$/,
  sessao_treino: /^sessao:[A-Za-z0-9-]{6,64}$/,
  objetivo_diario: /^diario:\d{4}-\d{2}-\d{2}$/,
};

/**
 * Decide quanto um evento vale diante dos eventos já aceitos. Mesma regra do servidor:
 * chave repetida não paga de novo e cada tipo respeita o teto do dia.
 */
export function avaliarEvento(
  novo: { tipo: string; chave: string; ocorridoEm: string },
  aceitos: readonly Pick<EventoXp, "tipo" | "chave" | "ocorridoEm">[],
): { aceito: true; xp: number } | { aceito: false; motivo: MotivoRecusa } {
  if (!(novo.tipo in REGRAS_XP)) return { aceito: false, motivo: "tipo_invalido" };
  const tipo = novo.tipo as TipoEventoXp;
  if (!PREFIXOS[tipo].test(novo.chave)) return { aceito: false, motivo: "chave_invalida" };
  if (aceitos.some((e) => e.chave === novo.chave)) return { aceito: false, motivo: "duplicado" };
  const regra = REGRAS_XP[tipo];
  if (regra.limiteDiario !== null) {
    const dia = diaSaoPaulo(novo.ocorridoEm);
    const noDia = aceitos.filter((e) => e.tipo === tipo && diaSaoPaulo(e.ocorridoEm) === dia).length;
    if (noDia >= regra.limiteDiario) return { aceito: false, motivo: "limite_diario" };
  }
  return { aceito: true, xp: regra.xp };
}

export const somaXp = (eventos: readonly Pick<EventoXp, "xp">[]) => eventos.reduce((s, e) => s + e.xp, 0);
