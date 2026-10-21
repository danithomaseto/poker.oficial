import Link from "next/link";
import type { CSSProperties } from "react";
import { rotas } from "@/config/site";
import { classesBotao } from "../botao";

/** Chamada final em forma de convite de papel, com canhoto picotado e carimbo. */
export function ConviteFinal() {
  return (
    <section
      aria-labelledby="titulo-convite"
      className="textura-feltro relative bg-mesa-700 py-24 sm:py-32"
    >
      <div className="conteiner relative">
        <div
          data-revelar="zoom"
          className="mx-auto max-w-6xl drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
        >
          <div
            className="picote textura-papel relative grid overflow-hidden rounded-[8px] bg-creme-50 text-tinta md:grid-cols-[1fr_auto]"
            style={{ "--x-picote": "calc(100% - 17rem)" } as CSSProperties}
          >
            {/* Corpo do convite */}
            <div className="relative p-8 sm:p-12 2xl:p-16">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-tinta pb-4">
                <span className="rotulo">Convite individual · intransferível</span>
                <span className="rotulo text-naipe-vermelho">♠ ♥ ♦ ♣</span>
              </div>
              <h2
                id="titulo-convite"
                className="mt-8 max-w-3xl font-display text-4xl leading-[1.02] font-medium tracking-[-0.02em] [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl 2xl:text-7xl"
              >
                Recebeu um código?{" "}
                <span className="text-naipe-vermelho italic">A cadeira é sua.</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta-suave">
                Resgate o convite, monte sua carteirinha e chama a galera no Discord. As fichas já
                estão na mesa esperando.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={rotas.resgatarConvite}
                  transitionTypes={["nav-forward"]}
                  className={classesBotao("tinta", "lg")}
                >
                  Resgatar meu convite
                </Link>
                <Link
                  href={rotas.entrar}
                  transitionTypes={["nav-forward"]}
                  className="font-semibold text-tinta underline decoration-tinta/30 underline-offset-4 transition-colors hover:decoration-naipe-vermelho"
                >
                  Já tenho conta
                </Link>
              </div>

              <span
                aria-hidden
                className="carimbo pointer-events-none absolute top-10 right-8 hidden rounded-[6px] border-[3px] border-naipe-vermelho px-4 py-2 text-center font-mono text-sm leading-tight font-semibold tracking-[0.2em] text-naipe-vermelho uppercase lg:block"
              >
                Vale
                <br />
                <span className="text-2xl tracking-[0.1em]">1 vez</span>
              </span>
            </div>

            {/* Canhoto */}
            <div className="relative flex flex-col justify-between gap-8 border-t-2 border-dashed border-tinta/40 bg-papel-escuro/50 p-8 md:w-[17rem] md:border-t-0 md:border-l-2">
              <div>
                <p className="rotulo text-tinta-suave">Admite</p>
                <p className="font-display text-7xl leading-none font-medium">1</p>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <p className="flex justify-between border-b border-tinta/30 pb-1">
                  <span className="text-tinta-suave">Mesa</span> <span>privada</span>
                </p>
                <p className="flex justify-between border-b border-tinta/30 pb-1">
                  <span className="text-tinta-suave">Lugares</span> <span>até 9</span>
                </p>
                <p className="flex justify-between border-b border-tinta/30 pb-1">
                  <span className="text-tinta-suave">Nº</span>{" "}
                  <span className="tracking-[0.2em]">____-____</span>
                </p>
              </div>
              <p
                aria-hidden
                className="font-mono text-xs leading-none tracking-[-0.05em] text-tinta/70"
              >
                ||| | || ||| | | || | ||| || | |||| | || |
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
