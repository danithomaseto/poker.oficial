"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSyncExternalStore } from "react";
import { situacaoPorXp } from "@poker/progressao";
import { gravarValor, lerValor, listarEventos } from "./idb";
import { carregarProgresso, marcarEventos, useProgressoLocal, type EventoLocal } from "./local";

/**
 * Sincronização do progresso com a conta (Supabase), quando há internet e login.
 *
 * Regras (ver docs/progresso-e-sincronizacao.md):
 * 1. O servidor é a referência do XP validado. Ele recalcula cada evento (tipo, chave,
 *    teto diário, requisitos) e ignora quanto o aparelho "acha" que valeu.
 * 2. Envio idempotente: cada evento tem id e chave únicos; reenviar não paga de novo.
 * 3. Progresso feito como convidado neste aparelho só vai para uma conta se a pessoa
 *    aceitar juntar. Recusar mantém os dados locais, sem apagar nada.
 * 4. Nada remoto é sobrescrito pelo aparelho: XP mostrado = XP do servidor + eventos ainda
 *    pendentes (marcados como "pendente" na tela).
 */
export type EstadoSync =
  | "desconfigurado" // site sem Supabase
  | "offline"
  | "sem-conta"
  | "pede-associacao" // tem progresso de convidado e uma conta logada: precisa de resposta
  | "sincronizando"
  | "ok"
  | "erro";

interface Remoto {
  xpTotal: number;
  baralho: string;
  chaves: Set<string>;
}

interface EstadoSincronizacao {
  estado: EstadoSync;
  remoto: Remoto | null;
  contaId: string | null;
  pendentesConvidado: number;
  /** Eventos de convidado que a pessoa preferiu NÃO juntar à conta (ficam só no aparelho). */
  mantidos: Set<string>;
}

const CHAVE_DONO = "dono-dos-eventos"; // "convidado" | <id da conta>
const CHAVE_MANTIDOS = "eventos-mantidos-no-aparelho";

