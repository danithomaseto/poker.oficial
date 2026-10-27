"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { exigirDono } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type ResultadoConvite =
  | { status: "ocioso" }
  | { status: "gerado"; codigo: string }
  | { status: "erro"; mensagem: string };

const observacaoSchema = z.string().trim().max(60, "Use no máximo 60 caracteres.");

/** Gera um convite. O código só aparece nesta resposta: o banco guarda apenas o hash. */
export async function gerarConvite(
  _anterior: ResultadoConvite,
  formData: FormData,
): Promise<ResultadoConvite> {
  await exigirDono();
  const observacao = observacaoSchema.safeParse(formData.get("observacao") ?? "");
  if (!observacao.success) return { status: "erro", mensagem: observacao.error.issues[0]!.message };

  const supabase = await criarClienteServidor();
  const resposta = await supabase?.rpc("gerar_convite", { p_observacao: observacao.data || null });
  const codigo = z.string().safeParse(resposta?.data);
  if (!resposta || resposta.error || !codigo.success) {
    return { status: "erro", mensagem: "Não deu para gerar o convite agora." };
  }
  refresh();
  return { status: "gerado", codigo: codigo.data };
}

export async function revogarConvite(id: string): Promise<void> {
  await exigirDono();
  const supabase = await criarClienteServidor();
  await supabase?.rpc("revogar_convite", { p_id: z.uuid().parse(id) });
  refresh();
}

/** Banir (revogado) ou desbanir (ativo). Quem é banido perde a sessão na próxima requisição. */
export async function alterarAcesso(id: string, status: "ativo" | "revogado"): Promise<void> {
  const dono = await exigirDono();
  const alvo = z.uuid().parse(id);
  if (alvo === dono.id) return;
  const supabase = await criarClienteServidor();
  await supabase?.rpc("definir_status_jogador", {
    p_id: alvo,
    p_status: z.enum(["ativo", "revogado"]).parse(status),
  });
  refresh();
}
