import type { AparenciaDemo } from "../ilustracoes/avatar";

/** Fica fora do módulo cliente para Server Components poderem ler o valor. */
export interface JogadorTreino {
  nome: string;
  aparencia: AparenciaDemo;
}

export const JOGADOR_PADRAO: JogadorTreino = {
  nome: "Você",
  aparencia: {
    pele: "#d39a6a",
    cabelo: { estilo: "curto", cor: "#1d1410" },
    roupa: "#c99a3b",
    acessorio: "nenhum",
    fundo: "#145236",
  },
};
