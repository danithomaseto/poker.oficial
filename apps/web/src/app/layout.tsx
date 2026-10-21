import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Libre_Franklin } from "next/font/google";
import { EfeitosGlobais } from "@/components/efeitos-globais";
import { site } from "@/config/site";
import "./globals.css";

// Fraunces (títulos, com o eixo WONK para dar personalidade), Libre Franklin (texto,
// cara de impresso) e IBM Plex Mono (rótulos de bilhete e números).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.nome} · Poker privado no navegador`,
    template: `%s · ${site.nome}`,
  },
  description: site.descricao,
  applicationName: site.nome,
  // Clube fechado: o site não precisa aparecer em buscadores.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d2c1f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${franklin.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <a
          href="#conteudo"
          className="sr-only z-[100] bg-ouro-300 px-4 py-2 font-semibold text-tinta focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <EfeitosGlobais />
        {children}
      </body>
    </html>
  );
}
