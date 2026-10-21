import type { CSSProperties } from "react";
import { c, type CartaVisual } from "../baralho";
import { Carta, VersoCarta } from "../carta";
import { Avatar, type AparenciaDemo } from "./avatar";

/**
 * Mesa de poker ilustrada do topo da página, com a sequência de uma mão animada:
 * jogadores sentam, cartas são distribuídas, o flop vira, o turn vira, as fichas vão
 * para o pote e chega a sua vez. Tudo em CSS, sem JavaScript no cliente.
 *
 * As medidas usam `cqw` (porcentagem da largura do contêiner) para a mesa
 * escalar do celular ao desktop sem recalcular nada.
 */

type Assento = {
  /** Posição do centro do assento, em % do contêiner. */
  x: number;
  y: number;
  nome?: string;
  fichas?: string;
  aposta?: string;
  desistiu?: boolean;
  voce?: boolean;
  dealer?: boolean;
  aparencia?: AparenciaDemo;
};

const CENTRO = { x: 50, y: 49 };

const assentos: Assento[] = [
  {
    x: 50,
    y: 86.5,
    nome: "Você",
    fichas: "4.820",
    voce: true,
    aparencia: {
      pele: "#d39a6a",
      cabelo: { estilo: "curto", cor: "#1d1410" },
      roupa: "#c99a3b",
      acessorio: "nenhum",
      fundo: "#145236",
    },
  },
  {
    x: 22,
    y: 78,
    nome: "Bia",
    fichas: "3.150",
    aposta: "300",
    aparencia: {
      pele: "#7c4a2d",
      cabelo: { estilo: "longo", cor: "#1d1410" },
      roupa: "#6d4bd8",
      acessorio: "brinco",
      fundo: "#22193a",
    },
  },
  {
    x: 7.5,
    y: 55.5,
    nome: "Caio",
    fichas: "6.900",
    desistiu: true,
    aparencia: {
      pele: "#f6d3b3",
      cabelo: { estilo: "curto", cor: "#b5651d" },
      roupa: "#2f7dd1",
      acessorio: "nenhum",
      fundo: "#1d2b3a",
    },
  },
  { x: 12.5, y: 30 },
  {
    x: 35,
    y: 13.5,
    nome: "Duda",
    fichas: "2.480",
    aposta: "300",
    aparencia: {
      pele: "#a8724d",
      cabelo: { estilo: "coque", cor: "#3b2219" },
      roupa: "#d14b6a",
      acessorio: "nenhum",
      fundo: "#3a1f2b",
    },
  },
  {
    x: 65,
    y: 13.5,
    nome: "Léo",
    fichas: "9.300",
    aposta: "300",
    dealer: true,
    aparencia: {
      pele: "#eab98f",
      cabelo: { estilo: "curto", cor: "#e8c27a" },
      roupa: "#1f9d74",
      acessorio: "bone",
      fundo: "#0f3d2a",
    },
  },
  {
    x: 87.5,
    y: 30,
    nome: "Mari",
    fichas: "5.050",
    desistiu: true,
    aparencia: {
      pele: "#d39a6a",
      cabelo: { estilo: "longo", cor: "#6b3e22" },
      roupa: "#e07b2d",
      acessorio: "oculos",
      fundo: "#2d2a1a",
    },
  },
  { x: 92.5, y: 55.5 },
  {
    x: 78,
    y: 78,
    nome: "Teo",
    fichas: "3.700",
    aposta: "300",
    aparencia: {
      pele: "#56331f",
      cabelo: { estilo: "careca", cor: "#1d1410" },
      roupa: "#3a4048",
      acessorio: "oculos",
      fundo: "#1d2b3a",
    },
  },
];

const board: CartaVisual[] = [c("A", "espadas"), c("K", "ouros"), c("7", "copas"), c("2", "paus")];
const suasCartas: CartaVisual[] = [c("K", "espadas"), c("K", "paus")];

/** Ponto entre o assento e o centro da mesa (0 = assento, 1 = centro). */
function emDirecaoAoCentro(assento: Assento, fracao: number) {
  return {
    x: assento.x + (CENTRO.x - assento.x) * fracao,
    y: assento.y + (CENTRO.y - assento.y) * fracao,
  };
}

const POTE = { x: 50, y: 31 };

/**
 * Deslocamento (em cqw) do ponto até um alvo, usado para "lançar" cartas do centro
 * e levar as fichas até o pote. Variáveis CSS lidas pelas animações em globals.css.
 */
function deslocamentoAte(ponto: { x: number; y: number }, alvo = CENTRO): CSSProperties {
  // A altura do contêiner é 12/19 da largura, então 1% da altura = 0.6316cqw.
  return {
    "--de-x": `${(alvo.x - ponto.x).toFixed(2)}cqw`,
    "--de-y": `${((alvo.y - ponto.y) * (12 / 19)).toFixed(2)}cqw`,
  } as CSSProperties;
}

function posicao(ponto: { x: number; y: number }): CSSProperties {
  return { left: `${ponto.x}%`, top: `${ponto.y}%` };
}

