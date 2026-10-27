"use client";

import { useEffect, useState } from "react";
import { Carteirinha } from "../carteirinha";
import { paletaDemo, type AparenciaDemo } from "../ilustracoes/avatar";

/**
 * Demonstração do criador de personagem no site público, em forma de carteirinha de sócio.
 * Nada é salvo: o criador de verdade chega na fase 3, com nome validado e único.
 */

const apelidos = [
  "Rei do Blefe",
  "Dama de Ouros",
  "Zé do River",
  "Ana All-in",
  "Coringa",
  "Mão de Alface",
  "Tio do Flop",
];

function sortear<T>(lista: readonly T[], diferenteDe?: T): T {
  const opcoes = lista.length > 1 ? lista.filter((item) => item !== diferenteDe) : lista;
  return opcoes[Math.floor(Math.random() * opcoes.length)] as T;
}

function aparenciaAleatoria(anterior?: AparenciaDemo): AparenciaDemo {
  return {
    pele: sortear(paletaDemo.peles, anterior?.pele),
    cabelo: {
      estilo: sortear(paletaDemo.estilos, anterior?.cabelo.estilo),
      cor: sortear(paletaDemo.cabelos, anterior?.cabelo.cor),
    },
    roupa: sortear(paletaDemo.roupas, anterior?.roupa),
    acessorio: sortear(paletaDemo.acessorios),
    fundo: sortear(paletaDemo.fundos, anterior?.fundo),
  };
}

const inicial: AparenciaDemo = {
  pele: "#d39a6a",
  cabelo: { estilo: "curto", cor: "#1d1410" },
  roupa: "#c99a3b",
  acessorio: "nenhum",
  fundo: "#145236",
};

export const nomesEstilo: Record<AparenciaDemo["cabelo"]["estilo"], string> = {
  curto: "Curto",
  longo: "Longo",
  coque: "Coque",
  moicano: "Moicano",
  careca: "Careca",
};

export const nomesAcessorio: Record<AparenciaDemo["acessorio"], string> = {
  nenhum: "Nada",
  oculos: "Óculos",
  bone: "Boné",
  brinco: "Brincos",
};

export function PersonagemDemo() {
  const [aparencia, setAparencia] = useState(inicial);
  const [apelido, setApelido] = useState(apelidos[0]!);
  const [versao, setVersao] = useState(0);
  const [automatico, setAutomatico] = useState(true);

  // Sorteia sozinho até a pessoa mexer em alguma opção.
  useEffect(() => {
    if (!automatico || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setAparencia((atual) => aparenciaAleatoria(atual));
      setApelido((atual) => sortear(apelidos, atual));
      setVersao((v) => v + 1);
    }, 3200);
    return () => window.clearInterval(id);
  }, [automatico]);

  const escolher = (parcial: Partial<AparenciaDemo>) => {
    setAutomatico(false);
    setAparencia((atual) => ({ ...atual, ...parcial }));
    setVersao((v) => v + 1);
  };

  const sortearTudo = () => {
    setAutomatico(false);
    setAparencia((atual) => aparenciaAleatoria(atual));
    setApelido((atual) => sortear(apelidos, atual));
    setVersao((v) => v + 1);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:items-center">
      {/* A carteirinha */}
      <Carteirinha
        className="mx-auto max-w-[34rem]"
        inclinada
        nome={apelido}
        numero={7}
        aparencia={aparencia}
        desde="2026"
        chaveAnimacao={versao}
      />

      {/* Opções */}
      <div className="space-y-5">
        <GrupoCores
          rotulo="Pele"
          cores={paletaDemo.peles}
          atual={aparencia.pele}
          aoEscolher={(pele) => escolher({ pele })}
        />
        <GrupoCores
          rotulo="Roupa"
          cores={paletaDemo.roupas}
          atual={aparencia.roupa}
          aoEscolher={(roupa) => escolher({ roupa })}
        />
        <GrupoCores
          rotulo="Cor do cabelo"
          cores={paletaDemo.cabelos}
          atual={aparencia.cabelo.cor}
          aoEscolher={(cor) => escolher({ cabelo: { ...aparencia.cabelo, cor } })}
        />
        <GrupoOpcoes
          rotulo="Cabelo"
          opcoes={paletaDemo.estilos}
          nomes={nomesEstilo}
          atual={aparencia.cabelo.estilo}
          aoEscolher={(estilo) => escolher({ cabelo: { ...aparencia.cabelo, estilo } })}
        />
        <GrupoOpcoes
          rotulo="Acessório"
          opcoes={paletaDemo.acessorios}
          nomes={nomesAcessorio}
          atual={aparencia.acessorio}
          aoEscolher={(acessorio) => escolher({ acessorio })}
        />
        <div className="flex flex-wrap items-center gap-4 border-t border-ouro-400/25 pt-5">
          <button
            type="button"
            onClick={sortearTudo}
            className="rotulo rounded-[5px] border border-b-[3px] border-creme-100/40 px-4 py-2.5 text-creme-50 transition-[translate,border-color] duration-150 hover:border-creme-100/80 active:translate-y-[2px] active:border-b"
          >
            Sortear tudo 🎲
          </button>
          <p className="text-sm text-creme-300">É só uma prévia: nada aqui é salvo.</p>
        </div>
      </div>
    </div>
  );
}

export function GrupoCores({
  rotulo,
  cores,
  atual,
  aoEscolher,
}: {
  rotulo: string;
  cores: readonly string[];
  atual: string;
  aoEscolher: (cor: string) => void;
}) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-center">
      <legend className="rotulo float-left mb-2 text-creme-300 sm:mb-0">{rotulo}</legend>
      <div className="flex flex-wrap gap-1.5">
        {cores.map((cor, i) => (
          <button
            key={cor}
            type="button"
            aria-label={`${rotulo}, opção ${i + 1}`}
            aria-pressed={cor === atual}
            onClick={() => aoEscolher(cor)}
            className={`size-8 rounded-[4px] border-2 transition-[translate,border-color] duration-200 hover:-translate-y-0.5 ${
              cor === atual
                ? "border-creme-50 outline-2 outline-offset-2 outline-ouro-300"
                : "border-black/30"
            }`}
            style={{ backgroundColor: cor }}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function GrupoOpcoes<T extends string>({
  rotulo,
  opcoes,
  nomes,
  atual,
  aoEscolher,
}: {
  rotulo: string;
  opcoes: readonly T[];
  nomes: Record<T, string>;
  atual: T;
  aoEscolher: (opcao: T) => void;
}) {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-center">
      <legend className="rotulo float-left mb-2 text-creme-300 sm:mb-0">{rotulo}</legend>
      <div className="flex flex-wrap gap-1.5">
        {opcoes.map((opcao) => (
          <button
            key={opcao}
            type="button"
            aria-pressed={opcao === atual}
            onClick={() => aoEscolher(opcao)}
            className={`rounded-[4px] border px-3 py-1.5 text-sm transition-colors duration-200 ${
              opcao === atual
                ? "border-ouro-300 bg-ouro-300 text-tinta"
                : "border-creme-100/20 text-creme-100 hover:border-creme-100/60"
            }`}
          >
            {nomes[opcao]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
