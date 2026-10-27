import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { ConteudoAdmin, conviteSchema, jogadorSchema } from "@/components/admin/conteudo-admin";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { Carregando } from "@/components/carregando";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { exigirDono } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { alterarAcesso, revogarConvite } from "./acoes";

export const metadata: Metadata = { title: "Painel do dono" };

export default function PaginaAdmin() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Só o dono vê</p>
        <h1 className="mt-5 font-display text-4xl leading-[1.02] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl">
          Painel do <span className="text-ouro-300 italic">dono</span>.
        </h1>
        <Suspense fallback={<Carregando texto="Carregando o painel…" className="mt-10" />}>
          <Painel />
        </Suspense>
      </main>
    </>
  );
}

async function Painel() {
  const dono = await exigirDono();
  const supabase = await criarClienteServidor();
  const [respostaJogadores, respostaConvites] = await Promise.all([
    supabase!.rpc("admin_listar_jogadores"),
    supabase!.rpc("admin_listar_convites"),
  ]);
  return (
    <ConteudoAdmin
      jogadores={z.array(jogadorSchema).catch([]).parse(respostaJogadores.data)}
      convites={z.array(conviteSchema).catch([]).parse(respostaConvites.data)}
      donoId={dono.id}
      acoes={{ revogarConvite, alterarAcesso }}
    />
  );
}
