"use client";

import { useEffect } from "react";
import { aplicarNoDocumento } from "@/lib/preferencias";

/** Aplica as preferências salvas no aparelho assim que a página abre. */
export function AplicarPreferencias() {
  useEffect(() => {
    aplicarNoDocumento();
  }, []);
  return null;
}
