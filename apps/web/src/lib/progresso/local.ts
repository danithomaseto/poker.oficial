"use client";

import { useSyncExternalStore } from "react";
import {
  avaliarEvento,
  baralhoDoNivel,
  situacaoPorXp,
  somaXp,
  tituloDoNivel,
  type EventoXp,
  type MotivoRecusa,
  type TipoEventoXp,
} from "@poker/progressao";
import { gravarEvento, listarEventos } from "./idb";

/**
 * Progresso guardado neste aparelho (IndexedDB). Funciona sem internet e sem conta.
 *
 * Cada evento tem estado de sincronização:
 * - "local": vale só aqui (convidado, ou ainda não enviado)
 * - "sincronizado": o servidor aceitou (conta online)
 * - "recusado": o servidor recusou (duplicado, teto diário...): deixa de contar aqui também
 *
 * O XP mostrado é a soma dos eventos locais não recusados. Quando há conta online, o
 * servidor é a referência e a tela mostra o que ainda está pendente de envio.
 */
export interface EventoLocal extends EventoXp {
  estado: "local" | "sincronizado" | "recusado";
  motivo?: MotivoRecusa | "requisito" | "fora_do_prazo";
}

export interface SubidaDeNivel {
  de: number;
  para: number;
  titulo: string;
  baralho?: string;
}

interface Estado {
  carregado: boolean;
  eventos: EventoLocal[];
}

let estado: Estado = { carregado: false, eventos: [] };
const ouvintes = new Set<() => void>();
const ouvintesNivel = new Set<(s: SubidaDeNivel) => void>();
let carregando: Promise<void> | null = null;

function emitir(novo: Estado) {
  estado = novo;
  ouvintes.forEach((f) => f());
}

export function carregarProgresso(): Promise<void> {
  if (!carregando) {
    carregando = listarEventos<EventoLocal>()
      .then((eventos) => emitir({ carregado: true, eventos: eventos.sort((a, b) => a.ocorridoEm.localeCompare(b.ocorridoEm)) }))
      .catch(() => emitir({ carregado: true, eventos: [] }));
  }
  return carregando;
}

const validos = (eventos: readonly EventoLocal[]) => eventos.filter((e) => e.estado !== "recusado");
export const xpLocal = () => somaXp(validos(estado.eventos));

/**
 * Registra um evento de XP neste aparelho. Mesma regra do servidor: chave repetida e teto
 * diário não pagam. Devolve o XP ganho e, se subiu, o novo nível (de verdade, pela soma).
 */
export async function registrarEvento(tipo: TipoEventoXp, chave: string): Promise<{ xp: number; subida?: SubidaDeNivel }> {
  await carregarProgresso();
  const ocorridoEm = new Date().toISOString();
  const avaliacao = avaliarEvento({ tipo, chave, ocorridoEm }, validos(estado.eventos));
  if (!avaliacao.aceito) return { xp: 0 };

  const antes = situacaoPorXp(xpLocal()).nivel;
  const evento: EventoLocal = { id: crypto.randomUUID(), tipo, chave, xp: avaliacao.xp, ocorridoEm, estado: "local" };
  emitir({ ...estado, eventos: [...estado.eventos, evento] });
  await gravarEvento(evento).catch(() => undefined);

  const depois = situacaoPorXp(xpLocal()).nivel;
  if (depois > antes) {
    const subida: SubidaDeNivel = { de: antes, para: depois, titulo: tituloDoNivel(depois), baralho: baralhoDoNivel(depois)?.nome };
    ouvintesNivel.forEach((f) => f(subida));
    return { xp: avaliacao.xp, subida };
  }
  return { xp: avaliacao.xp };
}

/** Atualiza o estado de sincronização de eventos (usado pelo módulo de sincronização). */
export async function marcarEventos(atualizacoes: { id: string; estado: EventoLocal["estado"]; motivo?: EventoLocal["motivo"] }[]) {
  const mapa = new Map(atualizacoes.map((a) => [a.id, a]));
  const eventos = estado.eventos.map((e) => {
    const a = mapa.get(e.id);
    return a ? { ...e, estado: a.estado, motivo: a.motivo } : e;
  });
  emitir({ ...estado, eventos });
  await Promise.all(eventos.filter((e) => mapa.has(e.id)).map((e) => gravarEvento(e).catch(() => undefined)));
}

export function aoSubirDeNivel(f: (s: SubidaDeNivel) => void) {
  ouvintesNivel.add(f);
  return () => ouvintesNivel.delete(f);
}

function assinar(f: () => void) {
  ouvintes.add(f);
  void carregarProgresso();
  return () => ouvintes.delete(f);
}

const VAZIO: Estado = { carregado: false, eventos: [] };

export function useProgressoLocal() {
  const atual = useSyncExternalStore(assinar, () => estado, () => VAZIO);
  const aceitos = validos(atual.eventos);
  const xp = somaXp(aceitos);
  return {
    carregado: atual.carregado,
    eventos: atual.eventos,
    xp,
    situacao: situacaoPorXp(xp),
    pendentes: atual.eventos.filter((e) => e.estado === "local"),
    /** Chaves aceitas (para saber módulos do tutorial concluídos, por exemplo). */
    chaves: new Set(aceitos.map((e) => e.chave)),
  };
}
