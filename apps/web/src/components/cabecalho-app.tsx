import Link from "next/link";
import type { ReactNode } from "react";
import { Marca } from "./marca";

/** Cabeçalho das páginas do jogo (lobby, treino, admin). */
export function CabecalhoApp({
  links,
  direita,
}: {
  links: { href: string; rotulo: string }[];
  direita?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-ouro-400/25 bg-mesa-900"
      style={{ viewTransitionName: "cabecalho" }}
    >
      <div className="conteiner flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Marca />
          <nav aria-label="Jogo" className="hidden sm:block">
            <ul className="flex items-center gap-6">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rotulo text-creme-300 transition-colors hover:text-ouro-200"
                  >
                    {l.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-4">{direita}</div>
      </div>
    </header>
  );
}
