import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** Manifesto do app instalável (PWA): abre direto no treino, que funciona sem internet. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nome,
    short_name: site.nomeCurto,
    description: "Treino de Texas Hold'em contra bots, tutorial e coleção de baralhos. Funciona offline.",
    lang: "pt-BR",
    start_url: "/treino",
    scope: "/",
    display: "standalone",
    background_color: "#0a1f17",
    theme_color: "#0d2c1f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
