import type { IdModuloTutorial } from "@poker/progressao";

/** Módulos do tutorial, na ordem. O conteúdo de cada um fica em `conteudo.tsx`. */
export interface InfoModulo {
  id: IdModuloTutorial;
  numero: number;
  titulo: string;
  resumo: string;
}

export const MODULOS_TUTORIAL: readonly InfoModulo[] = [
  { id: "mesa", numero: 1, titulo: "Conhecendo a mesa", resumo: "Suas cartas, cartas comunitárias, pote, fichas e o botão do dealer." },
  { id: "objetivo", numero: 2, titulo: "O objetivo do poker", resumo: "Como se ganha uma mão e como suas cartas se juntam às da mesa." },
  { id: "ranking", numero: 3, titulo: "Ranking das mãos", resumo: "Da carta alta ao royal flush, comparando mãos de verdade." },
  { id: "ordem", numero: 4, titulo: "A ordem da partida", resumo: "Dealer, small blind, big blind e quem fala primeiro." },
  { id: "acoes", numero: 5, titulo: "Ações disponíveis", resumo: "Desistir, passar, pagar, apostar, aumentar e all-in." },
  { id: "rodadas", numero: 6, titulo: "Rodadas de apostas", resumo: "Pré-flop, flop, turn e river numa mão jogada por você." },
  { id: "pratica", numero: 7, titulo: "Prática guiada", resumo: "Uma mão forte do começo ao fim, com dicas a cada decisão." },
  { id: "vencedor", numero: 8, titulo: "Quem ganha o pote", resumo: "Showdown, comparação das mãos e divisão do pote." },
  { id: "estrategia", numero: 9, titulo: "Estratégia básica", resumo: "Posição, força da mão, tamanho da aposta e risco." },
  { id: "desafio", numero: 10, titulo: "Desafio final", resumo: "Uma mão contra bots de verdade, com análise das suas decisões." },
];
