"use client";

import { useSyncExternalStore } from "react";
import type { Perfis } from "@poker/bots";
import type { EstadoMao } from "@poker/engine";
import type { ConfigTreino } from "./mesas";
import type { Estatisticas, LinhaHistorico, Lugar } from "./use-mesa-treino";

/**
 * Partida de treino em andamento, guardada neste aparelho a cada jogada. Sair da tela (pelo
 * botão Sair, pelo menu ou fechando a aba) não perde nada: o Treino oferece "Retomar partida".
 * Só existe uma partida salva por vez; sentar em outra mesa substitui a anterior.
 */
export interface PartidaSalva {
  versao: 1;
  salvoEm: string;
  config: ConfigTreino;
  lugares: Lugar[];
  mao: EstadoMao | null;
  numeroMao: number;
  botaoAssento: number | null;
  finalizada: number;
  estatisticas: Estatisticas;
  historico: LinhaHistorico[];
  sessaoId: string;
  maosNaSessao: number;
  perfis: Perfis;
}

const CHAVE = "poker-amigos:partida-treino";
const ouvintes = new Set<() => void>();
let bruto: string | null = null;
let cache: PartidaSalva | null = null;

function valida(p: unknown): p is PartidaSalva {
  const v = p as Partial<PartidaSalva> | null;
  return (
    !!v &&
    v.versao === 1 &&
    typeof v.config?.id === "string" &&
    Array.isArray(v.lugares) &&
    v.lugares.some((l) => l.tipo === "voce") &&
    (v.mao === null || Array.isArray(v.mao?.jogadores))
  );
}

function ler(): PartidaSalva | null {
  let atual: string | null = null;
  try {
    atual = localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
  if (atual === bruto) return cache;
  bruto = atual;
  try {
    const p: unknown = atual ? JSON.parse(atual) : null;
    cache = valida(p) ? p : null;
  } catch {
    cache = null;
  }
  return cache;
}

export function salvarPartida(p: Omit<PartidaSalva, "versao" | "salvoEm">) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, salvoEm: new Date().toISOString(), ...p }));
  } catch {
    return; // sem armazenamento: a partida vale só enquanto a tela estiver aberta
  }
  ouvintes.forEach((f) => f());
}

export function descartarPartida() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // nada guardado
  }
  ouvintes.forEach((f) => f());
}

/** `undefined` antes de o navegador responder (pré-render/hidratação); depois, a partida ou null. */
export function usePartidaSalva(): PartidaSalva | null | undefined {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      const outraAba = (e: StorageEvent) => e.key === CHAVE && f();
      window.addEventListener("storage", outraAba);
      return () => {
        ouvintes.delete(f);
        window.removeEventListener("storage", outraAba);
      };
    },
    ler,
    () => undefined,
  );
}
