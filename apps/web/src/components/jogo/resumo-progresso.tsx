"use client";

import Link from "next/link";
import { baralhoPorId } from "@poker/progressao";
import { usePreferencias } from "@/lib/preferencias";
import { useNivelEfetivo } from "@/lib/progresso/sincronizacao";
import { classesBotao } from "../botao";
import { Carta, VersoCarta } from "../carta";
import { c } from "../baralho";
import { usePartidaSalva } from "../treino/partida-salva";
import { MODULOS_TUTORIAL } from "../tutorial/modulos";
import { BarraXp } from "./barra-xp";

/** Resumo no lobby: nível, tutorial (aprender / continuar / praticar) e o baralho equipado. */
export function ResumoProgresso() {
  const { situacao, local, xpPendente } = useNivelEfetivo();
  const [preferencias] = usePreferencias();
  const feitos = MODULOS_TUTORIAL.filter((m) => local.chaves.has(`tutorial:${m.id}`)).length;
  const proximo = MODULOS_TUTORIAL.find((m) => !local.chaves.has(`tutorial:${m.id}`));
  const baralho = baralhoPorId(preferencias.temaBaralho);
  const salva = usePartidaSalva();

  return (
    <section aria-labelledby="titulo-progresso" className="grid gap-5 rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-8">
      <div className="min-w-0 space-y-4">
        <h2 id="titulo-progresso" className="sr-only">
          Seu progresso
        </h2>
        <BarraXp situacao={situacao} />
        {xpPendente > 0 && <p className="text-xs text-creme-500">{xpPendente} XP deste aparelho aguardando sincronizar.</p>}
        <div className="flex flex-wrap items-center gap-2">
          {salva && (
            <Link href={`/treino?mesa=${salva.config.id}`} className={classesBotao("primario", "md")}>
              Retomar partida · {salva.config.nome}
            </Link>
          )}
          <Link href="/tutorial" className={classesBotao(feitos === 0 && !salva ? "primario" : "secundario", "md")}>
            {feitos === 0 ? "Aprender a jogar" : proximo ? `Continuar tutorial (${feitos}/10)` : "Rever o tutorial ✓"}
          </Link>
          <Link href="/treino" className={classesBotao("secundario", "md")}>
            Praticar livremente
          </Link>
          <Link href="/progresso" className="rotulo px-2 text-creme-300 hover:text-creme-50">
            Ver progresso →
          </Link>
        </div>
      </div>
      <Link href="/baralhos" className="group/b flex items-center gap-4 rounded-(--radius-cartao) border border-borda p-3 transition-colors hover:border-borda-forte">
        <span className="flex items-end gap-1" aria-hidden>
          <Carta carta={c("A", "espadas")} largura="2.6rem" />
          <Carta carta={c("K", "copas")} largura="2.6rem" />
          <VersoCarta largura="2.6rem" />
        </span>
        <span className="min-w-0">
          <span className="rotulo block text-creme-500">Baralho equipado</span>
          <span className="block font-display text-xl text-creme-50">{baralho?.nome ?? "Clássico"}</span>
          <span className="rotulo text-ouro-200 group-hover/b:underline">Trocar na coleção</span>
        </span>
      </Link>
    </section>
  );
}
