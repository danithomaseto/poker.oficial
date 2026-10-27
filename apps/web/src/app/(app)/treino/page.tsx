import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_PUBLICOS } from "@/components/jogo/cabecalho-jogo";
import { Treino } from "@/components/treino/treino";

export const metadata: Metadata = { title: "Treino contra bots" };

/**
 * Treino aberto a todos, sem login: roda inteiro no navegador (motor e bots) e funciona offline.
 * Quem está logado joga com a carteirinha guardada neste aparelho pelo cabeçalho.
 */
export default function PaginaTreino() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_PUBLICOS} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="flex-1">
        <Suspense fallback={<p className="conteiner py-16 text-creme-300">Arrumando a mesa…</p>}>
          <Treino />
        </Suspense>
      </main>
    </>
  );
}
