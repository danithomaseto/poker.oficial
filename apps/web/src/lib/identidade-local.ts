"use client";

import { useSyncExternalStore } from "react";
import { JOGADOR_PADRAO, type JogadorTreino } from "@/components/treino/jogador-padrao";
import { aparenciaSchema } from "./validacao/aparencia";

/**
 * Cópia local da carteirinha (nome + visual) para o treino, o tutorial e o progresso
 * funcionarem sem internet e sem login. É gravada quando você abre o lobby logado.
 */
const CHAVE = "poker-amigos:identidade";
const ouvintes = new Set<() => void>();
let cache: JogadorTreino | null = null;

function ler(): JogadorTreino {
  if (cache) return cache;
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) ?? "null") as { nome?: unknown; aparencia?: unknown } | null;
    const aparencia = aparenciaSchema.safeParse(bruto?.aparencia);
    cache =
      bruto && typeof bruto.nome === "string" && aparencia.success
        ? { nome: bruto.nome.slice(0, 20), aparencia: aparencia.data }
        : JOGADOR_PADRAO;
  } catch {
    cache = JOGADOR_PADRAO;
  }
  return cache;
}

export function salvarIdentidadeLocal(identidade: JogadorTreino) {
  cache = identidade;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(identidade));
  } catch {
    // sem armazenamento: vale só nesta aba
  }
  ouvintes.forEach((f) => f());
}

export function useIdentidadeLocal(): JogadorTreino {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    ler,
    () => JOGADOR_PADRAO,
  );
}
