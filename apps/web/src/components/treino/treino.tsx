"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAvisar } from "../avisos";
import { NIVEIS } from "@poker/bots";
import { EscolhaMesa } from "./escolha-mesa";
import type { JogadorTreino } from "./jogador-padrao";
import { MesaJogo } from "./mesa-jogo";
import { MESAS_DA_CASA, type ConfigTreino } from "./mesas";
import { PainelAcoes } from "./painel-acoes";
import { formatarFichas, linhasDaMao, type LinhaLog } from "./textos";
import { useMesaTreino } from "./use-mesa-treino";

/**
 * Treino: lista de mesas ou a mesa em jogo. Mesas da casa ficam na URL (/treino?mesa=boteco),
 * então o lobby leva direto a elas e recarregar a página volta para a mesma mesa.
 */
export function Treino({ jogador }: { jogador: JogadorTreino }) {
  const parametros = useSearchParams();
  const router = useRouter();
  const preset = MESAS_DA_CASA.find((m) => m.id === parametros.get("mesa")) ?? null;
  const [personalizada, setPersonalizada] = useState<ConfigTreino | null>(null);
  const [sessao, setSessao] = useState(0);
  const config = personalizada ?? preset;

  if (!config) {
    return (
      <EscolhaMesa
        aoEscolher={(c) => {
          setSessao((s) => s + 1);
          if (c.id === "personalizada") setPersonalizada(c);
          else router.push(`/treino?mesa=${c.id}`, { scroll: true });
        }}
      />
    );
  }
  return (
    <Partida
      key={`${config.id}-${sessao}`}
      config={config}
      jogador={jogador}
      aoSair={() => {
        setPersonalizada(null);
        router.push("/treino");
      }}
    />
  );
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

  // Avisos da mesa (bot quebrou e foi trocado) vão para as notificações do app.
  const avisar = useAvisar();
  const avisados = useRef(new Set<string>());
  useEffect(() => {
    for (const aviso of mesa.avisos) {
      if (!avisados.current.has(aviso)) {
        avisados.current.add(aviso);
        avisar("info", aviso);
      }
    }
  }, [mesa.avisos, avisar]);
  const nivel = config.nivel === "misto" ? "Misto" : NIVEIS[config.nivel].nome;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-sala">
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
              <Link
                href="/jogo/preferencias"
                className="rotulo rounded-[5px] border border-white/15 bg-black/45 px-3 py-2 text-creme-100 backdrop-blur-sm transition-colors hover:border-white/40"
              >
                Preferências
              </Link>
              <BotaoBarra onClick={aoSair}>Sair</BotaoBarra>
            </div>
          </div>

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
            className="animar-aviso absolute inset-y-0 right-0 z-30 flex w-[min(100%,24rem)] flex-col border-l border-borda bg-superficie-1/97 backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-borda px-5 py-4">
              <h2 className="font-display text-2xl text-creme-50">Histórico</h2>
              <button
                type="button"
                onClick={() => setVerHistorico(false)}
                className="rotulo rounded-(--radius-controle) border border-borda px-2.5 py-1.5 text-creme-300 hover:text-creme-50"
              >
                Fechar
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {mesa.mao && mesa.mao.fase !== "encerrada" && (
                <section aria-label="Mão atual">
                  <p className="rotulo text-ouro-300">Agora</p>
                  <LogMao linhas={linhasDaMao(mesa.mao, mesa.cartasVisiveis, "Você")} />
                </section>
              )}
              {mesa.historico.length === 0 ? (
                <p className="text-sm text-creme-300">Nenhuma mão terminou ainda.</p>
              ) : (
                <ol className="space-y-5">
                  {mesa.historico.map((h) => (
                    <li key={h.numero} className="border-t border-borda pt-3">
                      <p className="text-sm font-semibold text-creme-50">{h.resumo}</p>
                      <LogMao linhas={h.linhas} />
                    </li>
                  ))}
                </ol>
              )}
            </div>
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

/** Linhas do log: mensagens do sistema (ruas, botão) destacadas das ações dos jogadores. */
function LogMao({ linhas }: { linhas: LinhaLog[] }) {
  return (
    <ul className="mt-2 space-y-1 text-[0.8rem] leading-snug">
      {linhas.map((l, i) => (
        <li key={i} className={l.tipo === "sistema" ? "pt-1 font-mono text-[0.72rem] text-ouro-200/80" : "text-creme-300"}>
          {l.texto}
        </li>
      ))}
    </ul>
  );
}
