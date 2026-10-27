import type { Metadata } from "next";
import Link from "next/link";
import { classesBotao } from "@/components/botao";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { LINKS_PUBLICOS } from "@/components/jogo/cabecalho-jogo";

export const metadata: Metadata = { title: "Sem internet" };

/** Página que o service worker mostra quando você abre, sem internet, algo que precisa de rede. */
export default function PaginaOffline() {
  return (
    <>
      <CabecalhoApp links={LINKS_PUBLICOS} />
      <main id="conteudo" className="conteiner flex-1 py-16 sm:py-24">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Sem internet</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl">
          Essa parte precisa de conexão. <span className="text-ouro-300 italic">O treino, não.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-creme-100/80">
          Lobby, convites e mesas online dependem do servidor. Tutorial, treino contra bots, coleção de baralhos e progresso
          funcionam neste aparelho mesmo offline. O XP que você ganhar agora fica guardado e sincroniza quando a internet voltar.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/treino" className={classesBotao("primario", "lg")}>
            Treinar contra bots
          </Link>
          <Link href="/tutorial" className={classesBotao("secundario", "lg")}>
            Abrir o tutorial
          </Link>
        </div>
      </main>
    </>
  );
}
