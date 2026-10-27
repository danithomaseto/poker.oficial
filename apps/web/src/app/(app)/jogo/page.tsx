import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { classesBotao } from "@/components/botao";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { Carteirinha } from "@/components/carteirinha";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
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
        <Suspense fallback={<p className="conteiner py-16 text-creme-300">Abrindo o lobby…</p>}>
          <Lobby />
        </Suspense>
      </main>
    </>
  );
}

async function Lobby() {
  const perfil = await exigirJogador();
  const moedas = await saldoDeMoedas(perfil.id);
  const dono = perfil.papel === "dono";

  return (
    <div className="conteiner grid gap-12 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <section aria-labelledby="titulo-lobby">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Lobby</p>
        <h1
          id="titulo-lobby"
          className="mt-5 font-display text-4xl leading-[1.02] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl"
        >
          E aí, <span className="text-ouro-300 italic">{perfil.nome}</span>.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-creme-100/80">
          Sua carteirinha está em dia. Enquanto as mesas online não abrem, dá para afiar o jogo
          contra os bots.
        </p>
        <div className="mt-10 max-w-[34rem]">
          <Carteirinha
            inclinada
            nome={perfil.nome}
            numero={perfil.numeroSocio}
            aparencia={perfil.aparencia!}
            desde={new Date(perfil.criadoEm).getFullYear().toString()}
            moedas={moedas}
            selo={dono ? { texto: "Dono", tom: "ouro" } : null}
          />
          <Link
            href="/jogo/personagem"
            className="rotulo mt-5 inline-block text-creme-300 underline-offset-4 hover:text-creme-50 hover:underline"
          >
            Editar carteirinha
          </Link>
        </div>
      </section>

      <ul className="grid gap-4">
        <CartaoLobby
          rotulo="Agora"
          titulo="Treino contra bots"
          texto="Seis mesas da casa, do Fácil ao Extremo, ou monte a sua. Roda no seu aparelho e não mexe em nada da conta."
          acao={
            <Link href="/treino" className={classesBotao("primario", "lg")}>
              Jogar agora
            </Link>
          }
        />
        <CartaoLobby
          rotulo="Em breve"
          titulo="Mesas online com a galera"
          texto="Até 9 lugares, chat na mesa e servidor dando as cartas. Chega na próxima etapa do projeto."
          desabilitado
        />
        {dono && (
          <CartaoLobby
            rotulo="Só você vê"
            titulo="Painel do dono"
            texto="Gere convites para liberar a entrada da galera, veja as carteirinhas e bana ou desbana quem precisar."
            acao={
              <Link href="/admin" className={classesBotao("secundario", "lg")}>
                Abrir painel
              </Link>
            }
          />
        )}
      </ul>
    </div>
  );
}

function CartaoLobby({
  rotulo,
  titulo,
  texto,
  acao,
  desabilitado,
}: {
  rotulo: string;
  titulo: string;
  texto: string;
  acao?: ReactNode;
  desabilitado?: boolean;
}) {
  return (
    <li
      className={`rounded-[8px] border p-6 sm:p-8 ${
        desabilitado
          ? "border-white/10 bg-black/20 opacity-70"
          : "border-ouro-400/25 bg-mesa-900/80"
      }`}
    >
      <p className="rotulo text-ouro-300">{rotulo}</p>
      <h2 className="mt-2 font-display text-3xl text-creme-50">{titulo}</h2>
      <p className="mt-2 max-w-xl text-creme-100/75">{texto}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </li>
  );
}
