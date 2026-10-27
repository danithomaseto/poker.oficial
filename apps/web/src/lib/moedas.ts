import "server-only";
import { criarClienteServidor } from "./supabase/servidor";

/** Saldo de moedas cosméticas do jogador logado: soma do ledger (escrito só pelo servidor). */
export async function saldoDeMoedas(perfilId: string): Promise<number> {
  const supabase = await criarClienteServidor();
  if (!supabase) return 0;
  const { data } = await supabase
    .from("moedas_lancamentos")
    .select("valor")
    .eq("perfil_id", perfilId);
  return ((data ?? []) as { valor: number }[]).reduce((soma, linha) => soma + linha.valor, 0);
}
