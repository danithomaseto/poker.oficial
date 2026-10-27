"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoFormulario } from "@/lib/formularios";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  formDataParaObjeto,
  loginSchema,
  primeiroAcessoSchema,
  resgateConviteSchema,
  type DadosLogin,
  type DadosPrimeiroAcesso,
  type DadosResgateConvite,
} from "@/lib/validacao/acesso";

const SEM_CONTAS =
  "As contas ainda não foram ativadas neste site: falta conectar o banco (Supabase). O treino contra bots já funciona.";

export type CampoLogin = keyof DadosLogin;
export type CampoResgate = keyof DadosResgateConvite;
export type CampoPrimeiroAcesso = keyof DadosPrimeiroAcesso;

export async function entrar(
  _anterior: EstadoFormulario<CampoLogin>,
  formData: FormData,
): Promise<EstadoFormulario<CampoLogin>> {
  const bruto = formDataParaObjeto(formData);
  const valores = { email: bruto.email ?? "" };
  const resultado = loginSchema.safeParse(bruto);
  if (!resultado.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }

  const supabase = await criarClienteServidor();
  if (!supabase) return { status: "indisponivel", mensagem: SEM_CONTAS, valores };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.senha,
  });
  if (error || !data.user) {
    const mensagem =
      error?.code === "email_not_confirmed"
        ? "Confirme seu email (veja a caixa de entrada) e tente de novo."
        : "Email ou senha incorretos.";
    return { status: "erro", mensagem, valores };
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!perfil || perfil.status !== "ativo") {
    await supabase.auth.signOut();
    return {
      status: "erro",
      mensagem: "Seu acesso está suspenso. Fale com o dono da mesa.",
      valores,
    };
  }

  redirect("/jogo");
}

export async function resgatarConvite(
  _anterior: EstadoFormulario<CampoResgate>,
  formData: FormData,
): Promise<EstadoFormulario<CampoResgate>> {
  const bruto = formDataParaObjeto(formData);
  const valores = { codigo: bruto.codigo ?? "", nome: bruto.nome ?? "", email: bruto.email ?? "" };
  const resultado = resgateConviteSchema.safeParse(bruto);
  if (!resultado.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }
  const { codigo, nome, email, senha } = resultado.data;

  const supabase = await criarClienteServidor();
  if (!supabase) return { status: "indisponivel", mensagem: SEM_CONTAS, valores };

  // Checagens antes do cadastro, só para dar mensagens claras: quem garante é o gatilho no banco.
  const [{ data: conviteValido }, { data: nomeLivre }] = await Promise.all([
    supabase.rpc("verificar_convite", { p_codigo: codigo }),
    supabase.rpc("nome_disponivel", { p_nome: nome }),
  ]);
  const erros: EstadoFormulario<CampoResgate>["erros"] = {};
  if (conviteValido !== true)
    erros.codigo = ["Esse convite não vale: confira o código ou peça outro."];
  if (nomeLivre !== true) erros.nome = ["Já tem alguém com esse nome na mesa."];
  if (Object.keys(erros).length)
    return { status: "erro", mensagem: "Confira os campos destacados.", erros, valores };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, codigo_convite: codigo } },
  });
  if (error) {
    const jaExiste =
      error.code === "user_already_exists" || /already registered/i.test(error.message);
    return {
      status: "erro",
      mensagem: jaExiste
        ? "Esse email já tem conta. É só entrar."
        : "Não deu para criar a conta com esse convite. Confira o código e tente de novo.",
      valores,
    };
  }
  if (!data.session) {
    return {
      status: "sucesso",
      mensagem: "Conta criada! Confirme o email que enviamos e depois é só entrar.",
      valores,
    };
  }
  redirect("/jogo/personagem");
}

/**
 * Primeiro acesso do dono: cria a conta sem convite. Só vira dono se o email for o que está em
 * `configuracao.email_dono` e ainda não houver dono (o gatilho no banco decide, não esta função).
 */
export async function criarContaDono(
  _anterior: EstadoFormulario<CampoPrimeiroAcesso>,
  formData: FormData,
): Promise<EstadoFormulario<CampoPrimeiroAcesso>> {
  const bruto = formDataParaObjeto(formData);
  const valores = { nome: bruto.nome ?? "", email: bruto.email ?? "" };
  const resultado = primeiroAcessoSchema.safeParse(bruto);
  if (!resultado.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: z.flattenError(resultado.error).fieldErrors,
      valores,
    };
  }
  const { nome, email, senha } = resultado.data;

  const supabase = await criarClienteServidor();
  if (!supabase) return { status: "indisponivel", mensagem: SEM_CONTAS, valores };

  const { data: aberta } = await supabase.rpc("vaga_de_dono_aberta");
  if (aberta !== true) {
    return {
      status: "erro",
      mensagem:
        "O primeiro acesso não está disponível: ou o dono já criou a conta (é só entrar), ou o email do dono ainda não foi configurado no banco.",
      valores,
    };
  }

  const { data, error } = await supabase.auth.signUp({ email, password: senha, options: { data: { nome } } });
  if (error) {
    const jaExiste = error.code === "user_already_exists" || /already registered/i.test(error.message);
    return {
      status: "erro",
      mensagem: jaExiste
        ? "Esse email já tem conta. É só entrar (ou usar “esqueci a senha” no Supabase)."
        : "Esse email não está autorizado como dono. Use exatamente o email configurado no banco.",
      valores,
    };
  }
  if (!data.session) {
    return {
      status: "sucesso",
      mensagem: "Conta de dono criada! Confirme o email que o Supabase enviou e depois entre: o painel do dono vai estar no menu.",
      valores,
    };
  }
  redirect("/admin");
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase?.auth.signOut();
  redirect("/");
}
