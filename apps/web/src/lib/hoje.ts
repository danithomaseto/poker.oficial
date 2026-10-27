"use client";

import { useSyncExternalStore } from "react";
import { diaSaoPaulo } from "@poker/progressao";

const nada = () => () => {};

/**
 * Dia de hoje em São Paulo (AAAA-MM-DD), lido só no navegador. No pré-render vale null: a
 * página estática não pode "congelar" a data do build.
 */
export function useHoje(): string | null {
  return useSyncExternalStore(nada, () => diaSaoPaulo(new Date().toISOString()), () => null);
}
