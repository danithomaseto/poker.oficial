"use client";

import { useState, type CSSProperties } from "react";
import { c, type CartaVisual } from "../baralho";
import { Carta } from "../carta";

type Mao = {
  nome: string;
  descricao: string;
  cartas: CartaVisual[];
  /** Índices das cartas que formam a mão (as outras são kickers). */
  contam: number[];
};

const maos: Mao[] = [
  {
    nome: "Royal Flush",
    descricao: "A sequência mais alta, do 10 ao Ás, toda do mesmo naipe. A mão imbatível.",
    cartas: [
      c("A", "espadas"),
      c("K", "espadas"),
      c("Q", "espadas"),
      c("J", "espadas"),
      c("10", "espadas"),
    ],
    contam: [0, 1, 2, 3, 4],
  },
  {
    nome: "Straight Flush",
    descricao: "Cinco cartas em sequência do mesmo naipe.",
    cartas: [c("9", "copas"), c("8", "copas"), c("7", "copas"), c("6", "copas"), c("5", "copas")],
    contam: [0, 1, 2, 3, 4],
  },
  {
    nome: "Quadra",
    descricao: "Quatro cartas do mesmo valor. A quinta carta desempata.",
    cartas: [c("Q", "paus"), c("Q", "ouros"), c("Q", "copas"), c("Q", "espadas"), c("7", "ouros")],
    contam: [0, 1, 2, 3],
  },
  {
    nome: "Full House",
    descricao: "Uma trinca e um par juntos. Ganha quem tem a trinca mais alta.",
    cartas: [
      c("K", "espadas"),
      c("K", "copas"),
      c("K", "ouros"),
      c("4", "paus"),
      c("4", "espadas"),
    ],
    contam: [0, 1, 2, 3, 4],
  },
  {
    nome: "Flush",
    descricao: "Cinco cartas do mesmo naipe, fora de sequência.",
    cartas: [c("A", "ouros"), c("J", "ouros"), c("8", "ouros"), c("6", "ouros"), c("2", "ouros")],
    contam: [0, 1, 2, 3, 4],
  },
  {
    nome: "Sequência",
    descricao: "Cinco cartas em ordem, de naipes variados. O Ás pode ser baixo: A-2-3-4-5 vale.",
    cartas: [c("10", "paus"), c("9", "ouros"), c("8", "espadas"), c("7", "copas"), c("6", "paus")],
    contam: [0, 1, 2, 3, 4],
  },
  {
    nome: "Trinca",
    descricao: "Três cartas do mesmo valor.",
    cartas: [
      c("7", "espadas"),
      c("7", "copas"),
      c("7", "paus"),
      c("K", "ouros"),
      c("2", "espadas"),
    ],
    contam: [0, 1, 2],
  },
  {
    nome: "Dois Pares",
    descricao:
      "Dois pares diferentes. Empatou? Vale o par mais alto, depois o outro, depois o kicker.",
    cartas: [c("J", "copas"), c("J", "paus"), c("5", "espadas"), c("5", "ouros"), c("A", "paus")],
    contam: [0, 1, 2, 3],
  },
  {
    nome: "Par",
    descricao: "Duas cartas do mesmo valor. As outras três desempatam, da maior para a menor.",
    cartas: [
      c("10", "copas"),
      c("10", "espadas"),
      c("K", "paus"),
      c("8", "ouros"),
      c("3", "copas"),
    ],
    contam: [0, 1],
  },
  {
    nome: "Carta Alta",
    descricao: "Nada combinou. Vale a carta mais alta, depois a seguinte, e assim por diante.",
    cartas: [c("A", "paus"), c("Q", "ouros"), c("9", "espadas"), c("6", "copas"), c("3", "paus")],
    contam: [0],
  },
];

export function RankingMaosInterativo() {
  const [indice, setIndice] = useState(0);
  const mao = maos[indice]!;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 2xl:gap-24">
      <ol
        className="grid grid-cols-1 border-t-2 border-tinta sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-1"
        aria-label="Mãos do poker, da mais forte para a mais fraca"
      >
        {maos.map((m, i) => {
          const ativa = i === indice;
          return (
            <li key={m.nome}>
              <button
                type="button"
                aria-pressed={ativa}
                aria-controls="mao-selecionada"
                onClick={() => setIndice(i)}
                onMouseEnter={() => setIndice(i)}
                onFocus={() => setIndice(i)}
                className={`group/mao relative flex w-full items-baseline gap-4 border-b border-tinta/15 py-3 text-left transition-colors duration-200 ${
                  ativa ? "text-naipe-vermelho" : "text-tinta hover:text-naipe-vermelho"
                }`}
              >
                <span className="rotulo w-7 shrink-0 text-tinta-suave tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`font-display text-xl sm:text-2xl ${ativa ? "italic" : ""}`}>
                  {m.nome}
                </span>
                <span
                  aria-hidden
                  className={`ml-auto font-display text-xl transition-[opacity,translate] duration-300 ${ativa ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                >
                  ♦
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id="mao-selecionada"
        aria-live="polite"
        className="textura-feltro relative flex flex-col justify-center self-start overflow-hidden rounded-[18px] border-[10px] border-[#5a3a22] bg-mesa-600 p-6 shadow-[inset_0_0_80px_rgba(0,0,0,0.55),0_24px_50px_-20px_rgba(0,0,0,0.6)] sm:p-10 lg:sticky lg:top-24 2xl:p-14"
      >
        <div key={indice} className="relative">
          <p className="rotulo animar-mensagem text-ouro-300">
            Nº {indice + 1} de {maos.length}
          </p>
          <h3
            className="animar-mensagem mt-2 font-display text-4xl font-medium text-creme-50 sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            {mao.nome}
          </h3>

          <div className="@container mt-8 flex justify-center gap-[2%] sm:justify-start">
            {mao.cartas.map((carta, i) => (
              <span
                key={i}
                className="animar-distribuir inline-block"
                style={
                  {
                    "--de-x": "-120px",
                    "--de-y": "-40px",
                    animationDelay: `${i * 70}ms`,
                  } as CSSProperties
                }
              >
                <Carta
                  carta={carta}
                  largura="min(7.5rem, 18cqw)"
                  virar
                  atraso={250 + i * 90}
                  apagada={!mao.contam.includes(i)}
                  className={mao.contam.includes(i) ? "" : "translate-y-2"}
                />
              </span>
            ))}
          </div>

          <p
            className="animar-mensagem mt-8 max-w-md text-creme-100"
            style={{ animationDelay: "450ms" }}
          >
            {mao.descricao}
          </p>
          {mao.contam.length < 5 && (
            <p
              className="animar-mensagem mt-2 text-sm text-creme-300"
              style={{ animationDelay: "550ms" }}
            >
              As cartas apagadas são os kickers: só contam para desempatar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
