import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configSupabase } from "./config";

/** Cliente do Supabase para Server Components e Server Actions (sessão nos cookies). */
export async function criarClienteServidor() {
  const config = configSupabase();
  if (!config) return null;
  const armazem = await cookies();
  return createServerClient(config.url, config.chave, {
    cookies: {
      getAll: () => armazem.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => armazem.set(name, value, options));
        } catch {
          // Em Server Components os cookies são só leitura; o proxy.ts renova a sessão.
        }
      },
    },
  });
}
