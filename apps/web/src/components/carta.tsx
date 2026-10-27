import type { CSSProperties } from "react";
import { naipes, nomeCarta, type CartaVisual } from "./baralho";

type Props = {
  carta: CartaVisual;
  /** Largura em qualquer unidade CSS; a altura segue a proporção 5:7 (63 × 88 mm). */
  largura?: string;
  /** Mostra o verso e vira para a frente com animação. */
  virar?: boolean;
  /** Atraso da animação de virar, em ms. */
  atraso?: number;
  /** Deixa a carta apagada (ex.: kicker que não conta, carta fora da mão vencedora). */
  apagada?: boolean;
  /** Destaca a carta (ex.: parte da mão vencedora). */
  destaque?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Carta de baralho desenhada só com HTML e CSS: índices grandes nos cantos para leitura
 * rápida e o naipe no centro. A animação de virar usa 3D com as duas faces sobrepostas.
 */
export function Carta({
  carta,
  largura = "4rem",
  virar,
  atraso = 0,
  apagada,
  destaque,
  className,
  style,
}: Props) {
  const naipe = naipes[carta.naipe];
  // A cor vem do CSS (--cor-espadas, --cor-copas...), para o baralho de 4 cores valer em tudo.
  const cor = "text-(--cor-naipe)";

  return (
    <span
      role="img"
      aria-label={nomeCarta(carta)}
      className={`relative inline-block shrink-0 perspective-[600px] transition-[opacity,translate,filter] duration-300 ${
        apagada ? "opacity-40 saturate-50" : ""
      } ${destaque ? "-translate-y-[0.18em]" : ""} ${className ?? ""}`}
      style={
        {
          width: largura,
          aspectRatio: "5 / 7",
          fontSize: `calc(${largura} * 0.3)`,
          "--cor-naipe": `var(--cor-${carta.naipe})`,
          ...style,
        } as CSSProperties
      }
    >
      <span
        className={`absolute inset-0 transform-3d ${virar ? "animar-virar" : ""}`}
        style={{ animationDelay: `${atraso}ms` }}
      >
        {/* Frente: fundo, moldura, fonte e cores vêm do tema de baralho (variáveis CSS) */}
        <span
          className={`absolute inset-0 overflow-hidden rounded-[0.16em] backface-hidden ${cor} ${
            naipe.vermelho ? "naipe-com-traco" : ""
          }`}
          style={{
            background: "var(--carta-face)",
            fontFamily: "var(--carta-fonte)",
            boxShadow: destaque
              ? "0 0 0 0.07em #d8bf80, inset 0 0 0 0.1em var(--carta-moldura), 0 0.3em 0.8em rgba(0,0,0,0.5)"
              : "0 0 0 0.03em var(--carta-anel), inset 0 0 0 0.1em var(--carta-moldura), 0 0.2em 0.5em rgba(0,0,0,0.4)",
          }}
        >
          <span className="absolute top-[0.12em] left-[0.14em] flex flex-col items-center leading-[0.95] font-bold">
            <span className="text-[1em] tracking-[-0.06em]">{carta.valor}</span>
            <span className="text-[0.78em]">{naipe.simbolo}</span>
          </span>
          <span className="absolute right-[0.14em] bottom-[0.12em] flex rotate-180 flex-col items-center leading-[0.95] font-bold">
            <span className="text-[1em] tracking-[-0.06em]">{carta.valor}</span>
            <span className="text-[0.78em]">{naipe.simbolo}</span>
          </span>
          <span className="absolute inset-0 grid place-items-center pt-[0.2em] text-[2.1em] leading-none">
            {naipe.simbolo}
          </span>
        </span>
        {/* Verso */}
        <span className="verso-carta absolute inset-0 rotate-y-180 rounded-[0.16em] backface-hidden" />
      </span>
    </span>
  );
}

/** Carta virada para baixo (sem valor), usada para cartas de outros jogadores. */
export function VersoCarta({
  largura = "4rem",
  className,
  style,
}: Pick<Props, "largura" | "className" | "style">) {
  return (
    <span
      aria-hidden
      className={`verso-carta inline-block shrink-0 rounded-[0.16em] ${className ?? ""}`}
      style={{ width: largura, aspectRatio: "5 / 7", fontSize: `calc(${largura} * 0.3)`, ...style }}
    />
  );
}
