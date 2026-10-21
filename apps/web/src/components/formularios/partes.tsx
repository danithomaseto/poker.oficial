"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoFormulario } from "@/lib/formularios";
import { classesBotao } from "../botao";

/** Botão de envio que mostra um indicador enquanto a Server Action roda. */
export function BotaoEnviar({
  children,
  textoEnviando,
}: {
  children: ReactNode;
  textoEnviando: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${classesBotao("tinta", "lg")} w-full`}
    >
      {pending ? (
        <>
          <span aria-hidden className="animar-girar text-lg leading-none">
            ♠
          </span>
          {textoEnviando}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Mensagem de resultado do formulário, anunciada para leitores de tela. */
export function AvisoFormulario<C extends string>({ estado }: { estado: EstadoFormulario<C> }) {
  if (estado.status === "ocioso" || !estado.mensagem) {
    return <div role="status" aria-live="polite" className="sr-only" />;
  }

  const erro = estado.status === "erro";
  return (
    <div
      role={erro ? "alert" : "status"}
      aria-live="polite"
      className={`animar-mensagem border-l-4 py-2 pr-2 pl-4 text-sm leading-relaxed ${
        erro
          ? "border-naipe-vermelho bg-naipe-vermelho/8 text-naipe-vermelho"
          : "border-tinta bg-papel-escuro/70 text-tinta"
      }`}
    >
      <p className="rotulo mb-1">{erro ? "Opa" : "Em obras"}</p>
      <p>{estado.mensagem}</p>
    </div>
  );
}

/** Faz o cartão "tremer" quando o envio volta com erro. */
export function useTremerAoErrar<C extends string>(estado: EstadoFormulario<C>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || estado.status !== "erro") return;
    el.classList.remove("animar-tremer");
    void el.offsetWidth; // força o navegador a reiniciar a animação
    el.classList.add("animar-tremer");
  }, [estado]);
  return ref;
}
