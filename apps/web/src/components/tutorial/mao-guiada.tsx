"use client";

import { useEffect, useMemo, useState } from "react";
import { aplicarAcao, avaliar, descreverMao, obterAcoesValidas, projetarParaJogador, type TipoAcao } from "@poker/engine";
import { useIdentidadeLocal } from "@/lib/identidade-local";
import { usePreferencias } from "@/lib/preferencias";
import type { AparenciaDemo } from "../ilustracoes/avatar";
import { MesaJogo } from "../treino/mesa-jogo";
import { descreverAcao, foiAllIn, formatarFichas } from "../treino/textos";
import type { Lugar } from "../treino/use-mesa-treino";
import { acaoDaJogada, iniciarRoteiro, type Roteiro } from "./roteiros";
import type { PropsPasso } from "./passos";

const APARENCIAS_BOTS: AparenciaDemo[] = [
  { pele: "#a8724d", cabelo: { estilo: "moicano", cor: "#1d1410" }, roupa: "#2f7dd1", acessorio: "bone", fundo: "#1d2b3a" },
  { pele: "#f6d3b3", cabelo: { estilo: "longo", cor: "#b5651d" }, roupa: "#d14b6a", acessorio: "brinco", fundo: "#3a1f2b" },
  { pele: "#7c4a2d", cabelo: { estilo: "careca", cor: "#1d1410" }, roupa: "#1f9d74", acessorio: "oculos", fundo: "#2d2a1a" },
];

const FASES = { preflop: "Pré-flop", flop: "Flop", turn: "Turn", river: "River", encerrada: "Fim da mão" } as const;

/**
 * Uma mão do tutorial jogada na mesa de verdade. Os bots seguem o roteiro; na sua vez, só a
 * jogada pedida avança (as outras explicam por que não). O passo conclui quando a mão termina.
 */
