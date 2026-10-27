"use server";

import { redirect } from "next/navigation";
import { exigirJogador } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { aparenciaSchema } from "@/lib/validacao/aparencia";

export type ResultadoSalvar = { erro: string } | null;

export async function salvarAparencia(
  _anterior: ResultadoSalvar,
  formData: FormData,
): Promise<ResultadoSalvar> {
  await exigirJogador({ permitirSemPersonagem: true });
  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("aparencia") ?? ""));
  } catch {
    return { erro: "Aparência inválida." };
  }
  const aparencia = aparenciaSchema.safeParse(bruto);
  if (!aparencia.success) return { erro: "Aparência inválida." };

  const supabase = await criarClienteServidor();
  const { error } = (await supabase?.rpc("salvar_aparencia", { p_aparencia: aparencia.data })) ?? {
    error: true,
  };
  if (error) return { erro: "Não deu para salvar agora. Tenta de novo?" };
  redirect("/jogo");
}
