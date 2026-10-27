import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { EditorPersonagem } from "@/components/jogo/editor-personagem";
import { JOGADOR_PADRAO } from "@/components/treino/jogador-padrao";
import { exigirJogador } from "@/lib/sessao";

export const metadata: Metadata = { title: "Sua carteirinha" };

export default function PaginaPersonagem() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Seu personagem</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl">
          Monte sua <span className="text-ouro-300 italic">carteirinha</span>.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-creme-100/80">
          Já vem um visual pronto: se quiser, é só salvar. Dá para mudar quando quiser, e nada disso
          mexe no jogo.
        </p>
        <div className="mt-12">
          <Suspense fallback={<p className="text-creme-300">Carregando…</p>}>
            <Editor />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function Editor() {
  const perfil = await exigirJogador({ permitirSemPersonagem: true });
  return (
    <EditorPersonagem
      nome={perfil.nome}
      numero={perfil.numeroSocio}
      desde={new Date(perfil.criadoEm).getFullYear().toString()}
      inicial={perfil.aparencia ?? JOGADOR_PADRAO.aparencia}
    />
  );
}
