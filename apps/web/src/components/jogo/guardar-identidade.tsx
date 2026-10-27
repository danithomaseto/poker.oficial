"use client";

import { useEffect } from "react";
import type { JogadorTreino } from "../treino/jogador-padrao";
import { salvarIdentidadeLocal } from "@/lib/identidade-local";

/** Guarda a carteirinha da conta neste aparelho (para o treino offline usar). */
export function GuardarIdentidade({ identidade }: { identidade: JogadorTreino }) {
  useEffect(() => {
    salvarIdentidadeLocal(identidade);
  }, [identidade]);
  return null;
}
