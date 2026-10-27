import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { JOGADOR_PADRAO } from "@/components/treino/jogador-padrao";
import { Treino } from "@/components/treino/treino";
import { exigirJogador } from "@/lib/sessao";
import { supabaseConfigurado } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Treino contra bots" };

export default function PaginaTreino() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="flex-1">
        <Suspense fallback={<p className="conteiner py-16 text-creme-300">Arrumando a mesa…</p>}>
          <TreinoDoJogador />
        </Suspense>
      </main>
    </>
  );
}

/** Com contas ativas, o treino é só para quem tem convite; sem Supabase configurado, fica aberto. */
async function TreinoDoJogador() {
  if (!supabaseConfigurado()) return <Treino jogador={JOGADOR_PADRAO} />;
  const perfil = await exigirJogador();
  return (
    <Treino
      jogador={{ nome: perfil.nome, aparencia: perfil.aparencia ?? JOGADOR_PADRAO.aparencia }}
    />
  );
}
