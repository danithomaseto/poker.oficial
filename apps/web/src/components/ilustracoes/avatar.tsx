import { useId } from "react";

/**
 * Avatar 2D em camadas (fundo, corpo, cabeça, cabelo, acessório), gerado por código.
 *
 * Serve de ilustração no site público e antecipa a ideia da fase 3: cada camada é
 * independente, então trocar o placeholder por arte real não muda quem usa o componente.
 */
export type EstiloCabelo = "curto" | "longo" | "coque" | "moicano" | "careca";
export type Acessorio = "nenhum" | "oculos" | "bone" | "brinco";

export type AparenciaDemo = {
  pele: string;
  cabelo: { estilo: EstiloCabelo; cor: string };
  roupa: string;
  acessorio: Acessorio;
  fundo: string;
};

type Props = {
  aparencia: AparenciaDemo;
  className?: string;
  /** Texto alternativo; sem ele o avatar é tratado como decorativo. */
  titulo?: string;
};

const TRACO = "#1a120c";

export function Avatar({ aparencia, className, titulo }: Props) {
  const { pele, cabelo, roupa, acessorio, fundo } = aparencia;
  const idClip = `avatar-${useId()}`;

  return (
    <svg
      viewBox="-30 -30 60 60"
      className={className}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      <defs>
        <clipPath id={idClip}>
          <circle r="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idClip})`}>
        <circle r="28" fill={fundo} />
        {/* Cabelo longo fica atrás da cabeça */}
        {cabelo.estilo === "longo" && (
          <rect x="-14.5" y="-14" width="29" height="30" rx="11" fill={cabelo.cor} />
        )}
        {/* Corpo e pescoço */}
        <rect x="-4.5" y="6" width="9" height="9" fill={pele} />
        <path d="M-22 30 C-22 16 -14 12 0 12 C14 12 22 16 22 30 Z" fill={roupa} />
        <path d="M-6 12.5 L0 19 L6 12.5" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.6" />
        {/* Cabeça */}
        <circle cy="-3" r="12" fill={pele} />
        <circle cx="-4.2" cy="-3" r="1.4" fill={TRACO} />
        <circle cx="4.2" cy="-3" r="1.4" fill={TRACO} />
        <path
          d="M-3.6 3 Q0 6 3.6 3"
          fill="none"
          stroke={TRACO}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="-7.5" cy="1.5" r="1.8" fill="#e5737a" opacity="0.35" />
        <circle cx="7.5" cy="1.5" r="1.8" fill="#e5737a" opacity="0.35" />
        {/* Cabelo por cima */}
        {cabelo.estilo === "curto" && (
          <path
            d="M-12.4 -4 C-13 -15 -6 -17.5 0 -17.5 C7 -17.5 13 -15 12.4 -4 C9 -10 3 -11 -1 -10.5 C-5 -10 -9 -8.5 -12.4 -4 Z"
            fill={cabelo.cor}
          />
        )}
        {cabelo.estilo === "longo" && (
          <path
            d="M-12.6 -2 C-13.5 -15 -6 -17.8 0 -17.8 C6 -17.8 13.5 -15 12.6 -2 C11 -9 6 -12 0 -12 C-6 -12 -11 -9 -12.6 -2 Z"
            fill={cabelo.cor}
          />
        )}
        {cabelo.estilo === "coque" && (
          <>
            <circle cy="-18.5" r="5.5" fill={cabelo.cor} />
            <path
              d="M-12.4 -4 C-13 -15 -6 -17 0 -17 C6 -17 13 -15 12.4 -4 C10 -11 5 -12.5 0 -12.5 C-5 -12.5 -10 -11 -12.4 -4 Z"
              fill={cabelo.cor}
            />
          </>
        )}
        {cabelo.estilo === "moicano" && (
          <path d="M-3.5 -10 C-4 -18 -2 -22 0 -23 C2 -22 4 -18 3.5 -10 Z" fill={cabelo.cor} />
        )}
        {/* Acessórios */}
        {acessorio === "oculos" && (
          <g fill="none" stroke={TRACO} strokeWidth="1.2">
            <circle cx="-4.6" cy="-3" r="3.4" fill="rgba(255,255,255,0.18)" />
            <circle cx="4.6" cy="-3" r="3.4" fill="rgba(255,255,255,0.18)" />
            <path d="M-1.2 -3 L1.2 -3" />
          </g>
        )}
        {acessorio === "bone" && (
          <g>
            <path
              d="M-12.8 -6 C-12.8 -16 -6 -18.5 0 -18.5 C6 -18.5 12.8 -16 12.8 -6 Z"
              fill="#c8413f"
            />
            <path d="M2 -7.5 L19 -6 C19 -4.4 17 -3.8 15 -4 L2 -5 Z" fill="#9e2f2d" />
            <circle cy="-18" r="1.4" fill="#9e2f2d" />
          </g>
        )}
        {acessorio === "brinco" && (
          <>
            <circle cx="-12" cy="2.5" r="1.6" fill="#f0d48a" />
            <circle cx="12" cy="2.5" r="1.6" fill="#f0d48a" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Paletas usadas no site para sortear aparências de demonstração. */
export const paletaDemo = {
  peles: ["#f6d3b3", "#eab98f", "#d39a6a", "#a8724d", "#7c4a2d", "#56331f"],
  cabelos: ["#1d1410", "#3b2219", "#6b3e22", "#b5651d", "#e8c27a", "#c8413f", "#6d4bd8", "#d9d4c7"],
  roupas: ["#c99a3b", "#2f7dd1", "#1f9d74", "#d14b6a", "#6d4bd8", "#e07b2d", "#3a4048", "#f3ecd8"],
  fundos: ["#0f3d2a", "#145236", "#1d2b3a", "#3a1f2b", "#2d2a1a", "#22193a"],
  estilos: [
    "curto",
    "longo",
    "coque",
    "moicano",
    "careca",
  ] as const satisfies readonly EstiloCabelo[],
  acessorios: ["nenhum", "oculos", "bone", "brinco"] as const satisfies readonly Acessorio[],
};
