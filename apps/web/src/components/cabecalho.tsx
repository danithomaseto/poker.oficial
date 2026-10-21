"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { rotas } from "@/config/site";
import { classesBotao } from "./botao";
import { Marca } from "./marca";

const links = [
  { href: "#como-entrar", rotulo: "Como entrar" },
  { href: "#cardapio", rotulo: "Cardápio" },
  { href: "#carteirinha", rotulo: "Carteirinha" },
  { href: "#cola", rotulo: "A cola" },
  { href: "#regras", rotulo: "Regras da casa" },
  { href: "#perguntas", rotulo: "Perguntas" },
];

export function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu com Esc e trava a rolagem enquanto ele está aberto.
  useEffect(() => {
    if (!menuAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setMenuAberto(false);
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  return (
    <header className="fixed inset-x-0 top-0 z-50" style={{ viewTransitionName: "cabecalho" }}>
      <div className="barra-rolagem h-[3px] bg-naipe-vermelho" aria-hidden />
      <div className="cabecalho-site border-b border-transparent transition-[background-color,border-color] duration-300">
        <div className="conteiner flex h-16 items-center justify-between gap-6">
          <Marca />

          <nav aria-label="Seções da página" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rotulo text-creme-300 transition-colors hover:text-ouro-200"
                  >
                    {link.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-5 sm:flex">
              <Link
                href={rotas.entrar}
                transitionTypes={["nav-forward"]}
                className={classesBotao("fantasma")}
              >
                Entrar
              </Link>
              <Link
                href={rotas.resgatarConvite}
                transitionTypes={["nav-forward"]}
                className={classesBotao("primario")}
              >
                Tenho convite
              </Link>
            </div>
            <button
              type="button"
              className="rotulo flex h-10 items-center gap-2 border-b border-creme-100/40 text-creme-100 xl:hidden"
              aria-expanded={menuAberto}
              aria-controls="menu-movel"
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              {menuAberto ? "Fechar" : "Menu"}
              <span
                aria-hidden
                className={`text-ouro-300 transition-transform duration-300 ${menuAberto ? "rotate-45" : ""}`}
              >
                ♣
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu do celular */}
      <div
        id="menu-movel"
        className={`textura-feltro fixed inset-x-0 top-[67px] bottom-0 bg-mesa-900 transition-[opacity,visibility] duration-300 xl:hidden ${
          menuAberto ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Menu" className="conteiner relative flex h-full flex-col pt-4 pb-10">
          <ul className="flex flex-col">
            {links.map((link, i) => (
              <li
                key={link.href}
                className={`border-b border-ouro-400/20 transition-[opacity,translate] duration-500 ease-(--ease-saida) ${
                  menuAberto ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: menuAberto ? `${60 + i * 45}ms` : "0ms" }}
              >
                <a
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className="flex items-baseline gap-4 py-4 font-display text-3xl text-creme-50"
                >
                  <span className="rotulo w-6 text-ouro-400">{String(i + 1).padStart(2, "0")}</span>
                  {link.rotulo}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto grid gap-3">
            <Link
              href={rotas.resgatarConvite}
              transitionTypes={["nav-forward"]}
              className={classesBotao("primario", "lg")}
            >
              Tenho convite
            </Link>
            <Link
              href={rotas.entrar}
              transitionTypes={["nav-forward"]}
              className={classesBotao("secundario", "lg")}
            >
              Entrar
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
