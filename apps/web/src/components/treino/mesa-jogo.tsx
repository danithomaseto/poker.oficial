"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { NIVEIS } from "@poker/bots";
import { naipeDe, valorDe, type Carta as CartaMotor, type VisaoMao } from "@poker/engine";
import type { CartaVisual, Naipe, Valor } from "../baralho";
import { Carta, VersoCarta } from "../carta";
import { Avatar } from "../ilustracoes/avatar";
import { PilhaFichas } from "./fichas";
import { formatarFichas, rotuloAcao } from "./textos";
import type { Lugar, MesaTreino } from "./use-mesa-treino";

const NAIPES: Naipe[] = ["espadas", "copas", "ouros", "paus"];
const VALORES: Valor[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export function paraVisual(carta: CartaMotor): CartaVisual {
  return { valor: VALORES[valorDe(carta) - 2]!, naipe: NAIPES[naipeDe(carta)]! };
}

/**
 * Ângulos dos lugares (0° = direita, 90° = embaixo), ajustados à mão para cada tamanho de mesa,
 * em sentido horário a partir de você (embaixo): é a ordem real de ação.
 */
const ANGULOS: Record<number, number[]> = {
  2: [90, 270],
  3: [90, 210, 330],
  4: [90, 180, 270, 0],
  5: [90, 162, 234, 306, 18],
  6: [90, 150, 210, 270, 330, 30],
  7: [90, 141, 193, 245, 295, 347, 39],
  8: [90, 135, 180, 225, 270, 315, 0, 45],
  9: [90, 130, 170, 210, 250, 290, 330, 10, 50],
};

const FASES: Record<VisaoMao["fase"], string> = {
  preflop: "Pré-flop",
  flop: "Flop",
  turn: "Turn",
  river: "River",
  encerrada: "Fim da mão",
};

type Ponto = { x: number; y: number };

function useMedida() {
  const ref = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setMedida({ w: entrada.contentRect.width, h: entrada.contentRect.height });
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return { ref, ...medida };
}

/** Geometria da mesa calculada a partir do espaço disponível (px). */
function geometria(w: number, h: number) {
  const horizontal = w / Math.max(h, 1) >= 1.15;
  const proporcao = horizontal ? 2.05 : 0.68;
  const largura = Math.max(10, Math.min(w * (horizontal ? 0.8 : 0.72), h * 0.72 * proporcao));
  const altura = largura / proporcao;
  const u = Math.min(largura, altura) / (horizontal ? 100 : 72); // unidade de escala
  const centro = { x: w / 2, y: h * (horizontal ? 0.47 : 0.46) };
  const naElipse = (angulo: number, fx: number, fy: number, extra = 0): Ponto => {
    const r = (angulo * Math.PI) / 180;
    return {
      x: centro.x + (largura / 2) * fx * Math.cos(r) + extra * Math.cos(r),
      y: centro.y + (altura / 2) * fy * Math.sin(r) + extra * Math.sin(r),
    };
  };
  return { horizontal, largura, altura, u, centro, naElipse };
}

const px = (p: Ponto): CSSProperties => ({ left: p.x, top: p.y });

interface Voo {
  id: number;
  de: Ponto;
  para: Ponto;
  valor: number;
}

export function MesaJogo({ mesa }: { mesa: MesaTreino }) {
  const { ref, w, h } = useMedida();
  const { visao, lugares, cartasVisiveis, pensando } = mesa;
  const g = geometria(w, h);
  const u = g.u;

  const total = visao?.jogadores.length ?? 0;
  const indiceVoce = mesa.indiceVoce;
  const boardPronto = !!visao && cartasVisiveis >= visao.board.length;
  const resultado = visao?.fase === "encerrada" && boardPronto ? visao.resultado : null;
  const angulos = ANGULOS[total] ?? ANGULOS[9]!;

  const ordem = (indice: number) => (indice - (indiceVoce >= 0 ? indiceVoce : 0) + total) % total;
  const anguloDe = (indice: number) => angulos[ordem(indice)] ?? 90;
  const ehVoce = (indice: number) => indice === indiceVoce;

  const posAssento = (i: number) => g.naElipse(anguloDe(i), 1, 1, ehVoce(i) ? u * 4 : u * 2);
  const posAposta = (i: number): Ponto => {
    if (ehVoce(i)) return { x: g.centro.x - u * 24, y: g.centro.y + u * 27 };
    return g.naElipse(anguloDe(i), 0.64, 0.58);
  };
  const posPote: Ponto = { x: g.centro.x, y: g.centro.y - u * 17 };

  // Fichas voando: fim de rua (apostas -> pote) e fim da mão (pote -> quem ganhou).
  const [voos, setVoos] = useState<Voo[]>([]);
  const anterior = useRef<VisaoMao | null>(null);
  const potePago = useRef(0);
  const contador = useRef(0);
  const geoRef = useRef({ posAposta, posAssento, posPote });
  useEffect(() => {
    geoRef.current = { posAposta, posAssento, posPote };
  });

  useEffect(() => {
    const antes = anterior.current;
    anterior.current = visao;
    if (!antes || !visao || antes.numero !== visao.numero || antes.fase === visao.fase) return;
    const novos = antes.jogadores
      .filter((j) => j.apostaRodada > 0)
      .map((j) => ({
        id: contador.current++,
        de: geoRef.current.posAposta(j.indice),
        para: geoRef.current.posPote,
        valor: j.apostaRodada,
      }));
    if (!novos.length) return;
    setVoos((v) => [...v, ...novos]);
    const id = window.setTimeout(() => setVoos((v) => v.filter((x) => !novos.includes(x))), 700);
    return () => window.clearTimeout(id);
  }, [visao]);

  useEffect(() => {
    if (!resultado || !visao || potePago.current === visao.numero) return;
    potePago.current = visao.numero;
    const novos = resultado.ganhos.flatMap((ganho, i) =>
      ganho > 0
        ? [
            {
              id: contador.current++,
              de: geoRef.current.posPote,
              para: geoRef.current.posAssento(i),
              valor: ganho,
            },
          ]
        : [],
    );
    setVoos((v) => [...v, ...novos]);
    const id = window.setTimeout(() => setVoos((v) => v.filter((x) => !novos.includes(x))), 900);
    return () => window.clearTimeout(id);
  }, [resultado, visao]);

  const maoVencedora = resultado?.potes[0]
    ? resultado.maos.find((m) => m.indice === resultado.potes[0]!.ganhadores[0])
    : undefined;
  const vencedoras = new Set(maoVencedora?.melhoresCinco ?? []);
  const cartaBoard = Math.min(u * 13.5, 96);

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_70%_60%_at_50%_42%,#123a2a_0%,#0a1f17_45%,var(--color-sala)_100%)]"
    >
      {w > 0 && (
        <>
          {/* Sombra da mesa no chão */}
          <div
            aria-hidden
            className="absolute rounded-[50%] bg-black/60 blur-2xl"
            style={{
              left: g.centro.x - g.largura * 0.52,
              top: g.centro.y - g.altura * 0.42,
              width: g.largura * 1.04,
              height: g.altura * 1.04,
            }}
          />

          {/* Borda acolchoada + feltro */}
          <div
            aria-hidden
            className="absolute rounded-[50%]"
            style={{
              left: g.centro.x - g.largura / 2,
              top: g.centro.y - g.altura / 2,
              width: g.largura,
              height: g.altura,
              padding: u * 3.2,
              background: "linear-gradient(180deg, #3b2a1e 0%, #22170f 45%, #120c08 100%)",
              boxShadow: `inset 0 ${u * 0.5}px ${u * 0.8}px rgba(255,255,255,0.12), inset 0 -${u * 0.8}px ${u * 1.2}px rgba(0,0,0,0.6), 0 ${u * 2}px ${u * 4}px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              className="textura-feltro relative h-full w-full rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse 65% 60% at 50% 38%, #217a52 0%, #145a3c 45%, #0b3524 100%)",
                boxShadow: `inset 0 0 ${u * 5}px rgba(0,0,0,0.65), 0 0 0 ${u * 0.4}px #0a0705`,
              }}
            >
              {/* Linha de apostas impressa no feltro e a marca da casa */}
              <div className="absolute inset-[13%_11%] rounded-[50%] border border-ouro-300/15" />
              <span
                className="absolute top-[76%] left-1/2 -translate-x-1/2 font-display leading-none whitespace-nowrap text-black/25 italic"
                style={{ fontSize: u * 3.4 }}
              >
                Poker entre Amigos
              </span>
            </div>
          </div>

          {visao ? (
            <>
              {/* Fase + pote */}
              <div
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={px(posPote)}
              >
                <span
                  className="rotulo text-ouro-200/70"
                  style={{ fontSize: Math.max(10, u * 1.9) }}
                >
                  {FASES[visao.fase]}
                </span>
                {!resultado && visao.pote > 0 && (
                  <span
                    className="mt-[0.3em] flex items-center gap-[0.5em] rounded-full border border-white/10 bg-black/55 py-[0.25em] pr-[0.9em] pl-[0.4em] font-mono font-semibold text-creme-50 tabular-nums"
                    style={{ fontSize: Math.max(12, u * 2.6) }}
                  >
                    <PilhaFichas valor={visao.pote} tamanho={Math.max(10, u * 2.2)} />
                    {formatarFichas(visao.pote)}
                  </span>
                )}
              </div>

              {/* Board */}
              <div
                className="absolute flex -translate-x-1/2 -translate-y-1/2"
                style={{ ...px(g.centro), gap: u * 1.1 }}
                aria-label="Cartas comunitárias"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const carta = i < cartasVisiveis ? visao.board[i] : undefined;
                  return carta !== undefined ? (
                    <Carta
                      key={`${visao.numero}-${carta}`}
                      carta={paraVisual(carta)}
                      largura={`${cartaBoard}px`}
                      virar
                      atraso={(i < 3 ? i : 0) * 110}
                      apagada={!!resultado?.showdown && !vencedoras.has(carta)}
                      destaque={!!resultado?.showdown && vencedoras.has(carta)}
                    />
                  ) : (
                    <span
                      key={i}
                      className="rounded-[0.16em] border border-white/[0.07] bg-black/10"
                      style={{
                        width: cartaBoard,
                        aspectRatio: "5 / 7",
                        fontSize: cartaBoard * 0.3,
                      }}
                    />
                  );
                })}
              </div>

              {/* Resultado */}
              {resultado && (
                <div
                  role="status"
                  className="animar-mensagem absolute -translate-x-1/2 -translate-y-1/2 rounded-[6px] border border-ouro-300/30 bg-black/70 text-center"
                  style={{
                    left: g.centro.x,
                    top: g.centro.y + u * (g.horizontal ? 17 : 19),
                    padding: `${u * 0.8}px ${u * 2.4}px`,
                  }}
                >
                  {resultado.potes.map((p, i) => {
                    const mostrada = resultado.maos.find((m) => m.indice === p.ganhadores[0]);
                    return (
                      <p
                        key={i}
                        className="leading-snug whitespace-nowrap text-creme-50"
                        style={{ fontSize: Math.max(12, u * 2.4) }}
                      >
                        <strong className="font-semibold text-ouro-200">
                          {p.ganhadores
                            .map((gi) => (gi === indiceVoce ? "Você" : visao.jogadores[gi]!.nome))
                            .join(" e ")}
                        </strong>{" "}
                        {p.ganhadores.length > 1
                          ? "dividem"
                          : p.ganhadores[0] === indiceVoce
                            ? "leva"
                            : "leva"}{" "}
                        {formatarFichas(p.valor)}
                        {mostrada && (
                          <span className="text-creme-300"> · {mostrada.descricao}</span>
                        )}
                        {i > 0 && <span className="text-creme-500"> (pote lateral)</span>}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Apostas da rodada */}
              {visao.jogadores.map((j) =>
                j.apostaRodada > 0 && !resultado ? (
                  <div
                    key={`aposta-${j.id}`}
                    className="animar-surgir absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.4em]"
                    style={{ ...px(posAposta(j.indice)), fontSize: Math.max(11, u * 2.1) }}
                  >
                    <PilhaFichas valor={j.apostaRodada} tamanho={Math.max(10, u * 2.6)} />
                    <span className="rounded-full bg-black/60 px-[0.55em] py-[0.05em] font-mono font-semibold text-creme-50 tabular-nums">
                      {formatarFichas(j.apostaRodada)}
                    </span>
                  </div>
                ) : null,
              )}

              {/* Botão do dealer */}
              <span
                className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#c9c2ad] bg-[linear-gradient(#ffffff,#e7e1d2)] font-sans font-black text-tinta shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-[left,top] duration-700 ease-(--ease-saida)"
                style={{
                  ...px(
                    ehVoce(visao.botao)
                      ? { x: g.centro.x + u * 21, y: g.centro.y + u * 33 }
                      : g.naElipse(anguloDe(visao.botao) + 14, 0.8, 0.74),
                  ),
                  width: Math.max(18, u * 3.6),
                  height: Math.max(18, u * 3.6),
                  fontSize: Math.max(10, u * 1.8),
                }}
                title="Botão (dealer)"
              >
                D
              </span>

              {/* Jogadores */}
              {visao.jogadores.map((j) => (
                <Assento
                  key={j.id}
                  jogador={j}
                  lugar={lugares.find((l) => l.id === j.id)}
                  posicao={posAssento(j.indice)}
                  voce={ehVoce(j.indice)}
                  u={u}
                  naVez={visao.vez === j.indice && !resultado}
                  pensando={pensando === j.indice}
                  blind={
                    j.indice === visao.smallBlind ? "SB" : j.indice === visao.bigBlind ? "BB" : null
                  }
                  ganho={resultado ? resultado.ganhos[j.indice]! : 0}
                  encerrada={!!resultado}
                  numeroMao={visao.numero}
                  ordemDistribuicao={ordem(j.indice)}
                  centro={g.centro}
                  cartaVoce={Math.min(u * 13.5, 100)}
                  cartaOponente={Math.min(u * 6, 44)}
                  posCartasVoce={{ x: g.centro.x, y: g.centro.y + u * (g.horizontal ? 30 : 37) }}
                />
              ))}

              {/* Fichas em movimento */}
              {voos.map((v) => (
                <span
                  key={v.id}
                  aria-hidden
                  className="voo-fichas pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                  style={
                    {
                      ...px(v.de),
                      "--dx": `${v.para.x - v.de.x}px`,
                      "--dy": `${v.para.y - v.de.y}px`,
                    } as CSSProperties
                  }
                >
                  <PilhaFichas valor={v.valor} tamanho={Math.max(10, u * 2.6)} />
                </span>
              ))}
            </>
          ) : (
            <p
              className="absolute -translate-x-1/2 -translate-y-1/2 font-display text-creme-100"
              style={{ ...px(g.centro), fontSize: Math.max(16, u * 3) }}
            >
              Embaralhando…
            </p>
          )}
        </>
      )}
    </div>
  );
}

interface PropsAssento {
  jogador: VisaoMao["jogadores"][number];
  lugar: Lugar | undefined;
  posicao: Ponto;
  voce: boolean;
  u: number;
  naVez: boolean;
  pensando: boolean;
  blind: "SB" | "BB" | null;
  ganho: number;
  encerrada: boolean;
  numeroMao: number;
  ordemDistribuicao: number;
  centro: Ponto;
  cartaVoce: number;
  cartaOponente: number;
  posCartasVoce: Ponto;
}

/** Um lugar na mesa: cartas, avatar e plaquinha com nome, fichas e estado. */
function Assento({
  jogador: j,
  lugar,
  posicao,
  voce,
  u,
  naVez,
  pensando,
  blind,
  ganho,
  encerrada,
  numeroMao,
  ordemDistribuicao,
  centro,
  cartaVoce,
  cartaOponente,
  posCartasVoce,
}: PropsAssento) {
  const avatar = Math.max(40, u * 13);
  const fonteNome = Math.max(11, u * 2.3);
  const fonteFichas = Math.max(11, u * 2.2);
  // Cartas fechadas dos oponentes ficam entre o avatar e o centro da mesa.
  const dirX = centro.x - posicao.x;
  const dirY = centro.y - posicao.y;
  const dist = Math.hypot(dirX, dirY) || 1;
  const cartasOponente = {
    x: posicao.x + (dirX / dist) * avatar * 0.85,
    y: posicao.y + (dirY / dist) * avatar * 0.85,
  };

  const acao = j.ultimaAcao && !encerrada ? j.ultimaAcao : null;
  const corAcao =
    acao?.tipo === "desistir"
      ? "bg-[#2a2f2c] text-creme-300"
      : acao && (acao.allIn || acao.tipo === "aumentar" || acao.tipo === "apostar")
        ? "bg-naipe-vermelho text-creme-50"
        : "bg-creme-100 text-tinta";

  return (
    <>
      {/* Cartas */}
      {!j.desistiu &&
        (voce ? (
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2"
            style={{ ...px(posCartasVoce), gap: u * 0.8, zIndex: 7 }}
          >
            {j.cartas?.map((c, k) => (
              <Carta
                key={`${numeroMao}-${c}`}
                carta={paraVisual(c)}
                largura={`${cartaVoce}px`}
                virar
                atraso={250 + k * 140}
                style={{ rotate: `${k === 0 ? -4 : 4}deg` }}
              />
            ))}
          </div>
        ) : (
          <div
            className="absolute flex -translate-x-1/2 -translate-y-1/2"
            style={px(cartasOponente)}
          >
            {j.cartas
              ? j.cartas.map((c, k) => (
                  <Carta
                    key={`${numeroMao}-${c}`}
                    carta={paraVisual(c)}
                    largura={`${cartaOponente * 1.25}px`}
                    virar
                    atraso={k * 120}
                    style={{
                      rotate: `${k === 0 ? -6 : 6}deg`,
                      marginLeft: k ? -cartaOponente * 0.3 : 0,
                    }}
                  />
                ))
              : [0, 1].map((k) => (
                  <span
                    key={`${numeroMao}-${k}`}
                    className="animar-distribuir inline-block"
                    style={
                      {
                        "--de-x": `${centro.x - cartasOponente.x}px`,
                        "--de-y": `${centro.y - cartasOponente.y}px`,
                        animationDelay: `${k * 160 + ordemDistribuicao * 55}ms`,
                        rotate: `${k === 0 ? -8 : 8}deg`,
                        marginLeft: k ? -cartaOponente * 0.45 : 0,
                      } as CSSProperties
                    }
                  >
                    <VersoCarta largura={`${cartaOponente}px`} />
                  </span>
                ))}
          </div>
        ))}

      {/* Avatar e plaquinha */}
      <div
        className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-[opacity,filter] duration-300 ${
          j.desistiu ? "opacity-50 grayscale-[0.6]" : ""
        }`}
        style={{ ...px(posicao), zIndex: voce ? 6 : 5 }}
      >
        <div className="relative" style={{ width: avatar, height: avatar, fontSize: avatar / 10 }}>
          <div
            className={`size-full overflow-hidden rounded-full border-[0.25em] transition-shadow duration-500 ${
              naVez
                ? "anel-vez border-ouro-300"
                : ganho > 0
                  ? "border-ouro-200"
                  : "border-[#1a1410]"
            }`}
            style={
              ganho > 0
                ? { boxShadow: `0 0 ${u * 4}px ${u * 0.6}px rgba(234,220,180,0.55)` }
                : undefined
            }
          >
            {lugar && <Avatar aparencia={lugar.aparencia} className="size-full scale-110" />}
          </div>
          {ganho > 0 && (
            <span
              className="animar-surgir absolute left-1/2 -translate-x-1/2 rounded-full bg-ouro-300 px-[0.6em] font-mono font-bold whitespace-nowrap text-tinta shadow-lg"
              style={{ top: -fonteFichas * 1.9, fontSize: fonteFichas }}
            >
              +{formatarFichas(ganho)}
            </span>
          )}
        </div>

        <div
          className={`relative -mt-[0.5em] flex flex-col items-center rounded-[0.45em] border px-[0.9em] pt-[0.35em] pb-[0.3em] leading-tight shadow-[0_0.3em_0.8em_rgba(0,0,0,0.55)] ${
            voce ? "border-ouro-400/70 bg-superficie-2" : "border-borda bg-superficie-1/95"
          } ${naVez ? "ring-1 ring-ouro-300/70" : ""}`}
          style={{ fontSize: fonteNome, minWidth: avatar * 1.55 }}
        >
          {blind && (
            <span className="absolute -top-[0.7em] -left-[0.5em] rounded-full border border-white/20 bg-[#20262a] px-[0.4em] font-mono text-[0.62em] font-bold text-creme-100">
              {blind}
            </span>
          )}
          <span className="max-w-[9em] truncate font-semibold text-creme-50">
            {voce ? "Você" : j.nome}
          </span>
          <span className="font-mono text-ouro-200 tabular-nums" style={{ fontSize: fonteFichas }}>
            {j.allIn && !encerrada ? "ALL-IN" : formatarFichas(j.fichas)}
          </span>
          {lugar?.nivel && u >= 4.2 && (
            <span className="font-mono text-[0.58em] tracking-[0.14em] text-creme-500 uppercase">
              {NIVEIS[lugar.nivel].nome}
            </span>
          )}
          {(acao || pensando || (j.desistiu && !encerrada)) && (
            <span
              key={acao ? `${acao.tipo}-${acao.valor}` : pensando ? "pensando" : "fora"}
              className={`animar-surgir absolute top-full left-1/2 mt-[0.35em] -translate-x-1/2 rounded-[0.3em] px-[0.6em] py-[0.05em] font-mono text-[0.66em] font-semibold whitespace-nowrap uppercase shadow ${
                pensando ? "bg-creme-100 text-tinta" : corAcao
              }`}
            >
              {pensando ? (
                <span className="animate-pulse">pensando…</span>
              ) : acao ? (
                rotuloAcao(acao.tipo, acao.valor, acao.allIn)
              ) : (
                "Desistiu"
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
