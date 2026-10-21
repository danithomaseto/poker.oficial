import type { Metadata } from "next";
import Link from "next/link";
import { EstruturaAcesso } from "@/components/acesso/estrutura-acesso";
import { c } from "@/components/baralho";
import { FormularioConvite } from "@/components/formularios/formulario-convite";
import { rotas } from "@/config/site";

export const metadata: Metadata = {
  title: "Resgatar convite",
};

export default function PaginaResgatarConvite() {
  return (
    <EstruturaAcesso
      faixa="Resgate de convite"
      titulo="Puxa uma cadeira"
      descricao="Coloca o código que você recebeu e cria sua conta. Depois é só montar a carteirinha."
      painel={{
        titulo: (
          <>
            Um convite, <span className="text-ouro-300 italic">uma cadeira.</span>
          </>
        ),
        texto:
          "Cada código é de uma pessoa só e vale uma vez. Depois de resgatado fica preso na sua conta: não dá pra repassar.",
        cartas: [
          c("A", "copas"),
          c("A", "espadas"),
          c("A", "ouros"),
          c("A", "paus"),
          c("K", "copas"),
        ],
      }}
      rodape={
        <>
          Já tem conta?{" "}
          <Link
            href={rotas.entrar}
            className="font-semibold text-naipe-vermelho underline decoration-naipe-vermelho/30 underline-offset-4 hover:decoration-naipe-vermelho"
          >
            Entrar
          </Link>
        </>
      }
    >
      <FormularioConvite />
    </EstruturaAcesso>
  );
}
