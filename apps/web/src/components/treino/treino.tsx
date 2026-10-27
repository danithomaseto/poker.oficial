"use client";

import { useState, type ReactNode } from "react";
import { NIVEIS } from "@poker/bots";
import { EscolhaMesa } from "./escolha-mesa";
import type { JogadorTreino } from "./jogador-padrao";
import { MesaJogo } from "./mesa-jogo";
import type { ConfigTreino } from "./mesas";
import { PainelAcoes } from "./painel-acoes";
import { formatarFichas } from "./textos";
import { useMesaTreino } from "./use-mesa-treino";

export function Treino({ jogador }: { jogador: JogadorTreino }) {
  const [config, setConfig] = useState<ConfigTreino | null>(null);
  const [sessao, setSessao] = useState(0);

  if (!config) {
    return (
      <EscolhaMesa
        aoEscolher={(c) => {
          setConfig(c);
          setSessao((s) => s + 1);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }
  return <Partida key={sessao} config={config} jogador={jogador} aoSair={() => setConfig(null)} />;
}

function Partida({
  config,
  jogador,
  aoSair,
}: {
  config: ConfigTreino;
  jogador: JogadorTreino;
  aoSair: () => void;
}) {
  const mesa = useMesaTreino(config, jogador);
  const [verHistorico, setVerHistorico] = useState(false);
  const nivel = config.nivel === "misto" ? "Misto" : NIVEIS[config.nivel].nome;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-[#050d0a]">
      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <MesaJogo mesa={mesa} />

          {/* Informações da mesa sobre a sala, sem roubar espaço da mesa */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4">
            <div className="rounded-[6px] bg-black/45 px-3 py-2 backdrop-blur-sm">
              <p className="font-display text-lg leading-tight text-creme-50">{config.nome}</p>
              <p className="rotulo mt-0.5 flex flex-wrap gap-x-3 text-creme-300">
                <span className="text-ouro-300">{nivel}</span>
                {mesa.mao && <span>Mão #{mesa.mao.numero}</span>}
                <span>
                  Blinds {formatarFichas(Math.floor(mesa.bigBlind / 2))}/
                  {formatarFichas(mesa.bigBlind)}
                </span>
              </p>
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
              <BotaoBarra onClick={mesa.alternarPausa} ativo={mesa.pausado}>
                {mesa.pausado ? "Continuar" : "Pausar"}
              </BotaoBarra>
              <BotaoBarra onClick={mesa.alternarVelocidade} ativo={mesa.velocidade === "rapida"}>
                {mesa.velocidade === "rapida" ? "Bots rápidos" : "Bots no ritmo"}
              </BotaoBarra>
              <BotaoBarra onClick={() => setVerHistorico((v) => !v)} ativo={verHistorico}>
                Histórico
              </BotaoBarra>
              <BotaoBarra onClick={aoSair}>Sair</BotaoBarra>
            </div>
          </div>

          {/* Avisos (bots que quebraram e foram substituídos) */}
          {mesa.avisos.length > 0 && (
            <div className="pointer-events-none absolute top-20 left-1/2 z-20 flex w-[min(90%,32rem)] -translate-x-1/2 flex-col gap-2">
              {mesa.avisos.slice(0, 2).map((a) => (
                <p
                  key={a}
                  className="animar-mensagem rounded-[6px] bg-creme-50/95 px-4 py-2 text-center text-sm text-tinta shadow-lg"
                >
                  {a}
                </p>
              ))}
            </div>
          )}

          {/* Placar da sessão */}
          <dl className="absolute bottom-3 left-3 z-20 hidden gap-4 rounded-[6px] bg-black/45 px-3 py-2 font-mono text-xs text-creme-300 backdrop-blur-sm sm:flex">
            <div>
              <dt className="inline">Mãos </dt>
              <dd className="inline text-creme-50">{mesa.estatisticas.maos}</dd>
            </div>
            <div>
              <dt className="inline">Ganhas </dt>
              <dd className="inline text-creme-50">{mesa.estatisticas.ganhas}</dd>
            </div>
            <div>
              <dt className="inline">Maior pote </dt>
              <dd className="inline text-creme-50">
                {formatarFichas(mesa.estatisticas.maiorPote)}
              </dd>
            </div>
          </dl>
        </div>

        {verHistorico && (
          <aside
            aria-label="Histórico de mãos"
            className="animar-mensagem absolute inset-y-0 right-0 z-20 w-[min(100%,24rem)] overflow-y-auto border-l border-ouro-400/25 bg-mesa-950/95 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-creme-50">Histórico</h2>
              <button
                type="button"
                onClick={() => setVerHistorico(false)}
                className="rotulo text-creme-300 hover:text-creme-50"
              >
                Fechar
              </button>
            </div>
            {mesa.historico.length === 0 && (
              <p className="mt-4 text-sm text-creme-300">Nenhuma mão terminou ainda.</p>
            )}
            <ol className="mt-4 space-y-5">
              {mesa.historico.map((h) => (
                <li key={h.numero} className="border-t border-ouro-400/20 pt-3">
                  <p className="rotulo text-ouro-300">Mão #{h.numero}</p>
                  <p className="mt-1 text-sm text-creme-50">{h.resumo}</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-creme-300">
                    {h.linhas.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>

      <PainelAcoes mesa={mesa} aoSair={aoSair} />
    </div>
  );
}

function BotaoBarra({
  children,
  onClick,
  ativo,
}: {
  children: ReactNode;
  onClick: () => void;
  ativo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`rotulo rounded-[5px] border px-3 py-2 backdrop-blur-sm transition-colors ${
        ativo
          ? "border-creme-100 bg-creme-100 text-tinta"
          : "border-white/15 bg-black/45 text-creme-100 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}
