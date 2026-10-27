import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { criarClienteServidor } from "./supabase/servidor";
import { aparenciaSchema } from "./validacao/aparencia";

/**
 * Camada de acesso à sessão (DAL). Toda página protegida passa por aqui, então revogar o
 * acesso de alguém tem efeito na próxima requisição dessa pessoa.
 */

const linhaPerfil = z.object({
  id: z.string(),
  numero_socio: z.number(),
  nome: z.string(),
  aparencia: z.unknown(),
  papel: z.enum(["dono", "jogador"]),
  status: z.enum(["ativo", "revogado"]),
  criado_em: z.string(),
});

export interface Perfil {
  id: string;
  numeroSocio: number;
  nome: string;
  aparencia: z.infer<typeof aparenciaSchema> | null;
  papel: "dono" | "jogador";
  status: "ativo" | "revogado";
  criadoEm: string;
}

export const obterPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = await criarClienteServidor();
  if (!supabase) return null;
  const { data: sessao } = await supabase.auth.getClaims();
  const id = sessao?.claims?.sub;
  if (!id) return null;
  const { data } = await supabase
    .from("perfis")
    .select("id, numero_socio, nome, aparencia, papel, status, criado_em")
    .eq("id", id)
    .maybeSingle();
  const linha = linhaPerfil.safeParse(data);
  if (!linha.success) return null;
  const aparencia = aparenciaSchema.safeParse(linha.data.aparencia);
  return {
    id: linha.data.id,
    numeroSocio: linha.data.numero_socio,
    nome: linha.data.nome,
    aparencia: aparencia.success ? aparencia.data : null,
    papel: linha.data.papel,
    status: linha.data.status,
    criadoEm: linha.data.criado_em,
  };
});

/** Exige jogador ativo; sem carteirinha, manda montar a carteirinha primeiro. */
export async function exigirJogador({ permitirSemPersonagem = false } = {}): Promise<Perfil> {
  const perfil = await obterPerfil();
  if (!perfil) redirect("/entrar");
  if (perfil.status !== "ativo") redirect("/entrar?motivo=revogado");
  if (!perfil.aparencia && !permitirSemPersonagem) redirect("/jogo/personagem");
  return perfil;
}

export async function exigirDono(): Promise<Perfil> {
  const perfil = await exigirJogador({ permitirSemPersonagem: true });
  if (perfil.papel !== "dono") redirect("/jogo");
  return perfil;
}
