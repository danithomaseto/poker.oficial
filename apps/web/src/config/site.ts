/**
 * Dados do site público. O nome é provisório: trocar aqui muda em todo o site.
 */
export const site = {
  nome: "Poker entre Amigos",
  nomeCurto: "Poker Amigos",
  /** Endereço público, usado nas mensagens de convite. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://poker-oficial.vercel.app",
  descricao:
    "Clube privado de Texas Hold'em No-Limit para um grupo fechado de amigos. Abre no navegador, entra só por convite e as fichas são 100% virtuais.",
} as const;

export const rotas = {
  inicio: "/",
  entrar: "/entrar",
  resgatarConvite: "/resgatar-convite",
  primeiroAcesso: "/primeiro-acesso",
} as const;
