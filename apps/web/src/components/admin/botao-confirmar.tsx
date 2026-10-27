"use client";

import { useState, useTransition } from "react";
import { useAvisar } from "../avisos";

/** Botão de ação sensível (banir, revogar) com confirmação e retorno do servidor em notificação. */
export function BotaoConfirmar({
  rotulo,
  confirmar,
  acao,
  perigoso,
}: {
  rotulo: string;
  confirmar: string;
  acao: () => Promise<{ ok: boolean; mensagem: string }>;
  perigoso?: boolean;
}) {
  const [pedindo, setPedindo] = useState(false);
  const [pendente, iniciar] = useTransition();
  const avisar = useAvisar();

  if (pedindo) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={pendente}
          aria-busy={pendente}
          onClick={() =>
            iniciar(async () => {
              try {
                const r = await acao();
                avisar(r.ok ? "sucesso" : "erro", r.mensagem);
              } catch {
                avisar("erro", "Não deu para concluir. Verifique a conexão e tente de novo.");
              }
              setPedindo(false);
            })
          }
          className={`rotulo rounded-(--radius-controle) px-3 py-1.5 disabled:opacity-60 ${
            perigoso ? "bg-perigo text-creme-50" : "bg-tinta text-creme-50"
          }`}
        >
          {pendente ? "Aguarde…" : confirmar}
        </button>
        <button type="button" disabled={pendente} onClick={() => setPedindo(false)} className="rotulo text-tinta-suave hover:text-tinta">
          Cancelar
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPedindo(true)}
      className={`rotulo rounded-(--radius-controle) border px-3 py-1.5 transition-colors ${
        perigoso
          ? "border-perigo/50 text-perigo hover:bg-perigo hover:text-creme-50"
          : "border-tinta/40 text-tinta hover:bg-tinta hover:text-creme-50"
      }`}
    >
      {rotulo}
    </button>
  );
}
