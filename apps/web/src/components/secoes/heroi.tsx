import Link from "next/link";
import type { CSSProperties } from "react";
import { rotas } from "@/config/site";
import { classesBotao } from "../botao";
import { MesaAnimada } from "../ilustracoes/mesa-animada";

const titulo: { texto: string; destaque?: boolean }[] = [
  { texto: "O" },
  { texto: "poker" },
  { texto: "da" },
  { texto: "turma" },
  { texto: "agora" },
  { texto: "tem" },
  { texto: "mesa", destaque: true },
  { texto: "própria.", destaque: true },
];

function atrasoPalavra(i: number): CSSProperties {
  return { animationDelay: `${100 + i * 55}ms` };
}

export function Heroi() {
  return (
    <section className="textura-feltro relative bg-mesa-700 pt-28 pb-16 shadow-[inset_0_0_220px_rgba(0,0,0,0.55)] sm:pt-32 lg:min-h-dvh lg:pb-20">
      <div className="conteiner relative grid items-center gap-12 lg:min-h-[calc(100dvh-10rem)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 2xl:gap-20">
        <div>
          <p className="rotulo animar-mensagem flex items-center gap-3 text-ouro-300">
            <span className="text-naipe-vermelho">♦</span>
            Mesa privada · só entra com convite
          </p>

          <h1 className="mt-6 font-display text-[2.9rem] leading-[0.98] font-medium tracking-[-0.02em] text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-7xl 2xl:text-[5.6rem]">
            {titulo.map((palavra, i) => (
              <span
                key={i}
                className={`animar-surgir inline-block ${palavra.destaque ? "text-ouro-300 italic" : ""}`}
                style={atrasoPalavra(i)}
              >
                {palavra.texto}
                {i < titulo.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>

          <p
            className="animar-mensagem mt-7 max-w-xl text-lg leading-relaxed text-creme-100/85"
            style={{ animationDelay: "600ms" }}
          >
            Texas Hold&apos;em entre amigos, sem baixar nada e sem dinheiro de verdade. Cada um com
            sua carteirinha, treino contra bots do Fácil ao Extremo e, em breve, mesas online com a
            turma. A resenha por voz continua no Discord.
          </p>

          <div
            className="animar-mensagem mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
            style={{ animationDelay: "750ms" }}
          >
            <Link
              href={rotas.resgatarConvite}
              transitionTypes={["nav-forward"]}
              className={classesBotao("primario", "lg")}
            >
              Resgatar meu convite
            </Link>
            <Link href="/treino" className={classesBotao("secundario", "lg")}>
              Treinar contra bots
            </Link>
            <Link
              href={rotas.entrar}
              transitionTypes={["nav-forward"]}
              className={classesBotao("fantasma", "lg")}
            >
              Já tenho conta →
            </Link>
          </div>

          <p
            className="rotulo animar-mensagem mt-10 flex flex-wrap gap-x-3 gap-y-1 text-creme-300/80"
            style={{ animationDelay: "900ms" }}
          >
            <span>Grátis</span>
            <span aria-hidden className="text-ouro-500">
              ·
            </span>
            <span>Até 9 por mesa</span>
            <span aria-hidden className="text-ouro-500">
              ·
            </span>
            <span>Fichas sem valor real</span>
          </p>
        </div>

        <div className="relative -mx-2 sm:mx-0">
          <MesaAnimada />
        </div>
      </div>
    </section>
  );
}
