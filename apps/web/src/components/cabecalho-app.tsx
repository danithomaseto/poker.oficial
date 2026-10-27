"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sair } from "@/app/(acesso)/acoes";
import { Avatar, type AparenciaDemo } from "./ilustracoes/avatar";
import { Marca } from "./marca";

export interface UsuarioCabecalho {
  nome: string;
  aparencia: AparenciaDemo | null;
  dono: boolean;
}

/**
 * Cabeçalho das páginas do jogo (lobby, treino, carteirinha, preferências, admin).
 * Mostra a página atual, vira menu no celular e tem o menu do usuário.
 */
export function CabecalhoApp({
  links,
  usuario = null,
}: {
  links: { href: string; rotulo: string }[];
  usuario?: UsuarioCabecalho | null;
}) {
  const caminho = usePathname();
  const [menuMovel, setMenuMovel] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const refMenu = useRef<HTMLDivElement>(null);
  const ativo = (href: string) => (href === "/jogo" ? caminho === "/jogo" : caminho.startsWith(href));

  // Fecha os menus com Esc ou clique fora.
  useEffect(() => {
    if (!menuUsuario && !menuMovel) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuUsuario(false);
        setMenuMovel(false);
      }
    };
    const aoClicar = (e: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) setMenuUsuario(false);
    };
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicar);
    };
  }, [menuUsuario, menuMovel]);

  const itensUsuario = [
    { href: "/jogo/personagem", rotulo: "Minha carteirinha" },
    { href: "/jogo/preferencias", rotulo: "Preferências" },
    ...(usuario?.dono ? [{ href: "/admin", rotulo: "Painel do dono" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-borda bg-superficie-1/95 backdrop-blur" style={{ viewTransitionName: "cabecalho" }}>
      <div className="conteiner flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Marca />
          <nav aria-label="Jogo" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={ativo(l.href) ? "page" : undefined}
                    className={`rotulo relative rounded-(--radius-controle) px-3 py-2 transition-colors ${
                      ativo(l.href) ? "text-creme-50" : "text-creme-300 hover:text-creme-50"
                    }`}
                  >
                    {l.rotulo}
                    {ativo(l.href) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-ouro-300" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {usuario && (
            <div ref={refMenu} className="relative hidden md:block">
              <button
                type="button"
                aria-expanded={menuUsuario}
                aria-haspopup="menu"
                onClick={() => setMenuUsuario((v) => !v)}
                className="flex items-center gap-2.5 rounded-full border border-borda py-1 pr-3.5 pl-1 transition-colors hover:border-borda-forte"
              >
                <span className="size-8 overflow-hidden rounded-full bg-superficie-3">
                  {usuario.aparencia && <Avatar aparencia={usuario.aparencia} className="size-full scale-110" />}
                </span>
                <span className="max-w-[10rem] truncate text-sm font-semibold text-creme-50">{usuario.nome}</span>
                <span aria-hidden className={`text-xs text-creme-300 transition-transform ${menuUsuario ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {menuUsuario && (
                <div
                  role="menu"
                  className="animar-aviso absolute top-full right-0 mt-2 w-56 overflow-hidden rounded-(--radius-cartao) border border-borda bg-superficie-2 py-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                >
                  {itensUsuario.map((item) => (
                    <Link
                      key={item.href}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setMenuUsuario(false)}
                      className="block px-4 py-2.5 text-sm text-creme-100 transition-colors hover:bg-white/5 hover:text-creme-50"
                    >
                      {item.rotulo}
                    </Link>
                  ))}
                  <form action={sair} className="border-t border-borda">
                    <button type="submit" role="menuitem" className="w-full px-4 py-2.5 text-left text-sm text-perigo-claro transition-colors hover:bg-white/5">
                      Sair
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="rotulo flex h-10 items-center gap-2 rounded-(--radius-controle) border border-borda px-3 text-creme-100 md:hidden"
            aria-expanded={menuMovel}
            aria-controls="menu-app"
            onClick={() => setMenuMovel((v) => !v)}
          >
            {menuMovel ? "Fechar" : "Menu"}
          </button>
        </div>
      </div>

      {menuMovel && (
        <nav id="menu-app" aria-label="Menu" className="animar-aviso border-t border-borda bg-superficie-1 md:hidden">
          <ul className="conteiner flex flex-col py-2">
            {[...links, ...(usuario ? itensUsuario : [])].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={ativo(l.href) ? "page" : undefined}
                  onClick={() => setMenuMovel(false)}
                  className={`flex items-center justify-between border-b border-borda py-3.5 font-display text-xl ${
                    ativo(l.href) ? "text-ouro-200" : "text-creme-50"
                  }`}
                >
                  {l.rotulo}
                  {ativo(l.href) && <span className="rotulo text-ouro-300">aqui</span>}
                </Link>
              </li>
            ))}
            {usuario && (
              <li>
                <form action={sair}>
                  <button type="submit" className="w-full py-3.5 text-left font-display text-xl text-perigo-claro">
                    Sair
                  </button>
                </form>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
