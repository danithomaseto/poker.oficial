"use client";

import { useSearchParams } from "next/navigation";

/** Mostra por que a pessoa caiu na tela de entrar (ex.: acesso revogado pelo dono). */
export function AvisoMotivo() {
  const motivo = useSearchParams().get("motivo");
  if (motivo !== "revogado") return null;
  return (
    <p
      role="alert"
      className="mb-6 border-l-4 border-naipe-vermelho bg-naipe-vermelho/8 py-2 pr-2 pl-4 text-sm text-naipe-vermelho"
    >
      Seu acesso foi suspenso pelo dono da mesa. Se achar que é engano, fale com ele.
    </p>
  );
}
