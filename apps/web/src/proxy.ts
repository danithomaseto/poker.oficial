import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configSupabase } from "@/lib/supabase/config";

// Treino, tutorial, baralhos e progresso são públicos (funcionam sem conta e sem internet).
const PROTEGIDAS = ["/jogo", "/admin"];

/**
 * Renova a sessão do Supabase a cada navegação e faz a checagem otimista de acesso:
 * sem sessão, vai para /entrar; conta banida tem a sessão encerrada na hora.
 * A autorização de verdade continua nas páginas (lib/sessao.ts) e nas funções do banco.
 */
export async function proxy(request: NextRequest) {
  const cfg = configSupabase();
  // Sem Supabase configurado não há contas: as páginas protegidas avisam que falta configurar.
  if (!cfg) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(cfg.url, cfg.chave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista, cabecalhos) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        Object.entries(cabecalhos ?? {}).forEach(([chave, valor]) =>
          resposta.headers.set(chave, valor),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  const caminho = request.nextUrl.pathname;
  const protegida = PROTEGIDAS.some((p) => caminho === p || caminho.startsWith(`${p}/`));

  const redirecionar = (destino: string) => {
    const r = NextResponse.redirect(new URL(destino, request.url));
    resposta.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (protegida && !id) return redirecionar("/entrar");

  if (id && protegida) {
    const { data: perfil } = await supabase
      .from("perfis")
      .select("status")
      .eq("id", id)
      .maybeSingle();
    if (!perfil || perfil.status !== "ativo") {
      await supabase.auth.signOut();
      return redirecionar("/entrar?motivo=revogado");
    }
  }

  // Quem já está logado não precisa ver as telas de entrada.
  if (
    id &&
    (caminho === "/entrar" || caminho === "/resgatar-convite" || caminho === "/primeiro-acesso") &&
    !request.nextUrl.searchParams.has("motivo")
  ) {
    return redirecionar("/jogo");
  }

  return resposta;
}

export const config = {
  matcher: ["/jogo/:path*", "/admin/:path*", "/entrar", "/resgatar-convite", "/primeiro-acesso"],
};
