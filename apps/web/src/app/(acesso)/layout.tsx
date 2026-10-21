import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Marca } from "@/components/marca";
import { NaipesFlutuantes } from "@/components/ilustracoes/naipes-flutuantes";
import { rotas } from "@/config/site";

export default function LayoutAcesso({ children }: LayoutProps<"/">) {
  return (
    <div className="textura-feltro relative flex min-h-dvh flex-col overflow-hidden bg-mesa-700 shadow-[inset_0_0_220px_rgba(0,0,0,0.55)]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <NaipesFlutuantes subida="110vh" className="opacity-40" />
      </div>

      <header className="relative z-10" style={{ viewTransitionName: "cabecalho" }}>
        <div className="conteiner flex h-16 items-center justify-between">
          <Marca />
          <Link
            href={rotas.inicio}
            transitionTypes={["nav-back"]}
            className="group/voltar rotulo inline-flex items-center gap-2 py-2 text-creme-300 transition-colors hover:text-creme-50"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover/voltar:-translate-x-1"
              aria-hidden
            />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main id="conteudo" className="relative z-10 flex flex-1 items-center">
        {children}
      </main>
    </div>
  );
}