export function MesaAnimada() {
  const ocupados = assentos.filter((a) => a.nome);

  return (
    <div className="relative mx-auto aspect-[19/12] w-full max-w-[min(1240px,calc((100dvh-6rem)*19/12))] @container select-none">
      <p className="sr-only">
        Ilustração de uma mesa de Texas Hold&apos;em com nove lugares, sete jogadores, cartas
        comunitárias Ás de espadas, Rei de ouros, Sete de copas e Dois de paus, e a sua vez de agir
        com um par de reis.
      </p>

      <div aria-hidden className="absolute inset-0">
        {/* Sombra e brilho ao redor da mesa */}
        <div className="absolute top-[18%] left-[10%] h-[70%] w-[80%] rounded-[50%] bg-black/60 blur-[4cqw]" />

        {/* Borda de madeira */}
        <div className="absolute top-[13.6%] left-[7.9%] h-[70.8%] w-[84.2%] rounded-[50%] bg-[linear-gradient(160deg,#8a5a33,#4a2c18_55%,#2b190d)] p-[2.6cqw] shadow-[inset_0_0.4cqw_0.6cqw_rgba(255,255,255,0.18),inset_0_-0.6cqw_1cqw_rgba(0,0,0,0.5)]">
          {/* Feltro */}
          <div className="textura-feltro relative h-full w-full rounded-[50%] bg-[radial-gradient(ellipse_at_50%_40%,#1f7a50,#0f3d2a_60%,#0a2a1c)] shadow-[inset_0_0_3cqw_rgba(0,0,0,0.6)]">
            <div className="absolute inset-[9%] rounded-[50%] border border-ouro-400/20" />
            <span className="absolute top-[64%] left-1/2 -translate-x-1/2 font-display text-[1.6cqw] tracking-[0.4em] text-ouro-300/25 uppercase">
              Mesa da turma
            </span>
          </div>
        </div>

        {/* Pote */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[0.4cqw]"
          style={posicao(POTE)}
        >
          <div
            className="animar-surgir flex items-end gap-[0.3cqw]"
            style={{ animationDelay: "3.9s" }}
          >
            <PilhaFichas cor="#c8413f" quantidade={3} />
            <PilhaFichas cor="#2f7dd1" quantidade={4} />
            <PilhaFichas cor="#f3ecd8" quantidade={2} />
          </div>
          <span
            className="animar-surgir rounded-full bg-black/45 px-[1cqw] py-[0.2cqw] text-[1.45cqw] font-semibold text-ouro-200 tabular-nums"
            style={{ animationDelay: "3.9s" }}
          >
            Pote 1.950
          </span>
        </div>

        {/* Cartas comunitárias: flop (3), turn (1) e o espaço vazio do river */}
        <div
          className="absolute flex -translate-x-1/2 -translate-y-1/2 gap-[0.9cqw]"
          style={posicao({ x: 50, y: 48 })}
        >
          {board.map((carta, i) => (
            <Carta
              key={`${carta.valor}${carta.naipe}`}
              carta={carta}
              largura="5.6cqw"
              virar
              atraso={i < 3 ? 2300 + i * 180 : 3300}
              className="animar-surgir"
              style={{ animationDelay: `${i < 3 ? 2100 : 3150}ms` }}
            />
          ))}
          <span
            className="w-[5.6cqw] rounded-[1cqw] border border-dashed border-ouro-300/30"
            style={{ aspectRatio: "5 / 7" }}
          />
        </div>

        {/* Apostas na frente de cada jogador; viram pote depois do turn */}
        {ocupados
          .filter((a) => a.aposta)
          .map((a) => {
            const ponto = emDirecaoAoCentro(a, 0.5);
            return (
              <div
                key={`aposta-${a.nome}`}
                className="animar-fichas-pote absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-[0.4cqw]"
                style={{
                  ...posicao(ponto),
                  ...deslocamentoAte(ponto, POTE),
                  animationDelay: "1.6s, 3.6s",
                }}
              >
                <PilhaFichas cor="#c8413f" quantidade={2} />
                <span className="text-[1.3cqw] font-semibold text-creme-100 tabular-nums">
                  {a.aposta}
                </span>
              </div>
            );
          })}

        {/* Cartas fechadas dos outros jogadores, lançadas do centro */}
        {ocupados
          .filter((a) => !a.voce && !a.desistiu)
          .map((a, i) => {
            const ponto = emDirecaoAoCentro(a, 0.3);
            return (
              <div
                key={`cartas-${a.nome}`}
                className="absolute flex -translate-x-1/2 -translate-y-1/2"
                style={posicao(ponto)}
              >
                {[0, 1].map((n) => (
                  <span
                    key={n}
                    className="animar-distribuir -mx-[0.3cqw] inline-block"
                    style={{
                      ...deslocamentoAte(ponto),
                      animationDelay: `${700 + n * 450 + i * 70}ms`,
                      rotate: n === 0 ? "-8deg" : "8deg",
                    }}
                  >
                    <VersoCarta largura="2.6cqw" />
                  </span>
                ))}
              </div>
            );
          })}

        {/* Suas cartas, maiores e viradas para cima */}
        {(() => {
          const voce = assentos[0]!;
          const ponto = emDirecaoAoCentro(voce, 0.32);
          return (
            <div
              className="absolute flex -translate-x-1/2 -translate-y-1/2 gap-[0.4cqw]"
              style={posicao(ponto)}
            >
              {suasCartas.map((carta, n) => (
                <span
                  key={carta.naipe}
                  className="animar-distribuir inline-block"
                  style={{
                    ...deslocamentoAte(ponto),
                    animationDelay: `${700 + n * 450}ms`,
                    rotate: n === 0 ? "-6deg" : "6deg",
                  }}
                >
                  <Carta carta={carta} largura="4.6cqw" virar atraso={1700 + n * 120} />
                </span>
              ))}
            </div>
          );
        })()}

        {/* Assentos */}
        {assentos.map((a, i) => (
          <AssentoMesa key={i} assento={a} ordem={i} />
        ))}

        {/* Balão de chat */}
        <div
          className="animar-balao absolute rounded-[1.2cqw] rounded-bl-none bg-creme-50 px-[1.2cqw] py-[0.6cqw] text-[1.4cqw] font-medium whitespace-nowrap text-mesa-950 shadow-lg"
          style={{ left: "26%", top: "58%", animationDelay: "4.6s" }}
        >
          vai pagar ou vai correr? 😏
        </div>
      </div>
    </div>
  );
}

function AssentoMesa({ assento, ordem }: { assento: Assento; ordem: number }) {
  const { nome, fichas, aparencia, voce, desistiu, dealer } = assento;
  const plaquinhaEmCima = assento.y < 20;

  if (!nome || !aparencia) {
    return (
      <div
        className="animar-surgir absolute grid size-[7.2cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[0.25cqw] border-dashed border-ouro-300/35 bg-mesa-950/50 text-[1.3cqw] font-medium text-creme-300/70"
        style={{ ...posicao(assento), animationDelay: `${ordem * 60}ms` }}
      >
        Livre
      </div>
    );
  }

  return (
    <div
      className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center ${plaquinhaEmCima ? "flex-col-reverse" : ""}`}
      style={posicao(assento)}
    >
      <div
        className={`animar-surgir relative size-[7.4cqw] ${desistiu ? "opacity-55 saturate-50" : ""}`}
        style={{ animationDelay: `${ordem * 60}ms` }}
      >
        {voce && <span className="anel-tempo absolute -inset-[0.7cqw] rounded-full" />}
        <div
          className="animar-respirar size-full rounded-full ring-[0.3cqw] ring-ouro-400/80"
          style={{ animationDelay: `${ordem * -0.7}s` }}
        >
          <Avatar aparencia={aparencia} className="size-full" />
        </div>
        {dealer && (
          <span className="absolute -right-[1.4cqw] bottom-0 grid size-[2.6cqw] place-items-center rounded-full bg-creme-50 text-[1.3cqw] font-bold text-mesa-950 shadow-md">
            D
          </span>
        )}
      </div>
      <div
        className={`animar-surgir relative z-10 flex min-w-[10cqw] flex-col items-center rounded-[0.9cqw] border px-[0.9cqw] py-[0.3cqw] leading-tight shadow-lg ${
          voce
            ? "border-ouro-300 bg-ouro-400 text-mesa-950"
            : "border-white/10 bg-mesa-950/90 text-creme-100"
        } ${plaquinhaEmCima ? "mb-[0.6cqw]" : "-mt-[0.8cqw]"}`}
        style={{ animationDelay: `${ordem * 60 + 150}ms` }}
      >
        <span className="text-[1.35cqw] font-semibold">{nome}</span>
        <span className={`text-[1.2cqw] tabular-nums ${voce ? "text-mesa-900" : "text-ouro-300"}`}>
          {desistiu ? "desistiu" : fichas}
        </span>
      </div>
      {voce && (
        <span
          className="animar-surgir absolute top-full mt-[0.6cqw] rounded-full bg-naipe-vermelho px-[1cqw] py-[0.15cqw] text-[1.2cqw] font-bold tracking-wide text-creme-50 uppercase"
          style={{ animationDelay: "4.9s" }}
        >
          Sua vez
        </span>
      )}
    </div>
  );
}

function PilhaFichas({ cor, quantidade }: { cor: string; quantidade: number }) {
  return (
    <span className="flex flex-col-reverse">
      {Array.from({ length: quantidade }, (_, i) => (
        <span
          key={i}
          className="-mt-[0.9cqw] block h-[1.3cqw] w-[2.4cqw] rounded-[50%] border-[0.18cqw] border-dashed border-white/80 shadow-[0_0.15cqw_0_rgba(0,0,0,0.45)] first:mt-0"
          style={{ backgroundColor: cor }}
        />
      ))}
    </span>
  );
}
