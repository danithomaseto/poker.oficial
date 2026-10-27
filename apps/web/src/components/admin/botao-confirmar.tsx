"use client";

import { useState, useTransition } from "react";

/** Botão de ação sensível (banir, revogar) com um segundo clique de confirmação. */
export function BotaoConfirmar({
  rotulo,
  confirmar,
  acao,
  perigoso,
}: {
  rotulo: string;
  confirmar: string;
  acao: () => Promise<void>;
  perigoso?: boolean;
}) {
  const [pedindo, setPedindo] = useState(false);
  const [pendente, iniciar] = useTransition();

  if (pedindo) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={pendente}
          onClick={() =>
            iniciar(async () => {
              await acao();
              setPedindo(false);
            })
          }
          className={`rotulo rounded-[4px] px-3 py-1.5 ${perigoso ? "bg-naipe-vermelho text-creme-50" : "bg-tinta text-creme-50"}`}
        >
          {pendente ? "…" : confirmar}
        </button>
        <button
          type="button"
          onClick={() => setPedindo(false)}
          className="rotulo text-tinta-suave hover:text-tinta"
        >
          Cancelar
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPedindo(true)}
      className={`rotulo rounded-[4px] border px-3 py-1.5 transition-colors ${
        perigoso
          ? "border-naipe-vermelho/50 text-naipe-vermelho hover:bg-naipe-vermelho hover:text-creme-50"
          : "border-tinta/40 text-tinta hover:bg-tinta hover:text-creme-50"
      }`}
    >
      {rotulo}
    </button>
  );
}
