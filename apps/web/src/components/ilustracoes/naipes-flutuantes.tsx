import type { CSSProperties } from "react";

/**
 * Naipes que sobem devagar ao fundo de uma seção. As posições são fixas
 * (não aleatórias) para o HTML do servidor e do cliente serem idênticos.
 */
const naipes = [
  { s: "♠", x: 6, tam: 2.2, dur: 22, atraso: -3, giro: 140, op: 0.25 },
  { s: "♥", x: 16, tam: 1.4, dur: 17, atraso: -11, giro: -120, op: 0.35, vermelho: true },
  { s: "♦", x: 29, tam: 2.8, dur: 26, atraso: -7, giro: 200, op: 0.18, vermelho: true },
  { s: "♣", x: 41, tam: 1.6, dur: 19, atraso: -15, giro: -160, op: 0.3 },
  { s: "♠", x: 55, tam: 3.2, dur: 28, atraso: -2, giro: 90, op: 0.14 },
  { s: "♥", x: 66, tam: 1.8, dur: 21, atraso: -9, giro: 180, op: 0.28, vermelho: true },
  { s: "♣", x: 78, tam: 2.4, dur: 24, atraso: -18, giro: -100, op: 0.2 },
  { s: "♦", x: 88, tam: 1.5, dur: 18, atraso: -5, giro: 150, op: 0.32, vermelho: true },
  { s: "♠", x: 95, tam: 2, dur: 23, atraso: -13, giro: -190, op: 0.22 },
];

export function NaipesFlutuantes({
  className,
  subida = "760px",
}: {
  className?: string;
  subida?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {naipes.map((n, i) => (
        <span
          key={i}
          className={`absolute -bottom-16 font-display leading-none ${n.vermelho ? "text-naipe-vermelho" : "text-ouro-300"}`}
          style={
            {
              left: `${n.x}%`,
              fontSize: `${n.tam}rem`,
              animation: `subir-naipe ${n.dur}s linear ${n.atraso}s infinite`,
              "--giro": `${n.giro}deg`,
              "--subida": subida,
              "--opacidade": n.op,
            } as CSSProperties
          }
        >
          {n.s}
        </span>
      ))}
    </div>
  );
}
