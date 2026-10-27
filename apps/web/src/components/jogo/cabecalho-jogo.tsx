import { obterPerfil } from "@/lib/sessao";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { CabecalhoApp } from "../cabecalho-app";
import { JOGADOR_PADRAO } from "../treino/jogador-padrao";
import { GuardarIdentidade } from "./guardar-identidade";

/** Abertas a todos, sem login e sem internet: aprender, treinar e acompanhar o progresso. */
export const LINKS_PUBLICOS = [
  { href: "/tutorial", rotulo: "Tutorial" },
  { href: "/treino", rotulo: "Treino" },
  { href: "/baralhos", rotulo: "Baralhos" },
  { href: "/progresso", rotulo: "Progresso" },
];

export const LINKS_JOGO = [{ href: "/jogo", rotulo: "Lobby" }, ...LINKS_PUBLICOS];

/**
 * Cabeçalho com o jogador logado (lê a sessão: renderizar dentro de <Suspense>). Logado, também
 * guarda nome e visual neste aparelho para o treino e o tutorial funcionarem offline.
 */
export async function CabecalhoJogo() {
  const perfil = await obterPerfil();
  if (!perfil) return <CabecalhoApp links={LINKS_PUBLICOS} entrar={supabaseConfigurado()} />;
  const dono = perfil.papel === "dono";
  return (
    <>
      <GuardarIdentidade identidade={{ nome: perfil.nome, aparencia: perfil.aparencia ?? JOGADOR_PADRAO.aparencia }} />
      <CabecalhoApp
        links={dono ? [...LINKS_JOGO, { href: "/admin", rotulo: "Admin" }] : LINKS_JOGO}
        usuario={{ nome: perfil.nome, aparencia: perfil.aparencia, dono }}
      />
    </>
  );
}
