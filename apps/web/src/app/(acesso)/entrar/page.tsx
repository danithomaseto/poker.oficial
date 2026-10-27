import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AvisoMotivo } from "@/components/acesso/aviso-motivo";
import { EstruturaAcesso } from "@/components/acesso/estrutura-acesso";
import { c } from "@/components/baralho";
import { FormularioEntrar } from "@/components/formularios/formulario-entrar";
import { rotas } from "@/config/site";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function PaginaEntrar() {
  return (
    <EstruturaAcesso
      faixa="Ficha de entrada"
      titulo="De volta à mesa"
      descricao="Entra com o email e a senha da sua conta."
      painel={{
        titulo: (
          <>
            A mesa tá montada. <span className="text-ouro-300 italic">Só falta você.</span>
          </>
        ),
        texto:
          "Entra, vê quem já sentou e escolhe sua cadeira. A resenha por voz continua no Discord.",
        cartas: [
          c("10", "espadas"),
          c("J", "espadas"),
          c("Q", "espadas"),
          c("K", "espadas"),
          c("A", "espadas"),
        ],
      }}
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link
            href={rotas.resgatarConvite}
            className="font-semibold text-naipe-vermelho underline decoration-naipe-vermelho/30 underline-offset-4 hover:decoration-naipe-vermelho"
          >
            Resgatar um convite
          </Link>
          <span className="mt-2 block text-sm">
            É o dono e ainda não criou a conta?{" "}
            <Link href={rotas.primeiroAcesso} className="underline underline-offset-4 hover:text-tinta">
              Primeiro acesso
            </Link>
          </span>
        </>
      }
    >
      <Suspense fallback={null}>
        <AvisoMotivo />
      </Suspense>
      <FormularioEntrar />
    </EstruturaAcesso>
  );
}
