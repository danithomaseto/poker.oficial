/**
 * Dados visuais de cartas usados nas ilustrações do site.
 * Não é o modelo de cartas do motor de poker (que virá em packages/poker-engine).
 */
export type Naipe = "espadas" | "copas" | "ouros" | "paus";

export type Valor = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export type CartaVisual = { valor: Valor; naipe: Naipe };

export const naipes: Record<Naipe, { simbolo: string; vermelho: boolean; nome: string }> = {
  espadas: { simbolo: "♠", vermelho: false, nome: "espadas" },
  copas: { simbolo: "♥", vermelho: true, nome: "copas" },
  ouros: { simbolo: "♦", vermelho: true, nome: "ouros" },
  paus: { simbolo: "♣", vermelho: false, nome: "paus" },
};

const nomesValor: Record<Valor, string> = {
  A: "Ás",
  K: "Rei",
  Q: "Dama",
  J: "Valete",
  "10": "Dez",
  "9": "Nove",
  "8": "Oito",
  "7": "Sete",
  "6": "Seis",
  "5": "Cinco",
  "4": "Quatro",
  "3": "Três",
  "2": "Dois",
};

/** Nome por extenso para leitores de tela, ex.: "Ás de espadas". */
export function nomeCarta({ valor, naipe }: CartaVisual): string {
  return `${nomesValor[valor]} de ${naipes[naipe].nome}`;
}

/** Atalho para escrever cartas nas ilustrações: c("A", "espadas"). */
export function c(valor: Valor, naipe: Naipe): CartaVisual {
  return { valor, naipe };
}
