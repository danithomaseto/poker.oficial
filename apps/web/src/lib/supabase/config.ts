/**
 * Configuração pública do Supabase. A integração da Vercel cria
 * NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY; projetos novos usam a
 * "publishable key". As duas funcionam. A chave secreta NUNCA é lida aqui.
 */
export function configSupabase(): { url: string; chave: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && chave ? { url, chave } : null;
}

export const supabaseConfigurado = () => configSupabase() !== null;