export function MaoGuiada({ roteiro, aoConcluir, concluido }: PropsPasso & { roteiro: Roteiro }) {
  const eu = useIdentidadeLocal();
  const [preferencias] = usePreferencias();
  const inicial = () => ({ estado: iniciarRoteiro(roteiro, eu.nome), feitas: 0 });
  const [jogo, setJogo] = useState(inicial);
  const [cartasVisiveis, setCartasVisiveis] = useState(0);
  const [retorno, setRetorno] = useState<{ certo: boolean; texto: string } | null>(null);
  const [erros, setErros] = useState(0);
  const { estado, feitas } = jogo;
  const fator = preferencias.velocidadeBots === "rapida" ? 0.5 : 1;

  const boardPronto = cartasVisiveis >= estado.board.length;
  const jogada = roteiro.jogadas[feitas];
  const vezDoBot = estado.vez !== null && jogada?.tipo === "bot" && boardPronto;
  const suaVez = estado.vez === 0 && jogada?.tipo === "voce" && boardPronto;
  const terminou = estado.fase === "encerrada" && boardPronto;

  // Revela o board aos poucos, como na mesa de treino.
  useEffect(() => {
    if (boardPronto) return;
    const alvo = cartasVisiveis < 3 ? 3 : cartasVisiveis + 1;
    const id = window.setTimeout(() => setCartasVisiveis(Math.min(alvo, estado.board.length)), 700 * fator);
    return () => window.clearTimeout(id);
  }, [boardPronto, cartasVisiveis, estado.board.length, fator]);

  // Vez de um bot: espera um pouco e faz a jogada do roteiro.
  useEffect(() => {
    if (!vezDoBot || !jogada) return;
    const id = window.setTimeout(() => {
      setJogo((atual) =>
        atual.feitas === feitas ? { estado: aplicarAcao(atual.estado, atual.estado.vez!, acaoDaJogada(jogada)).estado, feitas: feitas + 1 } : atual,
      );
    }, 1000 * fator);
    return () => window.clearTimeout(id);
  }, [vezDoBot, jogada, feitas, fator]);

  useEffect(() => {
    if (terminou && !concluido) aoConcluir();
  }, [terminou, concluido, aoConcluir]);

  const agir = (tipo: TipoAcao) => {
    if (!suaVez || jogada?.tipo !== "voce") return;
    if (tipo !== jogada.espera) {
      setErros((e) => e + 1);
      setRetorno({ certo: false, texto: jogada.errado });
      return;
    }
    setErros(0);
    setRetorno({ certo: true, texto: jogada.certo });
    setJogo({ estado: aplicarAcao(estado, 0, acaoDaJogada(jogada)).estado, feitas: feitas + 1 });
  };

  const reiniciar = () => {
    setJogo(inicial());
    setCartasVisiveis(0);
    setRetorno(null);
    setErros(0);
  };

  const lugares = useMemo<Lugar[]>(
    () =>
      estado.jogadores.map((j, i) => ({
        id: j.id,
        nome: i === 0 ? eu.nome : j.nome,
        tipo: i === 0 ? "voce" : "bot",
        aparencia: i === 0 ? eu.aparencia : APARENCIAS_BOTS[(i - 1) % APARENCIAS_BOTS.length]!,
        fichas: j.fichas,
        assento: j.assento,
      })),
    [estado.jogadores, eu.aparencia, eu.nome],
  );
  const visao = useMemo(() => {
    const v = projetarParaJogador(estado, 0);
    return { ...v, jogadores: v.jogadores.map((j) => (j.indice === 0 ? { ...j, nome: eu.nome } : j)) };
  }, [estado, eu.nome]);
  const mesa = { visao, lugares, cartasVisiveis, pensando: vezDoBot ? estado.vez : null, indiceVoce: 0 };

  const voce = estado.jogadores[0]!;
  const minhaMao =
    cartasVisiveis >= 3 ? descreverMao(avaliar([...voce.cartas, ...estado.board.slice(0, cartasVisiveis)])) : null;
  const ultimas = estado.acoes.map((a, i) => ({ ...a, allIn: foiAllIn(estado, i) })).slice(-4).reverse();

  return (
    <div className="space-y-4">
      <p className="text-creme-100/90">{roteiro.introducao}</p>
      <div className="overflow-hidden rounded-(--radius-painel) border border-borda">
        <div className="relative h-[22rem] sm:h-[26rem] lg:h-[30rem]">
          <MesaJogo mesa={mesa} />
          <span className="rotulo absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-ouro-200">
            {FASES[estado.fase === "encerrada" && !boardPronto ? "river" : estado.fase]}
          </span>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-[linear-gradient(#0d1411,#080c0a)] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0 space-y-2" aria-live="polite">
            {minhaMao && !voce.desistiu && (
              <p className="text-sm text-creme-300">
                Sua mão agora: <strong className="font-display text-base text-creme-50">{minhaMao}</strong>
              </p>
            )}
            {suaVez && jogada?.tipo === "voce" ? (
              <p className="rounded-(--radius-cartao) border-l-4 border-ouro-300 bg-ouro-300/10 px-3 py-2 text-creme-50">{jogada.dica}</p>
            ) : terminou ? (
              <p className="rounded-(--radius-cartao) border-l-4 border-sucesso bg-sucesso/10 px-3 py-2 text-creme-50">{roteiro.final}</p>
            ) : (
              <p className="text-sm text-creme-300">
                {estado.vez !== null && estado.vez !== 0 ? `Vez de ${estado.jogadores[estado.vez]!.nome}…` : "Distribuindo…"}
              </p>
            )}
            {retorno && !terminou && (
              <p className={`animar-aviso text-sm ${retorno.certo ? "text-sucesso" : "text-perigo-claro"}`}>
                {retorno.certo ? "✓ " : "✗ "}
                {retorno.texto}
              </p>
            )}
            {ultimas.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-creme-500">
                {ultimas.map((a, i) => (
                  <li key={`${estado.acoes.length - i}`}>
                    {a.indice === 0 ? "Você" : estado.jogadores[a.indice]!.nome} {descreverAcao(a.tipo, a.valor, a.allIn)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {terminou ? (
            <button type="button" onClick={reiniciar} className="h-12 rounded-(--radius-cartao) border border-borda-forte px-5 text-creme-100 hover:border-creme-100/60">
              Jogar de novo
            </button>
          ) : (
            <BotoesTutorial
              ativo={suaVez}
              estado={estado}
              valorPedido={jogada?.tipo === "voce" ? jogada.valor : undefined}
              destacar={erros > 0 && jogada?.tipo === "voce" ? jogada.espera : null}
              aoAgir={agir}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BotoesTutorial({
  ativo,
  estado,
  valorPedido,
  destacar,
  aoAgir,
}: {
  ativo: boolean;
  estado: ReturnType<typeof iniciarRoteiro>;
  valorPedido?: number;
  destacar: TipoAcao | null;
  aoAgir: (tipo: TipoAcao) => void;
}) {
  const v = ativo ? obterAcoesValidas(estado, 0) : null;
  const faixa = v?.apostar ?? v?.aumentar;
  const valor = faixa ? Math.max(faixa.min, Math.min(faixa.max, valorPedido ?? faixa.min)) : 0;
  const botoes: { tipo: TipoAcao; rotulo: string; valor?: string; visivel: boolean; estilo: string }[] = [
    { tipo: "desistir", rotulo: "Desistir", visivel: !!v?.podeDesistir, estilo: "border-perigo/45 text-perigo-claro hover:bg-perigo/12" },
    { tipo: "passar", rotulo: "Passar", visivel: !!v?.podePassar, estilo: "border-borda-forte bg-superficie-3 text-creme-50 hover:border-creme-100/40" },
    { tipo: "pagar", rotulo: "Pagar", valor: formatarFichas(v?.valorParaPagar ?? 0), visivel: !!v && v.valorParaPagar > 0, estilo: "border-borda-forte bg-superficie-3 text-creme-50 hover:border-creme-100/40" },
    { tipo: v?.apostar ? "apostar" : "aumentar", rotulo: v?.apostar ? "Apostar" : "Aumentar para", valor: formatarFichas(valor), visivel: !!faixa && valor < (v?.valorAllIn ?? 0), estilo: "border-ouro-600 border-b-[3px] bg-ouro-300 text-tinta hover:bg-ouro-200" },
    { tipo: "allin", rotulo: "All-in", valor: formatarFichas(v?.valorAllIn ?? 0), visivel: !!v && v.valorAllIn > 0, estilo: "border-ouro-600 bg-transparent text-ouro-200 hover:bg-ouro-300/10" },
  ];
  if (!v) {
    return (
      <div className="flex gap-2 opacity-40" aria-hidden>
        {["Desistir", "Passar", "Apostar"].map((r) => (
          <span key={r} className="grid h-12 min-w-24 place-items-center rounded-(--radius-cartao) border border-borda px-3 text-sm text-creme-300">
            {r}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {botoes
        .filter((b) => b.visivel)
        .map((b) => (
          <button
            key={b.tipo}
            type="button"
            onClick={() => aoAgir(b.tipo)}
            className={`flex h-12 min-w-24 flex-col items-center justify-center rounded-(--radius-cartao) border px-3 leading-tight font-semibold transition-colors active:translate-y-px ${b.estilo} ${
              destacar === b.tipo ? "ring-4 ring-ouro-300/70 ring-offset-2 ring-offset-[#0b100d]" : ""
            }`}
          >
            <span className={b.valor ? "text-[0.7rem] tracking-wide uppercase opacity-80" : "text-sm"}>{b.rotulo}</span>
            {b.valor && <span className="font-mono text-base tabular-nums">{b.valor}</span>}
          </button>
        ))}
    </div>
  );
}
