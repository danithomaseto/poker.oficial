"use client";

import Link from "next/link";
import {
  MAOS_OBJETIVO_DIARIO,
  NIVEL_MAXIMO,
  REGRAS_XP,
  baralhoDoNivel,
  diaSaoPaulo,
  tituloDoNivel,
  type TipoEventoXp,
} from "@poker/progressao";
import { useHoje } from "@/lib/hoje";
import { useIdentidadeLocal } from "@/lib/identidade-local";
import { useNivelEfetivo } from "@/lib/progresso/sincronizacao";
import { Avatar } from "../ilustracoes/avatar";
import { BarraXp } from "../jogo/barra-xp";
import { MODULOS_TUTORIAL } from "../tutorial/modulos";

const NOMES_EVENTO: Record<TipoEventoXp, string> = {
  tutorial_modulo: "Módulo do tutorial",
  tutorial_completo: "Tutorial completo",
  mao_treino: "Mão de treino",
  sessao_treino: "Sessão de treino",
  objetivo_diario: "Objetivo do dia",
};

const ESTADOS = {
  local: { texto: "neste aparelho", classe: "bg-creme-100/10 text-creme-300" },
  sincronizado: { texto: "na conta", classe: "bg-sucesso/25 text-creme-50" },
  recusado: { texto: "não contou", classe: "bg-perigo/25 text-perigo-claro" },
} as const;

/** Tela de progresso: nível, recompensas obtidas e próximas, como ganhar XP e o histórico. */
export function PainelProgresso() {
  const eu = useIdentidadeLocal();
  const { situacao, fonte, xpPendente, local, carregado } = useNivelEfetivo();
  const hoje = useHoje();
  const maosHoje = local.eventos.filter((e) => e.tipo === "mao_treino" && e.estado !== "recusado" && diaSaoPaulo(e.ocorridoEm) === hoje).length;
  const modulosFeitos = MODULOS_TUTORIAL.filter((m) => local.chaves.has(`tutorial:${m.id}`)).length;
  const obtidas = Array.from({ length: situacao.nivel - 1 }, (_, i) => i + 2);
  const proximas = Array.from({ length: Math.min(5, NIVEL_MAXIMO - situacao.nivel) }, (_, i) => situacao.nivel + i + 1);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-8">
        <section className="flex flex-wrap items-center gap-5 rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5 sm:p-7">
          <span className="size-20 shrink-0 overflow-hidden rounded-full border-2 border-ouro-400">
            <Avatar aparencia={eu.aparencia} className="size-full scale-110" titulo={`Personagem de ${eu.nome}`} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-3xl text-creme-50">{eu.nome}</p>
            <p className="text-ouro-200">{tituloDoNivel(situacao.nivel)}</p>
            <div className="mt-4">
              <BarraXp situacao={situacao} />
            </div>
            <p className="mt-3 text-xs text-creme-500">
              {fonte === "conta" ? "Progresso da sua conta" : "Progresso salvo neste aparelho"}
              {xpPendente > 0 && ` · ${xpPendente} XP aguardando sincronizar`}
              {!carregado && " · carregando…"}
            </p>
          </div>
        </section>

        <section aria-labelledby="titulo-hoje" className="grid gap-3 sm:grid-cols-3">
          <h2 id="titulo-hoje" className="sr-only">
            Hoje
          </h2>
          {[
            { rotulo: "XP total", valor: situacao.xpTotal.toLocaleString("pt-BR") },
            { rotulo: "Mãos hoje", valor: `${Math.min(maosHoje, 999)} / ${MAOS_OBJETIVO_DIARIO}` },
            { rotulo: "Tutorial", valor: `${modulosFeitos} / ${MODULOS_TUTORIAL.length}` },
          ].map((i) => (
            <div key={i.rotulo} className="rounded-(--radius-cartao) border border-borda bg-superficie-1/80 px-4 py-3">
              <p className="rotulo text-creme-500">{i.rotulo}</p>
              <p className="mt-1 font-display text-2xl text-creme-50 tabular-nums">{i.valor}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="titulo-recompensas">
          <h2 id="titulo-recompensas" className="font-display text-2xl text-creme-50">
            Próximas recompensas
          </h2>
          <ul className="mt-3 divide-y divide-borda rounded-(--radius-cartao) border border-borda bg-superficie-1/80">
            {proximas.length === 0 && <li className="px-4 py-3 text-creme-300">Você chegou ao nível máximo.</li>}
            {proximas.map((n) => (
              <li key={n} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="font-mono text-sm text-creme-500">Nível {n}</span>{" "}
                  <span className="text-creme-50">{tituloDoNivel(n)}</span>
                </span>
                {baralhoDoNivel(n) ? (
                  <Link href="/baralhos" className="rotulo text-ouro-200 hover:underline">
                    Baralho {baralhoDoNivel(n)!.nome}
                  </Link>
                ) : (
                  <span className="rotulo text-creme-500">título</span>
                )}
              </li>
            ))}
          </ul>
          {obtidas.length > 0 && (
            <details className="mt-3 text-sm text-creme-300">
              <summary className="cursor-pointer text-creme-100">Recompensas já obtidas ({obtidas.length})</summary>
              <ul className="mt-2 space-y-1">
                {obtidas.map((n) => (
                  <li key={n}>
                    Nível {n}: {tituloDoNivel(n)}
                    {baralhoDoNivel(n) && ` + baralho ${baralhoDoNivel(n)!.nome}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      <div className="space-y-8">
        <section aria-labelledby="titulo-como" className="rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5">
          <h2 id="titulo-como" className="font-display text-2xl text-creme-50">
            Como ganhar XP
          </h2>
          <p className="mt-1 text-sm text-creme-300">
            Conta participar e aprender, não ganhar fichas. Repetir a mesma coisa não paga de novo.
          </p>
          <ul className="mt-4 space-y-2.5">
            {(Object.keys(REGRAS_XP) as TipoEventoXp[]).map((t) => (
              <li key={t} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-creme-100">{REGRAS_XP[t].descricao}</span>
                <span className="shrink-0 font-mono text-ouro-200">+{REGRAS_XP[t].xp}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-historico">
          <h2 id="titulo-historico" className="font-display text-2xl text-creme-50">
            Últimos ganhos
          </h2>
          {local.eventos.length === 0 ? (
            <p className="mt-3 text-sm text-creme-300">
              Nada ainda. Comece pelo <Link href="/tutorial" className="text-ouro-200 underline">tutorial</Link> ou pelo{" "}
              <Link href="/treino" className="text-ouro-200 underline">treino</Link>.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-borda rounded-(--radius-cartao) border border-borda bg-superficie-1/80">
              {[...local.eventos]
                .reverse()
                .slice(0, 12)
                .map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="text-creme-100">{NOMES_EVENTO[e.tipo]}</span>
                      <span className="ml-2 font-mono text-xs text-creme-500">
                        {new Date(e.ocorridoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className={`rotulo rounded-[3px] px-1.5 py-0.5 ${ESTADOS[e.estado].classe}`}>{ESTADOS[e.estado].texto}</span>
                      <span className={`font-mono ${e.estado === "recusado" ? "text-creme-500 line-through" : "text-ouro-200"}`}>+{e.xp}</span>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
