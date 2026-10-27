"use client";

import Link from "next/link";
import { useState } from "react";
import { NIVEIS } from "@poker/bots";
import { MESAS_DA_CASA, type ConfigTreino, type NivelMesa } from "../treino/mesas";
import { formatarFichas } from "../treino/textos";

const DIFICULDADE: Record<NivelMesa, number> = { facil: 1, medio: 2, dificil: 3, extremo: 4, misto: 2 };
const FILTROS: { id: NivelMesa | "todas"; rotulo: string }[] = [
  { id: "todas", rotulo: "Todas" },
  { id: "facil", rotulo: "Fácil" },
  { id: "medio", rotulo: "Médio" },
  { id: "dificil", rotulo: "Difícil" },
  { id: "extremo", rotulo: "Extremo" },
  { id: "misto", rotulo: "Misto" },
];

export const nomeNivel = (n: NivelMesa) => (n === "misto" ? "Misto" : NIVEIS[n].nome);

/** Pips de dificuldade (1 a 4), legíveis por leitor de tela. */
export function Dificuldade({ nivel }: { nivel: NivelMesa }) {
  const n = DIFICULDADE[nivel];
  return (
    <span role="img" aria-label={`Dificuldade ${n} de 4`} className="flex gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-3 w-1.5 rounded-[1px] ${i <= n ? "bg-ouro-300" : "bg-creme-100/15"}`} />
      ))}
    </span>
  );
}

/**
 * Lista de mesas de treino: compacta, com filtro por nível. Com `aoSentar`, senta direto
 * (dentro do /treino); sem ele, leva para /treino?mesa=… (no lobby).
 */
export function ListaMesas({ aoSentar }: { aoSentar?: (config: ConfigTreino) => void }) {
  const [filtro, setFiltro] = useState<NivelMesa | "todas">("todas");
  const mesas = MESAS_DA_CASA.filter((m) => filtro === "todas" || m.nivel === filtro);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filtrar por nível" className="flex flex-wrap gap-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                filtro === f.id
                  ? "border-creme-100 bg-creme-100 text-tinta"
                  : "border-borda text-creme-100 hover:border-borda-forte"
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
        <p className="rotulo text-creme-500" aria-live="polite">
          {mesas.length} {mesas.length === 1 ? "mesa" : "mesas"}
        </p>
      </div>

      <ul className="mt-4 divide-y divide-borda overflow-hidden rounded-(--radius-painel) border border-borda bg-superficie-1/80">
        {mesas.map((m) => (
          <li
            key={m.id}
            className="grid gap-x-6 gap-y-3 px-4 py-4 transition-colors hover:bg-white/[0.03] sm:px-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-xl text-creme-50">{m.nome}</span>
                <span className="flex items-center gap-2">
                  <Dificuldade nivel={m.nivel} />
                  <span className="rotulo text-ouro-300">{nomeNivel(m.nivel)}</span>
                </span>
              </p>
              <p className="mt-0.5 truncate text-sm text-creme-300">{m.descricao}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <dl className="flex gap-5 font-mono text-sm text-creme-100">
                <div>
                  <dt className="rotulo text-creme-500">Lugares</dt>
                  <dd>{m.bots + 1}</dd>
                </div>
                <div>
                  <dt className="rotulo text-creme-500">Blinds</dt>
                  <dd>
                    {formatarFichas(m.bigBlind / 2)}/{formatarFichas(m.bigBlind)}
                    {m.subirBlindsACada ? " ↑" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="rotulo text-creme-500">Fichas</dt>
                  <dd>{formatarFichas(m.fichasIniciais)}</dd>
                </div>
              </dl>
              {aoSentar ? (
                <button
                  type="button"
                  onClick={() => aoSentar(m)}
                  className="h-10 rounded-(--radius-controle) border border-b-[3px] border-ouro-600 bg-ouro-300 px-5 text-sm font-semibold text-tinta transition-colors hover:bg-ouro-200 active:translate-y-[2px] active:border-b"
                >
                  Sentar
                </button>
              ) : (
                <Link
                  href={`/treino?mesa=${m.id}`}
                  className="inline-flex h-10 items-center rounded-(--radius-controle) border border-b-[3px] border-ouro-600 bg-ouro-300 px-5 text-sm font-semibold text-tinta transition-colors hover:bg-ouro-200 active:translate-y-[2px] active:border-b"
                >
                  Sentar
                </Link>
              )}
            </div>
          </li>
        ))}
        {mesas.length === 0 && <li className="px-5 py-8 text-center text-creme-300">Nenhuma mesa neste nível.</li>}
      </ul>
    </div>
  );
}
