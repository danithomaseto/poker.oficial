import { obterPerfil } from "@/lib/sessao";
import { CabecalhoApp } from "../cabecalho-app";

export const LINKS_JOGO = [
  { href: "/jogo", rotulo: "Lobby" },
  { href: "/treino", rotulo: "Treino" },
];

/** Cabeçalho com o jogador logado (lê a sessão: renderizar dentro de <Suspense>). */
export async function CabecalhoJogo() {
  const perfil = await obterPerfil();
  if (!perfil) return <CabecalhoApp links={[{ href: "/treino", rotulo: "Treino" }]} />;
  const dono = perfil.papel === "dono";
  return (
    <CabecalhoApp
      links={dono ? [...LINKS_JOGO, { href: "/admin", rotulo: "Admin" }] : LINKS_JOGO}
      usuario={{ nome: perfil.nome, aparencia: perfil.aparencia, dono }}
    />
  );
}
