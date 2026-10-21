"use server";

import { z } from "zod";
import type { EstadoFormulario } from "@/lib/formularios";
import {
  formDataParaObjeto,
  loginSchema,
  resgateConviteSchema,
  type DadosLogin,
  type DadosResgateConvite,
} from "@/lib/validacao/acesso";

const MENSAGEM_FASE_2 =
  "Os dados estão válidos, mas contas e convites ainda não foram ativados. Isso chega na fase 2 do projeto.";

export type CampoLogin = keyof DadosLogin;
export type CampoResgate = keyof DadosResgateConvite;

export async function entrar(
  _anterior: EstadoFormulario<CampoLogin>,
  formData: FormData,
): Promise<EstadoFormulario<CampoLogin>> {
  const bruto = formDataParaObjeto(formData);
  const resultado = loginSchema.safeParse(bruto);
  const valores = { email: bruto.email ?? "" };

  if (!resultado.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }

  // TODO(fase-2): autenticar com Supabase Auth e confirmar que o acesso não foi revogado.
  return { status: "indisponivel", mensagem: MENSAGEM_FASE_2, valores };
}

export async function resgatarConvite(
  _anterior: EstadoFormulario<CampoResgate>,
  formData: FormData,
): Promise<EstadoFormulario<CampoResgate>> {
  const bruto = formDataParaObjeto(formData);
  const resultado = resgateConviteSchema.safeParse(bruto);
  const valores = { codigo: bruto.codigo ?? "", email: bruto.email ?? "" };

  if (!resultado.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }

  // TODO(fase-2): consumir o convite uma única vez (transação no banco) e criar a conta.
  return { status: "indisponivel", mensagem: MENSAGEM_FASE_2, valores };
}
