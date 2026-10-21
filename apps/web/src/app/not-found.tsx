import Link from "next/link";
import { c } from "@/components/baralho";
import { classesBotao } from "@/components/botao";
import { Carta } from "@/components/carta";
import { Marca } from "@/components/marca";
import { rotas } from "@/config/site";

export default function NaoEncontrada() {
  return (
    <main
      id="conteudo"
      className="textura-feltro relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-mesa-700 px-4 text-center shadow-[inset_0_0_220px_rgba(0,0,0,0.55)]"
    >
      <div className="relative">
        <Marca className="mb-12" />
        <div className="flex justify-center gap-3" aria-hidden>
          <Carta
            carta={c("4", "espadas")}
            largura="5.5rem"
            virar
            atraso={100}
            className="-rotate-6"
          />
          <Carta
            carta={c("A", "copas")}
            largura="5.5rem"
            virar
            atraso={250}
            className="-translate-y-3"
          />
          <Carta carta={c("4", "paus")} largura="5.5rem" virar atraso={400} className="rotate-6" />
        </div>
        <h1
          className="animar-mensagem mt-10 font-display text-4xl font-medium text-creme-50 sm:text-6xl"
          style={{ animationDelay: "600ms" }}
        >
          Essa carta não está no baralho
        </h1>
        <p
          className="animar-mensagem mx-auto mt-4 max-w-md text-creme-300"
          style={{ animationDelay: "700ms" }}
        >
          A página que você procurou não existe ou mudou de lugar.
        </p>
        <div className="animar-mensagem mt-8" style={{ animationDelay: "800ms" }}>
          <Link
            href={rotas.inicio}
            transitionTypes={["nav-back"]}
            className={classesBotao("primario", "lg")}
          >
            Voltar para a mesa
          </Link>
        </div>
      </div>
    </main>
  );
}
