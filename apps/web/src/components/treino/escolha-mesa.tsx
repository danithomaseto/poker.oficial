"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { NIVEIS } from "@poker/bots";
import { classesBotao } from "../botao";
import { ListaMesas, nomeNivel } from "../jogo/lista-mesas";
import { NIVEIS_ORDEM, type ConfigTreino, type NivelMesa } from "./mesas";
import type { PartidaSalva } from "./partida-salva";
import { formatarFichas } from "./textos";

function Opcao<T extends string | number>({
  valor,
  atual,
  aoEscolher,
  children,
}: {
  valor: T;
  atual: T;
  aoEscolher: (v: T) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={atual === valor}
      onClick={() => aoEscolher(valor)}
      className={`rounded-(--radius-controle) border px-3 py-1.5 text-sm transition-colors ${
        atual === valor ? "border-creme-100 bg-creme-100 text-tinta" : "border-borda text-creme-100 hover:border-borda-forte"
      }`}
    >
      {children}
    </button>
  );
}

/** Escolha da mesa de treino: partida salva (se houver), mesas da casa e a mesa personalizada. */
export function EscolhaMesa({
  aoEscolher,
  salva,
  aoRetomar,
  aoDescartar,
}: {
  aoEscolher: (config: ConfigTreino) => void;
  salva: PartidaSalva | null;
  aoRetomar: () => void;
  aoDescartar: () => void;
}) {
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
    <div className="conteiner grid gap-12 py-10 sm:py-12 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-labelledby="titulo-treino">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Treino · no seu aparelho</p>
        <h1
          id="titulo-treino"
          className="mt-4 font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl"
        >
          Escolha a mesa. <span className="text-ouro-300 italic">Os bots já sentaram.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-creme-100/80">
          Fichas de treino: nada daqui conta na sua conta online.
        </p>
        {salva && <PartidaEmAndamento salva={salva} aoRetomar={aoRetomar} aoDescartar={aoDescartar} />}
        <div className="mt-8">
          <ListaMesas aoSentar={aoEscolher} />
        </div>
      </section>

      <section
        id="montar"
        aria-labelledby="titulo-montar"
        className="h-fit rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5 sm:p-6 xl:sticky xl:top-24 xl:mt-[7.5rem]"
      >
        <h2 id="titulo-montar" className="font-display text-2xl text-creme-50">
          Monte sua mesa
        </h2>
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="rotulo mb-2 text-creme-300">Nível dos bots</legend>
            <div className="flex flex-wrap gap-1.5">
              {[...NIVEIS_ORDEM, "misto" as const].map((n) => (
                <Opcao key={n} valor={n} atual={nivel} aoEscolher={setNivel}>
                  {nomeNivel(n)}
                </Opcao>
              ))}
            </div>
            <p className="mt-2 text-sm text-creme-300">
              {nivel === "misto" ? "Um pouco de cada nível." : NIVEIS[nivel].descricao}
            </p>
          </fieldset>
          <label className="block">
            <span className="rotulo mb-2 flex justify-between text-creme-300">
              Bots na mesa <span className="font-mono text-creme-50">{bots}</span>
            </span>
            <input
              type="range"
              min={1}
              max={8}
              value={bots}
              onChange={(e) => setBots(Number(e.target.value))}
              className="slider-aposta w-full"
              style={{ "--preenchido": `${((bots - 1) / 7) * 100}%` } as CSSProperties}
            />
            <span className="mt-1 block text-sm text-creme-300">
              {bots === 1 ? "Mano a mano (heads-up)" : `${bots + 1} lugares ocupados`}
            </span>
          </label>
          <fieldset>
            <legend className="rotulo mb-2 text-creme-300">Fichas iniciais</legend>
            <div className="flex flex-wrap gap-1.5">
              {[1000, 2500, 5000, 10000].map((f) => (
                <Opcao key={f} valor={f} atual={fichas} aoEscolher={setFichas}>
                  <span className="font-mono">{formatarFichas(f)}</span>
                </Opcao>
              ))}
            </div>
            <p className="mt-2 text-sm text-creme-300">Big blind de {formatarFichas(Math.round(fichas / 50))}.</p>
          </fieldset>
          <label className="flex items-center gap-3 text-sm text-creme-100">
            <input type="checkbox" checked={subir} onChange={(e) => setSubir(e.target.checked)} className="size-4 accent-ouro-300" />
            Blinds dobram a cada 10 mãos
          </label>
          <button type="button" onClick={montar} className={`${classesBotao("primario", "lg")} w-full`}>
            Sentar na minha mesa
          </button>
        </div>
      </section>
    </div>
  );
}

/** Partida salva neste aparelho: retomar de onde parou ou descartar. */
function PartidaEmAndamento({
  salva,
  aoRetomar,
  aoDescartar,
}: {
  salva: PartidaSalva;
  aoRetomar: () => void;
  aoDescartar: () => void;
}) {
  const voce = salva.mao?.jogadores.find((j) => j.id === "voce");
  const fichas = voce && salva.mao?.fase !== "encerrada" ? voce.fichas + voce.totalApostado : (salva.lugares.find((l) => l.tipo === "voce")?.fichas ?? 0);
  const hora = new Date(salva.salvoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  return (
    <section
      aria-labelledby="titulo-partida-salva"
      className="animar-aviso mt-8 flex flex-wrap items-center justify-between gap-4 rounded-(--radius-painel) border border-ouro-400/50 bg-superficie-1/90 p-5"
    >
      <div className="min-w-0">
        <p className="rotulo text-ouro-300">Partida em andamento</p>
        <h2 id="titulo-partida-salva" className="mt-1 font-display text-2xl text-creme-50">
          {salva.config.nome}
        </h2>
        <p className="mt-1 text-sm text-creme-300">
          {salva.mao ? `Mão #${salva.mao.numero}` : "Antes da primeira mão"} · suas fichas{" "}
          <span className="font-mono text-ouro-200">{formatarFichas(fichas)}</span> · {salva.estatisticas.maos} mãos jogadas · salva
          em {hora}
        </p>
        <p className="mt-1 text-xs text-creme-500">Sentar em outra mesa substitui esta partida.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={classesBotao("primario", "lg")} onClick={aoRetomar}>
          Retomar partida
        </button>
        <button type="button" className={classesBotao("secundario", "lg")} onClick={aoDescartar}>
          Descartar
        </button>
      </div>
    </section>
  );
}
