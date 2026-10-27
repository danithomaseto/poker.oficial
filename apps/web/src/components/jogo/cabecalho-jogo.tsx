import { sair } from "@/app/(acesso)/acoes";
import { obterPerfil } from "@/lib/sessao";
import { CabecalhoApp } from "../cabecalho-app";
import { Avatar } from "../ilustracoes/avatar";

export const LINKS_JOGO = [
  { href: "/jogo", rotulo: "Lobby" },
  { href: "/treino", rotulo: "Treino" },
];

/** Cabeçalho do jogo com o jogador logado (lê a sessão: renderizar dentro de <Suspense>). */
export async function CabecalhoJogo() {
  const perfil = await obterPerfil();
  const links =
    perfil?.papel === "dono" ? [...LINKS_JOGO, { href: "/admin", rotulo: "Admin" }] : LINKS_JOGO;
  return (
    <CabecalhoApp
      links={perfil ? links : [{ href: "/treino", rotulo: "Treino" }]}
      direita={
        perfil ? (
          <>
            <span className="hidden items-center gap-2.5 sm:flex">
              {perfil.aparencia && (
                <span className="size-8 overflow-hidden rounded-full border border-ouro-400/60">
                  <Avatar aparencia={perfil.aparencia} className="size-full scale-110" />
                </span>
              )}
              <span className="text-sm font-semibold text-creme-50">{perfil.nome}</span>
            </span>
            <form action={sair}>
              <button
                type="submit"
                className="rotulo text-creme-300 transition-colors hover:text-creme-50"
              >
                Sair
              </button>
            </form>
          </>
        ) : null
      }
    />
  );
}
