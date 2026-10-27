"use client";

import { useSyncExternalStore } from "react";

/**
 * Preferências do jogador guardadas neste aparelho (localStorage). Cada uma tem efeito real:
 * nada aqui é decorativo. Se o navegador bloquear o armazenamento, valem os padrões.
 */
export interface Preferencias {
  /** Ouros em azul e paus em verde, como nos clientes de poker profissionais. */
  baralho4Cores: boolean;
  /** Ritmo inicial dos bots no treino (dá para trocar durante a mesa). */
  velocidadeBots: "normal" | "rapida";
  /** Começa a próxima mão sozinho alguns segundos depois do resultado. */
  avancoAutomatico: boolean;
  /** Mostra "sua mão" e as odds do pote no painel de ações. */
  dicasTreino: boolean;
  /** Desliga animações do jogo, mesmo se o sistema não pedir. */
  reduzirAnimacoes: boolean;
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  baralho4Cores: false,
  velocidadeBots: "normal",
  avancoAutomatico: true,
  dicasTreino: true,
  reduzirAnimacoes: false,
};

const CHAVE = "poker-amigos:preferencias";
const ouvintes = new Set<() => void>();
let atual: Preferencias | null = null;

function ler(): Preferencias {
  if (atual) return atual;
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "{}") as Partial<Preferencias>;
    atual = { ...PREFERENCIAS_PADRAO, ...salvo };
  } catch {
    atual = PREFERENCIAS_PADRAO;
  }
  return atual;
}

/** Reflete as preferências visuais no <html> (o CSS lê data-baralho e data-movimento). */
export function aplicarNoDocumento(p: Preferencias = ler()): void {
  const raiz = document.documentElement;
  raiz.dataset.baralho = p.baralho4Cores ? "4cores" : "2cores";
  raiz.dataset.movimento = p.reduzirAnimacoes ? "reduzido" : "normal";
}

export function salvarPreferencias(parcial: Partial<Preferencias>): void {
  atual = { ...ler(), ...parcial };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atual));
  } catch {
    // Armazenamento indisponível (aba anônima, bloqueio): vale só nesta sessão.
  }
  aplicarNoDocumento(atual);
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

export function usePreferencias(): [Preferencias, typeof salvarPreferencias] {
  const preferencias = useSyncExternalStore(assinar, ler, () => PREFERENCIAS_PADRAO);
  return [preferencias, salvarPreferencias];
}
