import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_PUBLICOS } from "@/components/jogo/cabecalho-jogo";
import { PainelProgresso } from "@/components/progresso/painel-progresso";

export const metadata: Metadata = { title: "Seu progresso" };

/** Pública e offline: não lê sessão fora do cabeçalho (que fica em <Suspense>). */
export default function PaginaProgresso() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_PUBLICOS} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Progresso</p>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl">
          Seu caminho <span className="text-ouro-300 italic">até o nível 30.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-creme-100/80">
          XP vem de aprender e jogar, nunca de dinheiro. Cada nível traz um título, e alguns trazem um baralho novo.
        </p>
        <div className="mt-10">
          <PainelProgresso />
        </div>
      </main>
    </>
  );
}
