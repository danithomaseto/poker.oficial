import type { Metadata } from "next";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { JOGADOR_PADRAO, Treino } from "@/components/treino/treino";

export const metadata: Metadata = { title: "Treino contra bots" };

export default function PaginaTreino() {
  return (
    <>
      <CabecalhoApp links={[{ href: "/treino", rotulo: "Treino" }]} />
      <main id="conteudo" className="flex-1">
        <Treino jogador={JOGADOR_PADRAO} />
      </main>
    </>
  );
}
