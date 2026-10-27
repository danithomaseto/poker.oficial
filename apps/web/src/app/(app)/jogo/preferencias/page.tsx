import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { FormularioPreferencias } from "@/components/jogo/formulario-preferencias";

export const metadata: Metadata = { title: "Preferências" };

export default function PaginaPreferencias() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Preferências</p>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl">
          Do seu jeito, <span className="text-ouro-300 italic">neste aparelho.</span>
        </h1>
        <p className="mt-3 max-w-xl text-creme-100/80">
          Ficam salvas neste navegador. Em outro aparelho, as preferências começam no padrão.
        </p>
        <div className="mt-10">
          <FormularioPreferencias />
        </div>
      </main>
    </>
  );
}
