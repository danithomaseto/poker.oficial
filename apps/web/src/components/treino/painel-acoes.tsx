"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { avaliar, descreverMao } from "@poker/engine";
import { classesBotao } from "../botao";
import { Carta } from "../carta";
import { paraVisual } from "./mesa-jogo";
import type { MesaTreino } from "./use-mesa-treino";
import { formatarFichas } from "./textos";

/**
 * Dock de ações do jogador. Só oferece o que `obterAcoesValidas` permite: a interface nunca
 * habilita jogada inválida. Atalhos: F desiste, C passa/paga, R foca o valor, Enter confirma.
 */
export function PainelAcoes({ mesa, aoSair }: { mesa: MesaTreino; aoSair: () => void }) {
  const { acoesValidas: v, visao, suaVez } = mesa;
  const faixa = v?.apostar ?? v?.aumentar ?? null;
  const campo = useRef<HTMLInputElement>(null);

  // O valor escolhido vale só para a decisão atual; numa nova decisão volta ao mínimo.
  const chaveDecisao = `${visao?.numero ?? 0}-${visao?.historico.length ?? 0}`;
  const [escolha, setEscolha] = useState<{ chave: string; valor: number } | null>(null);
  const valor = escolha?.chave === chaveDecisao ? escolha.valor : (faixa?.min ?? 0);
  const setValor = (novo: number) => setEscolha({ chave: chaveDecisao, valor: novo });

  const eu = visao && mesa.indiceVoce >= 0 ? visao.jogadores[mesa.indiceVoce] : null;
  const pote = visao?.pote ?? 0;
  const pagar = v?.valorParaPagar ?? 0;
  const valorFinal = faixa ? Math.max(faixa.min, Math.min(faixa.max, Math.round(valor || 0))) : 0;
  const ehAllIn = !!faixa && valorFinal >= faixa.max;
  const preenchido = faixa && faixa.max > faixa.min ? ((valorFinal - faixa.min) / (faixa.max - faixa.min)) * 100 : 100;

  const apostar = () => {
    if (!faixa) return;
    mesa.agir(ehAllIn ? { tipo: "allin" } : { tipo: v?.apostar ? "apostar" : "aumentar", valor: valorFinal });
  };
  const passarOuPagar = () => mesa.agir(v?.podePassar ? { tipo: "passar" } : { tipo: "pagar" });

  useEffect(() => {
    if (!suaVez) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type === "number" && e.key !== "Enter") return;
      const tecla = e.key.toLowerCase();
      if (tecla === "f") mesa.agir({ tipo: "desistir" });
      else if (tecla === "c") passarOuPagar();
      else if (tecla === "r") campo.current?.focus();
      else if (tecla === "enter" && document.activeElement === campo.current) apostar();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  const minhaMao =
    eu?.cartas && visao && mesa.cartasVisiveis >= 3
      ? descreverMao(avaliar([...eu.cartas, ...visao.board.slice(0, mesa.cartasVisiveis)]))
      : null;
  const odds = suaVez && pagar > 0 ? Math.round((pagar / (pote + pagar)) * 100) : null;

  const base = visao?.apostaAtual ?? 0;
  const atalhos = faixa
    ? [
        { rotulo: "Mín", valor: faixa.min },
        { rotulo: "1/2", valor: base + Math.round((pote + pagar) / 2) },
        { rotulo: "3/4", valor: base + Math.round(((pote + pagar) * 3) / 4) },
        { rotulo: "Pote", valor: base + pote + pagar },
        { rotulo: "All-in", valor: faixa.max },
      ].map((a) => ({ ...a, valor: Math.max(faixa.min, Math.min(faixa.max, a.valor)) }))
    : [];

  return (
    <div className="relative border-t border-white/10 bg-[linear-gradient(#0d1411,#080c0a)] shadow-[0_-12px_30px_rgba(0,0,0,0.45)]">
      <div className="conteiner grid min-h-[6.5rem] items-center gap-x-8 gap-y-3 py-3 lg:grid-cols-[minmax(14rem,1fr)_auto]">
        {/* Zona 1: sua mão e leitura do pote */}
        <div className="flex min-w-0 items-center gap-4">
          {eu?.cartas && !eu.desistiu ? (
            <div className="hidden shrink-0 gap-1 sm:flex" aria-hidden>
              {eu.cartas.map((c) => (
                <Carta key={c} carta={paraVisual(c)} largura="2.2rem" />
              ))}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="rotulo text-creme-500">Fichas</span>
              <span className="font-mono text-xl text-ouro-200 tabular-nums">
                {formatarFichas(eu?.fichas ?? mesa.lugares[0]!.fichas)}
              </span>
              {minhaMao && <span className="truncate font-display text-lg text-creme-50">{minhaMao}</span>}
            </p>
            <p className="mt-0.5 truncate text-sm text-creme-300" aria-live="polite">
              {mesa.erro ? (
                <span className="text-[#f39a96]">{mesa.erro}</span>
              ) : odds !== null ? (
                <>
                  Pagar {formatarFichas(pagar)} para um pote de {formatarFichas(pote)}: vale se você ganhar{" "}
                  <strong className="text-creme-50">{odds}%</strong> das vezes
                </>
              ) : (
                <StatusMesa mesa={mesa} />
              )}
            </p>
          </div>
        </div>

        {/* Zona 2 e 3: dimensionamento e botões */}
        {mesa.voceSemFichas ? (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <p className="font-display text-xl text-creme-50">Você quebrou.</p>
            <button type="button" className={classesBotao("primario", "lg")} onClick={mesa.recomprar}>
              Recomprar fichas
            </button>
            <button type="button" className={classesBotao("secundario", "lg")} onClick={aoSair}>
              Trocar de mesa
            </button>
          </div>
        ) : suaVez && v ? (
          <div className="flex flex-col gap-2.5 lg:items-end">
            {faixa && (
              <div className="flex flex-wrap items-center gap-3">
                <div role="group" aria-label="Atalhos de valor" className="flex overflow-hidden rounded-[5px] border border-white/15">
                  {atalhos.map((a) => (
                    <button
                      key={a.rotulo}
                      type="button"
                      onClick={() => setValor(a.valor)}
                      aria-pressed={valorFinal === a.valor}
                      className={`border-r border-white/10 px-3 py-1.5 font-mono text-xs font-medium transition-colors last:border-r-0 ${
                        valorFinal === a.valor ? "bg-creme-100 text-tinta" : "text-creme-100 hover:bg-white/8"
                      }`}
                    >
                      {a.rotulo}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  aria-label="Valor da aposta"
                  min={faixa.min}
                  max={faixa.max}
                  step={Math.max(1, Math.floor(mesa.bigBlind / 2))}
                  value={valorFinal}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="slider-aposta w-40 sm:w-56"
                  style={{ "--preenchido": `${preenchido}%` } as CSSProperties}
                />
                <input
                  ref={campo}
                  type="number"
                  inputMode="numeric"
                  aria-label="Valor exato da aposta"
                  min={faixa.min}
                  max={faixa.max}
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="h-9 w-28 rounded-[5px] border border-white/15 bg-black/40 px-2.5 text-right font-mono text-creme-50 tabular-nums focus:border-ouro-300"
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <BotaoAcao tipo="desistir" atalho="F" onClick={() => mesa.agir({ tipo: "desistir" })} rotulo="Desistir" />
              <BotaoAcao
                tipo="neutro"
                atalho="C"
                onClick={passarOuPagar}
                rotulo={v.podePassar ? "Passar" : "Pagar"}
                valor={v.podePassar ? undefined : formatarFichas(v.valorParaPagar)}
              />
              {faixa ? (
                <BotaoAcao
                  tipo="principal"
                  atalho="↵"
                  onClick={apostar}
                  rotulo={ehAllIn ? "All-in" : v.apostar ? "Apostar" : "Aumentar para"}
                  valor={formatarFichas(valorFinal)}
                />
              ) : (
                <BotaoAcao tipo="principal" rotulo="Aumentar" desabilitado onClick={() => {}} />
              )}
            </div>
          </div>
        ) : mesa.aguardandoProxima ? (
          <div className="flex items-center gap-4 lg:justify-end">
            <p className="text-sm text-creme-300">{mesa.pausado ? "Mesa pausada." : "Próxima mão em instantes"}</p>
            <button type="button" className={classesBotao("primario", "lg")} onClick={mesa.proximaMao}>
              Próxima mão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 opacity-40 lg:justify-self-end" aria-hidden>
            <BotaoAcao tipo="desistir" rotulo="Desistir" desabilitado onClick={() => {}} />
            <BotaoAcao tipo="neutro" rotulo="Passar" desabilitado onClick={() => {}} />
            <BotaoAcao tipo="principal" rotulo="Aumentar" desabilitado onClick={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusMesa({ mesa }: { mesa: MesaTreino }) {
  const { mao } = mesa;
  if (mesa.pausado) return <>Mesa pausada.</>;
  if (!mao) return <>Embaralhando…</>;
  if (mao.vez !== null) {
    const vez = mao.jogadores[mao.vez]!;
    return mao.vez === mesa.indiceVoce ? <>Sua vez.</> : <>Vez de {vez.nome}.</>;
  }
  if (mesa.indiceVoce >= 0 && mao.jogadores[mesa.indiceVoce]?.desistiu) return <>Você desistiu desta mão.</>;
  return <>Distribuindo…</>;
}

function BotaoAcao({
  tipo,
  rotulo,
  valor,
  atalho,
  desabilitado,
  onClick,
}: {
  tipo: "desistir" | "neutro" | "principal";
  rotulo: string;
  valor?: string;
  atalho?: string;
  desabilitado?: boolean;
  onClick: () => void;
}): ReactNode {
  const estilos = {
    desistir:
      "border-[#5a2a28] bg-transparent text-[#f0a29d] hover:border-[#b5332f] hover:bg-[#b5332f]/12",
    neutro: "border-[#2f3a34] bg-[#1a221e] text-creme-50 hover:border-creme-100/40 hover:bg-[#222c27]",
    principal:
      "border-ouro-600 border-b-[3px] bg-ouro-300 text-tinta hover:bg-ouro-200 active:border-b",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className={`group/acao relative flex h-14 min-w-[8.5rem] flex-col items-center justify-center rounded-[6px] border px-4 leading-tight font-semibold transition-[background-color,border-color,translate] duration-150 active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50 sm:min-w-[10rem] ${estilos[tipo]}`}
    >
      <span className={valor ? "text-[0.78rem] tracking-wide uppercase opacity-80" : "text-base"}>{rotulo}</span>
      {valor && <span className="font-mono text-lg tabular-nums">{valor}</span>}
      {atalho && (
        <kbd className="absolute top-1 right-1.5 hidden font-mono text-[0.6rem] font-normal opacity-45 lg:block">{atalho}</kbd>
      )}
    </button>
  );
}
