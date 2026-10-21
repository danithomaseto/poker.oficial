import type { CSSProperties } from "react";

/** Atraso da animação de revelar (lido pelo CSS de [data-revelar]). */
export function atraso(ms: number): CSSProperties {
  return { "--atraso": `${ms}ms` } as CSSProperties;
}
