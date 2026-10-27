import type { NivelBot } from "@poker/bots";

export type NivelMesa = NivelBot | "misto";

export interface ConfigTreino {
  id: string;
  nome: string;
  descricao: string;
  nivel: NivelMesa;
  bots: number;
  fichasIniciais: number;
  bigBlind: number;
  /** Blinds dobram a cada N mãos (0 = nunca). */
  subirBlindsACada: number;
}

/** Mesas prontas da casa, da mais tranquila à mais cascuda. */
export const MESAS_DA_CASA: ConfigTreino[] = [
  {
    id: "varanda",
    nome: "Varanda da Vó",
    descricao: "Três bots que pagam qualquer coisa. Pra aprender sem pressão.",
    nivel: "facil",
    bots: 3,
    fichasIniciais: 1000,
    bigBlind: 20,
    subirBlindsACada: 0,
  },
  {
    id: "boteco",
    nome: "Boteco do Zeca",
    descricao: "Cinco bots que fazem a conta do pote antes de pagar.",
    nivel: "medio",
    bots: 5,
    fichasIniciais: 2500,
    bigBlind: 50,
    subirBlindsACada: 0,
  },
  {
    id: "salao",
    nome: "Salão dos Fundos",
    descricao: "Simulam milhares de mãos por decisão e respeitam posição.",
    nivel: "dificil",
    bots: 5,
    fichasIniciais: 5000,
    bigBlind: 100,
    subirBlindsACada: 0,
  },
  {
    id: "diretoria",
    nome: "Mesa da Diretoria",
    descricao: "Leem o seu estilo, estimam seu range e blefam na medida.",
    nivel: "extremo",
    bots: 5,
    fichasIniciais: 10000,
    bigBlind: 200,
    subirBlindsACada: 0,
  },
  {
    id: "mano",
    nome: "Mano a mano",
    descricao: "Heads-up contra um bot difícil, com blinds subindo a cada 10 mãos.",
    nivel: "dificil",
    bots: 1,
    fichasIniciais: 3000,
    bigBlind: 60,
    subirBlindsACada: 10,
  },
  {
    id: "casa-cheia",
    nome: "Casa cheia",
    descricao: "Mesa de 9 com bots de todos os níveis misturados.",
    nivel: "misto",
    bots: 8,
    fichasIniciais: 2500,
    bigBlind: 50,
    subirBlindsACada: 0,
  },
];

export const NIVEIS_ORDEM: NivelBot[] = ["facil", "medio", "dificil", "extremo"];

/** Nível de cada bot: na mesa mista, distribui os quatro níveis em rodízio. */
export function nivelDoBot(nivel: NivelMesa, posicao: number): NivelBot {
  return nivel === "misto" ? NIVEIS_ORDEM[posicao % 4]! : nivel;
}
