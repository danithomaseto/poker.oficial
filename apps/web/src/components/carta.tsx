import type { CSSProperties } from "react";
import { naipes, nomeCarta, type CartaVisual } from "./baralho";

type Props = {
  carta: CartaVisual;
  /** Largura em qualquer unidade CSS; a altura segue a proporção 5:7. */
  largura?: string;
  /** Mostra o verso e vira para a frente com animação. */
  virar?: boolean;
  /** Atraso da animação de virar, em ms. */
  atraso?: number;
  /** Deixa a carta apagada (ex.: kicker que não conta no ranking). */
  apagada?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Carta de baralho desenhada só com HTML e CSS.
 * A animação de virar usa 3D (rotateY) com as duas faces sobrepostas.
 */
export function Carta({
  carta,
  largura = "4rem",
  virar,
  atraso = 0,
  apagada,
  className,
  style,
}: Props) {
  const naipe = naipes[carta.naipe];
  const cor = naipe.vermelho ? "text-naipe-vermelho" : "text-mesa-950";

  return (
    <span
      role="img"
      aria-label={nomeCarta(carta)}
      className={`relative inline-block shrink-0 perspective-[600px] transition-opacity duration-300 ${apagada ? "opacity-35" : ""} ${className ?? ""}`}
      style={{
        width: largura,
        aspectRatio: "5 / 7",
        fontSize: `calc(${largura} * 0.28)`,
        ...style,
      }}
    >
      <span
        className={`absolute inset-0 transform-3d ${virar ? "animar-virar" : ""}`}
        style={{ animationDelay: `${atraso}ms` }}
      >
        {/* Frente */}
        <span
          className={`absolute inset-0 flex flex-col justify-between rounded-[0.18em] bg-creme-50 p-[0.16em] shadow-[0_0.25em_0.6em_rgba(0,0,0,0.35)] backface-hidden ${cor}`}
        >
          <span className="flex flex-col items-start font-display leading-[0.9] font-semibold">
            <span>{carta.valor}</span>
            <span className="text-[0.8em]">{naipe.simbolo}</span>
          </span>
          <span className="absolute inset-0 grid place-items-center text-[1.9em] leading-none">
            {naipe.simbolo}
          </span>
          <span className="flex rotate-180 flex-col items-start font-display leading-[0.9] font-semibold">
            <span>{carta.valor}</span>
            <span className="text-[0.8em]">{naipe.simbolo}</span>
          </span>
        </span>
        {/* Verso */}
        <span className="verso-carta absolute inset-0 rotate-y-180 rounded-[0.18em] backface-hidden" />
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
      className={`verso-carta inline-block shrink-0 rounded-[0.18em] ${className ?? ""}`}
      style={{ width: largura, aspectRatio: "5 / 7", ...style }}
    />
  );
}
