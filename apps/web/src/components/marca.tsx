import Link from "next/link";
import { rotas } from "@/config/site";

/** Ficha com espada no centro: o símbolo do site. */
export function IconeMarca({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <circle cx="20" cy="20" r="19" fill="#b5332f" stroke="#f6efdc" strokeWidth="1.5" />
      <circle
        cx="20"
        cy="20"
        r="14.5"
        fill="none"
        stroke="#f6efdc"
        strokeWidth="3.4"
        strokeDasharray="4.2 3.4"
      />
      <circle cx="20" cy="20" r="11" fill="#f6efdc" />
      <path
        d="M20 11.5c2.9 3.4 6.8 5.6 6.8 9a3.7 3.7 0 0 1-6 2.8l1.1 4.2h-3.8l1.1-4.2a3.7 3.7 0 0 1-6-2.8c0-3.4 3.9-5.6 6.8-9Z"
        fill="#18201b"
      />
    </svg>
  );
}

/** Logotipo: ficha + "Poker entre Amigos" com o "entre" miúdo, como num letreiro. */
export function Marca({ className, escuro }: { className?: string; escuro?: boolean }) {
  return (
    <Link
      href={rotas.inicio}
      transitionTypes={["nav-back"]}
      aria-label="Poker entre Amigos, início"
      className={`group/marca inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap ${escuro ? "text-tinta" : "text-creme-50"} ${className ?? ""}`}
    >
      <IconeMarca className="size-9 transition-transform duration-500 ease-(--ease-mola) group-hover/marca:-rotate-[25deg]" />
      <span className="font-display text-[1.35rem] leading-none font-semibold tracking-tight [font-variation-settings:'WONK'_1,'SOFT'_50]">
        Poker <i className="text-[0.8em] font-normal text-ouro-400">entre</i> Amigos
      </span>
    </Link>
  );
}
