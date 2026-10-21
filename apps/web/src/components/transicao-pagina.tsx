import { ViewTransition, type ReactNode } from "react";

/**
 * Envolve o conteúdo de cada página para animar a navegação:
 * links marcados com `nav-forward` deslizam para a esquerda e `nav-back` para a direita.
 * Precisa ficar no page.tsx (não no layout), porque layouts persistem entre rotas.
 */
export function TransicaoPagina({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
