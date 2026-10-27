"use client";

import { useState } from "react";
import { NIVEIS } from "@poker/bots";
import { classesBotao } from "../botao";
import { MESAS_DA_CASA, NIVEIS_ORDEM, type ConfigTreino, type NivelMesa } from "./mesas";
import { formatarFichas } from "./textos";

const DIFICULDADE: Record<NivelMesa, number> = { facil: 1, medio: 2, dificil: 3, extremo: 4, misto: 2.5 };

function Naipes({ nivel }: { nivel: NivelMesa }) {
  const cheios = Math.round(DIFICULDADE[nivel]);
  return (
    <span aria-label={`Dificuldade ${DIFICULDADE[nivel]} de 4`} className="tracking-[0.2em]">
      {["♠", "♥", "♦", "♣"].map((s, i) => (
        <span key={s} className={i < cheios ? (i % 3 === 0 ? "text-tinta" : "text-naipe-vermelho") : "text-tinta/20"}>
          {s}
        </span>
      ))}
    </span>
  );
}

const nomeNivel = (n: NivelMesa) => (n === "misto" ? "Misto" : NIVEIS[n].nome);

export function EscolhaMesa({ aoEscolher }: { aoEscolher: (config: ConfigTreino) => void }) {
  const [nivel, setNivel] = useState<NivelMesa>("medio");
  const [bots, setBots] = useState(5);
  const [fichas, setFichas] = useState(2500);
  const [subir, setSubir] = useState(false);

  const montar = () =>
    aoEscolher({
      id: "personalizada",
      nome: "Sua mesa",
      descricao: "",
      nivel,
      bots,
      fichasIniciais: fichas,
      bigBlind: Math.max(2, Math.round(fichas / 50)),
      subirBlindsACada: subir ? 10 : 0,
    });

  return (
    <div className="conteiner py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="rotulo flex items-center gap-3 border-t border-ouro-400/35 pt-3 text-ouro-300">
          <span className="text-creme-50">Treino</span> Contra bots, no seu navegador
        </p>
        <h1 className="mt-5 font-display text-4xl leading-[1.02] font-medium tracking-[-0.02em] text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl">
          Escolha a mesa. <span className="text-ouro-300 italic">Os bots já estão sentados.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-creme-100/80">
          Do Fácil ao Extremo. Tudo roda aqui no seu aparelho: as fichas são de treino e nada conta na
          sua conta online.
        </p>
      </header>

      <ul className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {MESAS_DA_CASA.map((mesa, i) => (
          <li key={mesa.id} className="animar-mensagem" style={{ animationDelay: `${i * 70}ms` }}>
            <article className="textura-papel group/mesa relative flex h-full flex-col rounded-[8px] bg-creme-50 p-6 text-tinta shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-(--ease-mola) hover:-translate-y-1 hover:-rotate-[0.6deg]">
              <div className="flex items-center justify-between border-b-2 border-tinta pb-3">
                <span className="rotulo text-tinta-suave">{nomeNivel(mesa.nivel)}</span>
                <Naipes nivel={mesa.nivel} />
              </div>
              <h2 className="mt-4 font-display text-3xl font-medium">{mesa.nome}</h2>
              <p className="mt-2 flex-1 text-tinta-suave">{mesa.descricao}</p>
              <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-dashed border-tinta/30 pt-4 font-mono text-sm">
                <div>
                  <dt className="rotulo text-tinta-suave">Bots</dt>
                  <dd>{mesa.bots}</dd>
                </div>
                <div>
                  <dt className="rotulo text-tinta-suave">Fichas</dt>
                  <dd>{formatarFichas(mesa.fichasIniciais)}</dd>
                </div>
                <div>
                  <dt className="rotulo text-tinta-suave">Blinds</dt>
                  <dd>
                    {formatarFichas(mesa.bigBlind / 2)}/{formatarFichas(mesa.bigBlind)}
                    {mesa.subirBlindsACada ? "↑" : ""}
                  </dd>
                </div>
              </dl>
              <button type="button" onClick={() => aoEscolher(mesa)} className={`${classesBotao("tinta", "lg")} mt-5 w-full`}>
                Sentar nesta mesa
              </button>
            </article>
          </li>
        ))}
      </ul>

      {/* Mesa personalizada */}
      <section aria-labelledby="titulo-montar" className="mt-14 rounded-[8px] border border-ouro-400/30 bg-mesa-900/70 p-6 sm:p-8">
        <h2 id="titulo-montar" className="font-display text-3xl text-creme-50">
          Monte sua mesa
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <fieldset>
            <legend className="rotulo mb-2 text-creme-300">Nível dos bots</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...NIVEIS_ORDEM, "misto" as const].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={nivel === n}
                  onClick={() => setNivel(n)}
                  className={`rounded-[4px] border px-3 py-1.5 text-sm transition-colors ${
                    nivel === n ? "border-ouro-300 bg-ouro-300 text-tinta" : "border-creme-100/20 text-creme-100 hover:border-creme-100/60"
                  }`}
                >
                  {nomeNivel(n)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-creme-300">
              {nivel === "misto" ? "Um pouco de cada nível na mesma mesa." : NIVEIS[nivel].descricao}
            </p>
          </fieldset>
          <label className="block">
            <span className="rotulo mb-2 block text-creme-300">Bots na mesa: {bots}</span>
            <input
              type="range"
              min={1}
              max={8}
              value={bots}
              onChange={(e) => setBots(Number(e.target.value))}
              className="w-full accent-ouro-300"
            />
            <span className="mt-1 block text-sm text-creme-300">
              {bots === 1 ? "Mano a mano (heads-up)" : `Mesa de ${bots + 1} lugares ocupados`}
            </span>
          </label>
          <fieldset>
            <legend className="rotulo mb-2 text-creme-300">Fichas iniciais</legend>
            <div className="flex flex-wrap gap-1.5">
              {[1000, 2500, 5000, 10000].map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={fichas === f}
                  onClick={() => setFichas(f)}
                  className={`rounded-[4px] border px-3 py-1.5 font-mono text-sm transition-colors ${
                    fichas === f ? "border-ouro-300 bg-ouro-300 text-tinta" : "border-creme-100/20 text-creme-100 hover:border-creme-100/60"
                  }`}
                >
                  {formatarFichas(f)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-creme-300">Big blind de {formatarFichas(Math.round(fichas / 50))} (50 blinds).</p>
          </fieldset>
          <div className="flex flex-col justify-between gap-4">
            <label className="flex items-center gap-3 text-creme-100">
              <input type="checkbox" checked={subir} onChange={(e) => setSubir(e.target.checked)} className="size-5 accent-ouro-300" />
              Blinds dobram a cada 10 mãos
            </label>
            <button type="button" onClick={montar} className={classesBotao("primario", "lg")}>
              Sentar na minha mesa
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
