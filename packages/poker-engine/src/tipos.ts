import type { Carta } from "./cartas";

export type Fase = "preflop" | "flop" | "turn" | "river" | "encerrada";

export interface ConfigMesa {
  smallBlind: number;
  bigBlind: number;
  /** Ante por jogador. Desligado (0) por padrão. */
  ante: number;
}

/** Quem senta na mão: só jogadores com fichas entram. */
export interface EntradaJogador {
  id: string;
  nome: string;
  assento: number;
  fichas: number;
}

export type TipoAcao = "desistir" | "passar" | "pagar" | "apostar" | "aumentar" | "allin";

/**
 * Intenção do jogador. Em `apostar` e `aumentar`, `valor` é o TOTAL que o jogador terá
 * apostado nesta rodada depois da ação ("aumentar para 300"), não o acréscimo.
 */
export interface Acao {
  tipo: TipoAcao;
  valor?: number;
}

export interface UltimaAcao {
  tipo: TipoAcao;
  /** Total apostado na rodada depois da ação. */
  valor: number;
  allIn: boolean;
}

export interface JogadorNaMao {
  id: string;
  nome: string;
  assento: number;
  /** Fichas atrás, ainda não apostadas. */
  fichas: number;
  /** Fichas com que entrou na mão (para conferências e resumo). */
  fichasIniciais: number;
  apostaRodada: number;
  totalApostado: number;
  cartas: readonly [Carta, Carta];
  desistiu: boolean;
  allIn: boolean;
  /** Já agiu nesta rodada de apostas desde a última vez que precisou responder. */
  agiu: boolean;
  /** Nível da aposta quando agiu pela última vez nesta rodada (-1 = ainda não agiu). */
  nivelQuandoAgiu: number;
  ultimaAcao: UltimaAcao | null;
}

export interface AcaoRegistrada {
  indice: number;
  fase: Fase;
  tipo: TipoAcao;
  valor: number;
}

export interface Pote {
  valor: number;
  /** Índices dos jogadores que concorrem a este pote. */
  elegiveis: number[];
}

export interface PoteDecidido extends Pote {
  ganhadores: number[];
}

export interface MaoRevelada {
  indice: number;
  cartas: readonly [Carta, Carta];
  pontuacao: number;
  descricao: string;
  melhoresCinco: Carta[];
}

export interface ResultadoMao {
  /** false quando todos desistiram e o último levou sem mostrar. */
  showdown: boolean;
  potes: PoteDecidido[];
  /** Fichas recebidas por índice de jogador (0 para quem não ganhou nada). */
  ganhos: number[];
  maos: MaoRevelada[];
}

export interface EstadoMao {
  config: ConfigMesa;
  numero: number;
  /** Ordenados por assento. Todas as posições abaixo são índices deste array. */
  jogadores: JogadorNaMao[];
  botao: number;
  smallBlind: number;
  bigBlind: number;
  fase: Fase;
  board: Carta[];
  /** Cartas que ainda não saíram. Nunca sai do servidor (ou do controlador local). */
  baralho: Carta[];
  queimadas: Carta[];
  vez: number | null;
  apostaAtual: number;
  /** Tamanho do último aumento completo; define o aumento mínimo. */
  ultimoAumento: number;
  /** Nível da aposta após o último aumento completo (reabre a ação). */
  nivelUltimoAumentoCompleto: number;
  acoes: AcaoRegistrada[];
  resultado: ResultadoMao | null;
}

export type Evento =
  | { tipo: "inicio"; numero: number; botao: number; smallBlind: number; bigBlind: number }
  | { tipo: "blind"; indice: number; qual: "ante" | "pequeno" | "grande"; valor: number }
  | { tipo: "acao"; indice: number; acao: TipoAcao; valor: number; allIn: boolean }
  | { tipo: "rodada"; fase: Fase; cartas: Carta[] }
  | { tipo: "showdown"; maos: MaoRevelada[] }
  | { tipo: "pote"; valor: number; ganhadores: number[] }
  | { tipo: "fim" };

export interface Transicao {
  estado: EstadoMao;
  eventos: Evento[];
}

export interface AcoesValidas {
  podeDesistir: boolean;
  podePassar: boolean;
  /** Valor a pagar (já limitado às fichas); 0 se não há o que pagar. */
  valorParaPagar: number;
  /** Faixa do total da rodada para apostar, ou null. */
  apostar: { min: number; max: number } | null;
  /** Faixa do total da rodada para aumentar, ou null. */
  aumentar: { min: number; max: number } | null;
  /** Total da rodada se for all-in. */
  valorAllIn: number;
}

export class ErroAcao extends Error {
  constructor(
    readonly codigo: "mao_encerrada" | "fora_da_vez" | "acao_invalida" | "valor_invalido",
    mensagem: string,
  ) {
    super(mensagem);
    this.name = "ErroAcao";
  }
}
