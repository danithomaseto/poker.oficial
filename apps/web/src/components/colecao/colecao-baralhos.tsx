"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { BARALHOS, BARALHO_PADRAO, baralhoPorId, ehGratuito, podeEquipar, xpTotalDoNivel, type Baralho } from "@poker/progressao";
import { usePreferencias } from "@/lib/preferencias";
import { salvarBaralhoNaConta, useNivelEfetivo } from "@/lib/progresso/sincronizacao";
import { useAvisar } from "../avisos";
import { c, type CartaVisual, type Naipe, type Valor } from "../baralho";
import { Carta, VersoCarta } from "../carta";
import { BarraXp } from "../jogo/barra-xp";

const AMOSTRA: CartaVisual[] = [c("A", "espadas"), c("K", "copas"), c("Q", "ouros"), c("J", "paus")];
const VALORES: Valor[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const NAIPES: Naipe[] = ["espadas", "copas", "ouros", "paus"];
type Filtro = "todos" | "gratuitos" | "desbloqueaveis";

/**
 * Coleção de baralhos: prévia real (as próprias cartas do jogo com o tema aplicado), quem
 * está liberado pelo seu nível e o que falta para os bloqueados. Equipar vale em todo o jogo.
 */
export function ColecaoBaralhos() {
  const [preferencias, salvar] = usePreferencias();
  const { situacao, fonte, carregado } = useNivelEfetivo();
  const avisar = useAvisar();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [emDestaque, setEmDestaque] = useState<string>(preferencias.temaBaralho);
  const destaque = baralhoPorId(emDestaque) ?? baralhoPorId(BARALHO_PADRAO)!;

  const equipar = async (b: Baralho) => {
    if (!podeEquipar(b.id, situacao.nivel)) {
      avisar("erro", `${b.nome} libera no nível ${b.nivelMinimo}.`);
      return;
    }
    salvar({ temaBaralho: b.id });
    setEmDestaque(b.id);
    const naConta = await salvarBaralhoNaConta(b.id);
    avisar("sucesso", naConta ? `${b.nome} equipado e salvo na conta.` : `${b.nome} equipado neste aparelho.`);
  };

  const lista = BARALHOS.filter((b) => (filtro === "gratuitos" ? ehGratuito(b) : filtro === "desbloqueaveis" ? !ehGratuito(b) : true));
  const liberados = BARALHOS.filter((b) => podeEquipar(b.id, situacao.nivel)).length;

  return (
    <div className="space-y-10">
      {/* Seu nível e o baralho em destaque */}
      <section className="grid gap-8 rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-5">
          <BarraXp situacao={situacao} />
          <p className="text-sm text-creme-300">
            {liberados} de {BARALHOS.length} baralhos liberados ·{" "}
            {fonte === "conta" ? "nível da sua conta" : "nível deste aparelho"}
            {!carregado && " (carregando…)"}
          </p>
          <div>
            <p className="rotulo text-ouro-300">{ehGratuito(destaque) ? "Gratuito" : `Nível ${destaque.nivelMinimo}`}</p>
            <h2 className="mt-1 font-display text-3xl text-creme-50">{destaque.nome}</h2>
            <p className="mt-1 text-creme-300">{destaque.descricao}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {preferencias.temaBaralho === destaque.id ? (
                <span className="rotulo inline-flex h-10 items-center rounded-(--radius-controle) bg-sucesso/25 px-4 text-creme-50">
                  ✓ Equipado
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void equipar(destaque)}
                  disabled={!podeEquipar(destaque.id, situacao.nivel)}
                  className="h-10 rounded-(--radius-controle) border border-b-[3px] border-ouro-600 bg-ouro-300 px-5 text-sm font-semibold text-tinta transition-colors hover:bg-ouro-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {podeEquipar(destaque.id, situacao.nivel) ? "Equipar" : `Bloqueado até o nível ${destaque.nivelMinimo}`}
                </button>
              )}
              {preferencias.temaBaralho !== BARALHO_PADRAO && (
                <button
                  type="button"
                  onClick={() => void equipar(baralhoPorId(BARALHO_PADRAO)!)}
                  className="h-10 rounded-(--radius-controle) border border-borda-forte px-4 text-sm text-creme-100 hover:border-creme-100/60"
                >
                  Voltar ao Clássico
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Baralho completo, com o tema aplicado de verdade */}
        <div data-tema-baralho={destaque.id} aria-label={`Prévia completa do baralho ${destaque.nome}`} className="min-w-0">
          <div className="@container">
            <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
              {NAIPES.flatMap((n) =>
                VALORES.map((v) => <Carta key={`${v}${n}`} carta={c(v, n)} largura="calc((100cqw - 3rem) / 13)" />),
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <VersoCarta largura="3.2rem" />
            <VersoCarta largura="3.2rem" />
            <p className="text-sm text-creme-300">Verso e as 52 cartas como aparecem na mesa.</p>
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section aria-labelledby="titulo-catalogo">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titulo-catalogo" className="font-display text-3xl text-creme-50">
            Catálogo
          </h2>
          <div role="group" aria-label="Filtrar baralhos" className="flex gap-1">
            {(
              [
                ["todos", "Todos"],
                ["gratuitos", "Gratuitos"],
                ["desbloqueaveis", "Por nível"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filtro === id}
                onClick={() => setFiltro(id)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  filtro === id ? "border-creme-100 bg-creme-100 text-tinta" : "border-borda text-creme-100 hover:border-borda-forte"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {lista.map((b) => {
            const liberado = podeEquipar(b.id, situacao.nivel);
            const equipado = preferencias.temaBaralho === b.id;
            const falta = Math.max(0, xpTotalDoNivel(b.nivelMinimo) - situacao.xpTotal);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setEmDestaque(b.id)}
                  aria-pressed={emDestaque === b.id}
                  className={`group/b flex h-full w-full flex-col rounded-(--radius-cartao) border p-4 text-left transition-colors ${
                    emDestaque === b.id ? "border-ouro-300 bg-white/[0.04]" : "border-borda hover:border-borda-forte"
                  }`}
                >
                  <span data-tema-baralho={b.id} className={`flex items-end gap-1 ${liberado ? "" : "opacity-55 grayscale-[0.4]"}`} aria-hidden>
                    {AMOSTRA.map((carta) => (
                      <Carta key={`${carta.valor}${carta.naipe}`} carta={carta} largura="2.6rem" />
                    ))}
                    <VersoCarta largura="2.6rem" className="ml-1" />
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-display text-lg text-creme-50">{b.nome}</span>
                    <span
                      className={`rotulo rounded-[3px] px-1.5 py-0.5 ${
                        equipado
                          ? "bg-sucesso/30 text-creme-50"
                          : ehGratuito(b)
                            ? "bg-creme-100/10 text-creme-300"
                            : liberado
                              ? "bg-ouro-300/20 text-ouro-200"
                              : "bg-black/40 text-creme-500"
                      }`}
                    >
                      {equipado ? (
                        "Equipado"
                      ) : ehGratuito(b) ? (
                        "Grátis"
                      ) : liberado ? (
                        `Nível ${b.nivelMinimo} ✓`
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Lock className="size-3" aria-hidden /> Nível {b.nivelMinimo}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="mt-1 text-sm text-creme-300">{b.descricao}</span>
                  {!liberado && (
                    <span className="mt-2 font-mono text-xs text-creme-500">Faltam {falta.toLocaleString("pt-BR")} XP</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
