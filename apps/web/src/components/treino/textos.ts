import type { TipoAcao } from "@poker/engine";

const fichas = (n: number) => n.toLocaleString("pt-BR");

/** "pagou 200", "aumentou para 600", "foi all-in (1.500)". */
export function descreverAcao(tipo: TipoAcao, valor: number, allIn: boolean): string {
  if (allIn && tipo !== "desistir" && tipo !== "passar") return `foi all-in (${fichas(valor)})`;
  switch (tipo) {
    case "desistir":
      return "desistiu";
    case "passar":
      return "passou";
    case "pagar":
      return `pagou ${fichas(valor)}`;
    case "apostar":
      return `apostou ${fichas(valor)}`;
    case "aumentar":
      return `aumentou para ${fichas(valor)}`;
    case "allin":
      return `foi all-in (${fichas(valor)})`;
  }
}

/** Rótulo curto para o balão em cima do assento. */
export function rotuloAcao(tipo: TipoAcao, valor: number, allIn: boolean): string {
  if (allIn && tipo !== "desistir" && tipo !== "passar") return "All-in";
  switch (tipo) {
    case "desistir":
      return "Desistiu";
    case "passar":
      return "Passou";
    case "pagar":
      return `Pagou`;
    case "apostar":
      return `Apostou`;
    case "aumentar":
      return `Aumentou`;
    case "allin":
      return "All-in";
  }
  return String(valor);
}

export { fichas as formatarFichas };
