import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { EstruturaAcesso } from "@/components/acesso/estrutura-acesso";
import { c } from "@/components/baralho";
import { FormularioDono } from "@/components/formularios/formulario-dono";
import { rotas } from "@/config/site";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Primeiro acesso do dono",
  robots: { index: false },
};

export default function PaginaPrimeiroAcesso() {
  return (
    <EstruturaAcesso
      faixa="Primeiro acesso"
      selo="só para o dono"
      titulo="Abrindo o clube"
      descricao="Crie a conta de dono uma única vez. Depois disso, os convites saem pelo painel do dono."
      painel={{
        titulo: (
          <>
            Quem abre a mesa <span className="text-ouro-300 italic">dá as cartas.</span>
          </>
        ),
        texto:
          "Esta página só funciona enquanto não existe dono. O banco confere o email: qualquer outro email é recusado, e depois do primeiro dono ela se fecha.",
        cartas: [c("K", "espadas"), c("K", "copas"), c("K", "ouros"), c("K", "paus"), c("A", "espadas")],
      }}
      rodape={
        <>
          Já criou a conta?{" "}
          <Link
            href={rotas.entrar}
            className="font-semibold text-naipe-vermelho underline decoration-naipe-vermelho/30 underline-offset-4 hover:decoration-naipe-vermelho"
          >
            Entrar
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="mb-6 text-sm text-tinta-suave">Conferindo o banco…</p>}>
        <SituacaoDaVaga />
      </Suspense>
      <FormularioDono />
    </EstruturaAcesso>
  );
}

/** Diz se o primeiro acesso está disponível, sem revelar o email configurado. */
async function SituacaoDaVaga() {
  const supabase = await criarClienteServidor();
  if (!supabase) {
    return (
      <Aviso tom="alerta">
        O banco (Supabase) ainda não está conectado a este site. Siga o passo a passo em <code>docs/supabase.md</code> e faça um
        novo deploy.
      </Aviso>
    );
  }
  const { data, error } = await supabase.rpc("vaga_de_dono_aberta");
  if (error) {
    return (
      <Aviso tom="alerta">
        O banco respondeu, mas falta a migração do primeiro acesso. Rode as três migrações da pasta{" "}
        <code>supabase/migrations</code> no SQL Editor, em ordem.
      </Aviso>
    );
  }
  if (data !== true) {
    return (
      <Aviso tom="alerta">
        Indisponível agora: ou o dono já existe (é só <Link href={rotas.entrar} className="underline">entrar</Link>), ou o email
        do dono ainda não foi gravado no banco (passo 3 do <code>docs/supabase.md</code>).
      </Aviso>
    );
  }
  return <Aviso tom="ok">Tudo certo: a vaga de dono está aberta. Use o email que você gravou no banco.</Aviso>;
}

function Aviso({ tom, children }: { tom: "ok" | "alerta"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`mb-6 rounded-[5px] border-l-4 px-4 py-3 text-sm ${
        tom === "ok" ? "border-sucesso bg-sucesso/10 text-tinta" : "border-naipe-vermelho bg-naipe-vermelho/8 text-tinta"
      }`}
    >
      {children}
    </p>
  );
}
