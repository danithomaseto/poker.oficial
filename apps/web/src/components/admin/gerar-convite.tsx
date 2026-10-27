"use client";

import { useActionState, useState } from "react";
import { gerarConvite, type ResultadoConvite } from "@/app/(app)/admin/acoes";
import { classesBotao } from "../botao";

/** Formulário de novo convite + o código gerado, mostrado uma única vez, com botões de copiar. */
export function GerarConvite({ urlDoSite }: { urlDoSite: string }) {
  const [resultado, acao, gerando] = useActionState<ResultadoConvite, FormData>(gerarConvite, {
    status: "ocioso",
  });
  const [copiado, setCopiado] = useState<"codigo" | "mensagem" | null>(null);

  const copiar = async (texto: string, qual: "codigo" | "mensagem") => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      window.setTimeout(() => setCopiado(null), 2000);
    } catch {
      setCopiado(null);
    }
  };

  const mensagem =
    resultado.status === "gerado"
      ? `Seu convite pro Poker entre Amigos: ${resultado.codigo}\nResgata aqui: ${urlDoSite}/resgatar-convite\n(vale uma vez só e é só seu)`
      : "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form action={acao} className="space-y-3">
        <label className="block">
          <span className="rotulo mb-2 block text-creme-300">
            Pra quem é? (opcional, só você vê)
          </span>
          <input
            name="observacao"
            maxLength={60}
            placeholder="Ex.: Juninho da faculdade"
            className="h-12 w-full rounded-(--radius-controle) border border-borda-forte bg-black/30 px-3.5 text-creme-50 placeholder:text-creme-500 focus:border-ouro-300"
          />
        </label>
        <button type="submit" disabled={gerando} className={classesBotao("primario", "lg")}>
          {gerando ? "Gerando…" : "Gerar convite"}
        </button>
        {resultado.status === "erro" && (
          <p className="text-sm text-perigo-claro">{resultado.mensagem}</p>
        )}
      </form>

      {resultado.status === "gerado" && (
        <div
          key={resultado.codigo}
          className="animar-mensagem textura-papel relative overflow-hidden rounded-[8px] bg-creme-50 p-5 text-tinta"
          role="status"
        >
          <p className="rotulo text-naipe-vermelho">Convite novo · copie agora</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-[0.2em] select-all sm:text-4xl">
            {resultado.codigo}
          </p>
          <p className="mt-2 text-sm text-tinta-suave">
            Por segurança o código não fica salvo. Se perder, é só revogar e gerar outro.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copiar(resultado.codigo, "codigo")}
              className={classesBotao("tinta", "md")}
            >
              {copiado === "codigo" ? "Copiado!" : "Copiar código"}
            </button>
            <button
              type="button"
              onClick={() => copiar(mensagem, "mensagem")}
              className="h-10 rounded-[5px] border border-b-[3px] border-tinta/40 px-4 text-sm font-semibold text-tinta transition-colors hover:border-tinta active:translate-y-[2px] active:border-b"
            >
              {copiado === "mensagem" ? "Copiada!" : "Copiar mensagem pronta"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