let atual: EstadoSincronizacao = {
  estado: "desconfigurado",
  remoto: null,
  contaId: null,
  pendentesConvidado: 0,
  mantidos: new Set(),
};
const ouvintes = new Set<() => void>();
const emitir = (parcial: Partial<EstadoSincronizacao>) => {
  atual = { ...atual, ...parcial };
  ouvintes.forEach((f) => f());
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let cliente: ReturnType<typeof createBrowserClient> | null = null;
function obterCliente() {
  if (!url || !chavePublica) return null;
  cliente ??= createBrowserClient(url, chavePublica);
  return cliente;
}

const linhaResultado = (data: unknown) =>
  (Array.isArray(data) ? data[0] : data) as
    | { aceito: boolean; motivo: string | null; xp_total: number; nivel: number }
    | undefined;

let emAndamento: Promise<void> | null = null;

export function sincronizar(): Promise<void> {
  emAndamento ??= executar().finally(() => {
    emAndamento = null;
  });
  return emAndamento;
}

async function executar() {
  const supabase = obterCliente();
  if (!supabase) return emitir({ estado: "desconfigurado" });
  if (typeof navigator !== "undefined" && !navigator.onLine) return emitir({ estado: "offline" });

  try {
    const { data: sessao } = await supabase.auth.getSession();
    const contaId = sessao.session?.user.id ?? null;
    if (!contaId) return emitir({ estado: "sem-conta", contaId: null, remoto: null });

    await carregarProgresso();
    const dono = (await lerValor<string>(CHAVE_DONO)) ?? "convidado";
    const mantidos = new Set((await lerValor<string[]>(CHAVE_MANTIDOS)) ?? []);
    const eventos = await listarEventos<EventoLocal>();
    const pendentes = eventos.filter((e) => e.estado === "local" && !mantidos.has(e.id));
    emitir({ mantidos });

    if (dono === "convidado" && pendentes.length > 0) {
      return emitir({ estado: "pede-associacao", contaId, pendentesConvidado: pendentes.length });
    }
    if (dono === "convidado") await gravarValor(CHAVE_DONO, contaId);

    emitir({ estado: "sincronizando", contaId });
    // Só envia eventos que pertencem a esta conta (outra conta no mesmo aparelho não herda).
    if (dono === contaId || dono === "convidado") {
      const ordem = [...pendentes].sort((a, b) => ordemDeEnvio(a) - ordemDeEnvio(b) || a.ocorridoEm.localeCompare(b.ocorridoEm));
      for (const e of ordem) {
        const { data, error } = await supabase.rpc("registrar_evento_xp", {
          p_id: e.id,
          p_tipo: e.tipo,
          p_chave: e.chave,
          p_ocorrido_em: e.ocorridoEm,
        });
        if (error) throw error;
        const r = linhaResultado(data);
        if (!r) continue;
        // Duplicado = o servidor já tem essa conquista (outro aparelho ou reenvio): conta uma vez só.
        const estado = r.aceito || r.motivo === "duplicado" ? "sincronizado" : "recusado";
        await marcarEventos([{ id: e.id, estado, motivo: (r.motivo ?? undefined) as EventoLocal["motivo"] }]);
      }
    }

    const { data, error } = await supabase.rpc("meu_progresso");
    if (error) throw error;
    const linha = (Array.isArray(data) ? data[0] : data) as { xp_total: number; baralho: string; chaves: string[] } | undefined;
    emitir({
      estado: "ok",
      remoto: linha ? { xpTotal: linha.xp_total, baralho: linha.baralho, chaves: new Set(linha.chaves ?? []) } : null,
    });
  } catch {
    emitir({ estado: "erro" });
  }
}

/** Requisitos do servidor: mãos antes de sessão/objetivo, módulos antes do "tutorial completo". */
function ordemDeEnvio(e: EventoLocal) {
  return e.tipo === "mao_treino" || e.tipo === "tutorial_modulo" ? 0 : 1;
}

/** Resposta da pessoa sobre juntar o progresso de convidado à conta logada. */
export async function responderAssociacao(juntar: boolean) {
  if (!atual.contaId) return;
  if (!juntar) {
    // Mantém o progresso de convidado só neste aparelho, sem apagar e sem enviar.
    const eventos = await listarEventos<EventoLocal>();
    const ids = eventos.filter((e) => e.estado === "local").map((e) => e.id);
    await gravarValor(CHAVE_MANTIDOS, [...atual.mantidos, ...ids]);
  }
  await gravarValor(CHAVE_DONO, atual.contaId);
  await sincronizar();
}

/** Grava o baralho equipado na conta (o servidor confere o nível de novo). */
export async function salvarBaralhoNaConta(id: string): Promise<boolean> {
  const supabase = obterCliente();
  if (!supabase || !atual.contaId || !navigator.onLine) return false;
  const { data, error } = await supabase.rpc("equipar_baralho", { p_baralho: id });
  return !error && data === true;
}

export function useSincronizacao() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => atual,
    () => atual,
  );
}

/**
 * Nível que vale na tela. Com conta sincronizada: XP do servidor + o que ainda está pendente
 * de envio. Sem conta: o XP deste aparelho.
 */
export function useNivelEfetivo() {
  const local = useProgressoLocal();
  const sync = useSincronizacao();
  const remoto = sync.estado === "ok" ? sync.remoto : null;
  const pendentes = remoto
    ? local.pendentes.filter((e) => !remoto.chaves.has(e.chave) && !sync.mantidos.has(e.id))
    : [];
  const xp = remoto ? remoto.xpTotal + pendentes.reduce((s, e) => s + e.xp, 0) : local.xp;
  return {
    carregado: local.carregado,
    situacao: situacaoPorXp(xp),
    fonte: remoto ? ("conta" as const) : ("aparelho" as const),
    xpPendente: pendentes.reduce((s, e) => s + e.xp, 0),
    sync,
    local,
  };
}
