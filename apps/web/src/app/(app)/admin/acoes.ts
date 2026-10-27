"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { exigirDono } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";

export type ResultadoConvite =
  | { status: "ocioso" }
  | { status: "gerado"; codigo: string }
  | { status: "erro"; mensagem: string };

/** Resultado das ações de um clique (revogar, banir), para a tela dar retorno. */
export type ResultadoAcao = { ok: boolean; mensagem: string };

const observacaoSchema = z.string().trim().max(60, "Use no máximo 60 caracteres.");

/** Gera um convite. O código só aparece nesta resposta: o banco guarda apenas o hash. */
export async function gerarConvite(_anterior: ResultadoConvite, formData: FormData): Promise<ResultadoConvite> {
  await exigirDono();
  const observacao = observacaoSchema.safeParse(formData.get("observacao") ?? "");
  if (!observacao.success) return { status: "erro", mensagem: observacao.error.issues[0]!.message };

  const supabase = await criarClienteServidor();
  const resposta = await supabase?.rpc("gerar_convite", { p_observacao: observacao.data || null });
  const codigo = z.string().safeParse(resposta?.data);
  if (!resposta || resposta.error || !codigo.success) {
    return { status: "erro", mensagem: "Não deu para gerar o convite agora. Tente de novo." };
  }
  refresh();
  return { status: "gerado", codigo: codigo.data };
}

export async function revogarConvite(id: string): Promise<ResultadoAcao> {
  await exigirDono();
  const alvo = z.uuid().safeParse(id);
  if (!alvo.success) return { ok: false, mensagem: "Convite inválido." };
  const supabase = await criarClienteServidor();
  const resposta = await supabase?.rpc("revogar_convite", { p_id: alvo.data });
  if (!resposta || resposta.error) return { ok: false, mensagem: "Não deu para revogar agora. Tente de novo." };
  refresh();
  return { ok: true, mensagem: "Convite revogado: ele não abre mais a porta." };
}

/** Banir (revogado) ou desbanir (ativo). Quem é banido perde a sessão na próxima página que abrir. */
export async function alterarAcesso(id: string, status: "ativo" | "revogado"): Promise<ResultadoAcao> {
  const dono = await exigirDono();
  const alvo = z.uuid().safeParse(id);
  const novo = z.enum(["ativo", "revogado"]).safeParse(status);
  if (!alvo.success || !novo.success) return { ok: false, mensagem: "Pedido inválido." };
  if (alvo.data === dono.id) return { ok: false, mensagem: "Você não pode alterar o próprio acesso." };
  const supabase = await criarClienteServidor();
  const resposta = await supabase?.rpc("definir_status_jogador", { p_id: alvo.data, p_status: novo.data });
  if (!resposta || resposta.error) return { ok: false, mensagem: "Não deu para alterar o acesso agora." };
  refresh();
  return {
    ok: true,
    mensagem: novo.data === "revogado" ? "Jogador banido. A sessão dele cai na próxima página." : "Acesso devolvido.",
  };
}
