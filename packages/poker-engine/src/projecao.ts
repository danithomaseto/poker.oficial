/// <reference path="./globais.d.ts" />
import type { Carta } from "./cartas";
import { totalNoPote } from "./potes";
import type { EstadoMao, Fase, ResultadoMao, UltimaAcao } from "./tipos";

/**
 * Visão filtrada do estado: a ÚNICA forma de estado que pode sair do servidor (ou que um bot
 * pode ler). Sem baralho, sem cartas queimadas e sem cartas fechadas alheias.
 */
export interface JogadorVisivel {
  indice: number;
  id: string;
  nome: string;
  assento: number;
  fichas: number;
  apostaRodada: number;
  totalApostado: number;
  desistiu: boolean;
  allIn: boolean;
  ultimaAcao: UltimaAcao | null;
  /** Só as próprias cartas, ou as de quem chegou ao showdown. */
  cartas: readonly [Carta, Carta] | null;
}

export interface VisaoMao {
  numero: number;
  fase: Fase;
  smallBlindValor: number;
  bigBlindValor: number;
  botao: number;
  smallBlind: number;
  bigBlind: number;
  board: Carta[];
  vez: number | null;
  apostaAtual: number;
  ultimoAumento: number;
  pote: number;
  jogadores: JogadorVisivel[];
  /** Índice de quem está vendo, ou null para espectador. */
  eu: number | null;
  resultado: ResultadoMao | null;
  historico: EstadoMao["acoes"];
}

export function projetarParaJogador(estado: EstadoMao, quem: number | "espectador"): VisaoMao {
  const eu = quem === "espectador" ? null : quem;
  const revelados = new Set(
    estado.resultado?.showdown ? estado.resultado.maos.map((m) => m.indice) : [],
  );

  return {
    numero: estado.numero,
    fase: estado.fase,
    smallBlindValor: estado.config.smallBlind,
    bigBlindValor: estado.config.bigBlind,
    botao: estado.botao,
    smallBlind: estado.smallBlind,
    bigBlind: estado.bigBlind,
    board: [...estado.board],
    vez: estado.vez,
    apostaAtual: estado.apostaAtual,
    ultimoAumento: estado.ultimoAumento,
    pote: totalNoPote(estado.jogadores),
    eu,
    resultado: estado.resultado ? structuredClone(estado.resultado) : null,
    historico: estado.acoes.map((a) => ({ ...a })),
    jogadores: estado.jogadores.map((j, i) => ({
      indice: i,
      id: j.id,
      nome: j.nome,
      assento: j.assento,
      fichas: j.fichas,
      apostaRodada: j.apostaRodada,
      totalApostado: j.totalApostado,
      desistiu: j.desistiu,
      allIn: j.allIn,
      ultimaAcao: j.ultimaAcao ? { ...j.ultimaAcao } : null,
      cartas: i === eu || revelados.has(i) ? j.cartas : null,
    })),
  };
}
