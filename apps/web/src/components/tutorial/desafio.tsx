"use client";

import { useEffect } from "react";
import { useIdentidadeLocal } from "@/lib/identidade-local";
import { MesaJogo } from "../treino/mesa-jogo";
import type { ConfigTreino } from "../treino/mesas";
import { PainelAcoes } from "../treino/painel-acoes";
import { useMesaTreino } from "../treino/use-mesa-treino";
import { analisarDecisoes, type Nota } from "./analise";
import type { PropsPasso } from "./passos";

export const MAOS_DESAFIO = 3;

const CONFIG_DESAFIO: ConfigTreino = {
  id: "desafio",
  nome: "Desafio final",
  descricao: "Três bots iniciantes, cartas embaralhadas de verdade.",
  nivel: "facil",
  bots: 3,
  fichasIniciais: 1000,
  bigBlind: 20,
  subirBlindsACada: 0,
};

const NOTAS: Record<Nota, { rotulo: string; classe: string }> = {
  boa: { rotulo: "Boa", classe: "bg-sucesso/25 text-creme-50" },
  ok: { rotulo: "Ok", classe: "bg-creme-100/10 text-creme-100" },
  atencao: { rotulo: "Atenção", classe: "bg-perigo/25 text-perigo-claro" },
};

const FASES = { preflop: "Pré-flop", flop: "Flop", turn: "Turn", river: "River", encerrada: "Fim" } as const;

/**
 * Desafio final: mãos sem roteiro, contra os bots reais (os mesmos do treino, no nível fácil).
 * Conclui depois de {MAOS_DESAFIO} mãos completas; a cada mão, as suas decisões são comentadas.
 */
export function Desafio({ aoConcluir, concluido }: PropsPasso) {
  const eu = useIdentidadeLocal();
  const mesa = useMesaTreino(CONFIG_DESAFIO, eu);
  const jogadas = mesa.estatisticas.maos;

  useEffect(() => {
    if (jogadas >= MAOS_DESAFIO && !concluido) aoConcluir();
  }, [jogadas, concluido, aoConcluir]);

  const encerrada = mesa.mao?.fase === "encerrada" && mesa.aguardandoProxima;
  const decisoes = encerrada && mesa.mao ? analisarDecisoes(mesa.mao, mesa.indiceVoce) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-creme-100/90">
          Agora sem roteiro: cartas embaralhadas e bots decidindo sozinhos. Jogue {MAOS_DESAFIO} mãos completas.
        </p>
        <p className="rotulo rounded-full border border-borda px-3 py-1 text-creme-100">
          Mãos: <span className="font-mono text-ouro-200">{Math.min(jogadas, MAOS_DESAFIO)}</span> / {MAOS_DESAFIO}
        </p>
      </div>
      <div className="overflow-hidden rounded-(--radius-painel) border border-borda">
        <div className="relative h-[22rem] sm:h-[26rem] lg:h-[30rem]">
          <MesaJogo mesa={mesa} />
        </div>
        <PainelAcoes mesa={mesa} aoSair={mesa.recomprar} />
      </div>

      {encerrada && (
        <section aria-labelledby="titulo-analise" className="animar-aviso rounded-(--radius-cartao) border border-borda bg-superficie-1/80 p-4">
          <h4 id="titulo-analise" className="font-display text-xl text-creme-50">
            Análise da mão {mesa.mao?.numero}
          </h4>
          {decisoes.length === 0 ? (
            <p className="mt-2 text-sm text-creme-300">Você não precisou decidir nada nesta mão (os outros resolveram antes).</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {decisoes.map((d, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <span className={`rotulo rounded-[3px] px-1.5 py-0.5 ${NOTAS[d.nota].classe}`}>{NOTAS[d.nota].rotulo}</span>
                  <span className="font-mono text-xs text-creme-500">{FASES[d.fase]}</span>
                  <span className="text-creme-50">Você {d.acao}.</span>
                  <span className="text-creme-300">{d.comentario}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
