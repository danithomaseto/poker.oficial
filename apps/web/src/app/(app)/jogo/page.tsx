import type { Metadata } from "next";
import { Suspense } from "react";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { Carregando } from "@/components/carregando";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { ConteudoLobby } from "@/components/jogo/conteudo-lobby";
import { saldoDeMoedas } from "@/lib/moedas";
import { exigirJogador } from "@/lib/sessao";

export const metadata: Metadata = { title: "Lobby" };

export default function PaginaLobby() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="flex-1">
        <Suspense fallback={<Carregando texto="Abrindo o lobby…" className="conteiner py-16" />}>
          <Lobby />
        </Suspense>
      </main>
    </>
  );
}

async function Lobby() {
  const perfil = await exigirJogador();
  const moedas = await saldoDeMoedas(perfil.id);
  return (
    <ConteudoLobby
      dados={{
        nome: perfil.nome,
        numeroSocio: perfil.numeroSocio,
        aparencia: perfil.aparencia!,
        desde: new Date(perfil.criadoEm).getFullYear().toString(),
        moedas,
        dono: perfil.papel === "dono",
      }}
    />
  );
}
