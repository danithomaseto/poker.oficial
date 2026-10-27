"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { aoSubirDeNivel, type SubidaDeNivel } from "@/lib/progresso/local";

/**
 * Aviso de subida de nível: aparece só quando o nível realmente muda (soma dos eventos
 * aceitos), fica alguns segundos e não bloqueia a mesa.
 */
export function AvisoNivel() {
  const [subida, setSubida] = useState<SubidaDeNivel | null>(null);

  useEffect(() => {
    let tempo = 0;
    const parar = aoSubirDeNivel((s) => {
      setSubida(s);
      window.clearTimeout(tempo);
      tempo = window.setTimeout(() => setSubida(null), 6000);
    });
    return () => {
      parar();
      window.clearTimeout(tempo);
    };
  }, []);

  if (!subida) return null;
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
      <div className="aviso-nivel pointer-events-auto flex items-center gap-4 rounded-(--radius-painel) border border-ouro-400/60 bg-superficie-2/95 py-3 pr-5 pl-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur">
        <span className="grid size-12 place-items-center rounded-full border-2 border-ouro-300 bg-ouro-300/15 font-display text-2xl text-ouro-200">
          {subida.para}
        </span>
        <span>
          <span className="rotulo block text-ouro-300">Subiu de nível</span>
          <span className="font-display text-xl text-creme-50">{subida.titulo}</span>
          {subida.baralho && (
            <span className="block text-sm text-creme-300">
              Baralho desbloqueado: <strong className="text-creme-50">{subida.baralho}</strong>{" "}
              <Link href="/baralhos" className="text-ouro-200 underline underline-offset-4">
                ver na coleção
              </Link>
            </span>
          )}
        </span>
        <button type="button" onClick={() => setSubida(null)} className="rotulo ml-2 text-creme-500 hover:text-creme-50" aria-label="Fechar aviso">
          ✕
        </button>
      </div>
    </div>
  );
}
