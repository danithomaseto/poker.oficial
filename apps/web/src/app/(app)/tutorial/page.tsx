import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_PUBLICOS } from "@/components/jogo/cabecalho-jogo";
import { Tutorial } from "@/components/tutorial/tutorial";

export const metadata: Metadata = { title: "Aprenda a jogar" };

/** Pública e offline: não lê sessão fora do cabeçalho (que fica em <Suspense>). */
export default function PaginaTutorial() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_PUBLICOS} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Tutorial</p>
        <h1 className="mt-5 font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl">
          Do zero à primeira mão, <span className="text-ouro-300 italic">no seu ritmo.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-creme-100/80">
          Dez módulos curtos e práticos, na mesa de verdade. Funciona sem internet e sem conta; o progresso fica salvo neste aparelho.
        </p>
        <div className="mt-10">
          <Tutorial />
        </div>
      </main>
    </>
  );
}
