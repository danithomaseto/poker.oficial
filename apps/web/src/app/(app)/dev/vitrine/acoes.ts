"use server";

/** Ações de mentira da vitrine de desenvolvimento: não tocam em banco nenhum. */
export async function revogarDeMentira(id: string) {
  void id;
  return { ok: true, mensagem: "(vitrine) Convite revogado." };
}

export async function alterarDeMentira(id: string, status: "ativo" | "revogado") {
  void id;
  return { ok: true, mensagem: status === "revogado" ? "(vitrine) Jogador banido." : "(vitrine) Acesso devolvido." };
}
