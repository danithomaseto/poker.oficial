import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import type { CartaVisual } from "../baralho";
import { Carta } from "../carta";
import { TransicaoPagina } from "../transicao-pagina";

type Props = {
  /** Texto da faixa no topo do cartão, ex.: "Ficha de entrada". */
  faixa: string;
  titulo: string;
  descricao: string;
  /** Texto e cartas do painel à esquerda (telas grandes). */
  painel: { titulo: ReactNode; texto: string; cartas: CartaVisual[] };
  rodape: ReactNode;
  children: ReactNode;
};

/**
 * Estrutura comum de /entrar e /resgatar-convite: feltro à esquerda, ficha de papel à direita.
 * O cartão tem o mesmo nome de transição nas duas páginas, então "morfa" de uma para a outra.
 */
export function EstruturaAcesso({ faixa, titulo, descricao, painel, rodape, children }: Props) {
  return (
    <TransicaoPagina>
      <div className="conteiner grid items-center gap-12 py-10 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-20 2xl:gap-32">
        <div className="hidden lg:block">
          <LequeCartas cartas={painel.cartas} />
          <h2
            className="animar-mensagem mt-14 max-w-xl font-display text-5xl leading-[1.02] font-medium tracking-[-0.02em] text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] 2xl:text-6xl"
            style={{ animationDelay: "300ms" }}
          >
            {painel.titulo}
          </h2>
          <p
            className="animar-mensagem mt-5 max-w-md text-lg leading-relaxed text-creme-100/80"
            style={{ animationDelay: "400ms" }}
          >
            {painel.texto}
          </p>
        </div>

        <ViewTransition name="cartao-acesso" share="morph" default="none">
          <div className="textura-papel relative mx-auto w-full max-w-xl overflow-hidden rounded-[8px] bg-creme-50 text-tinta shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between bg-naipe-vermelho px-6 py-2.5 text-creme-50 sm:px-9">
              <span className="rotulo">{faixa}</span>
              <span className="rotulo opacity-80">só com convite</span>
            </div>
            <div className="p-6 sm:p-9">
              <h1 className="font-display text-4xl leading-tight font-medium [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-5xl">
                {titulo}
              </h1>
              <p className="mt-2 text-tinta-suave">{descricao}</p>
              <div className="mt-8">{children}</div>
              <div className="mt-8 border-t-2 border-dashed border-tinta/25 pt-5 text-center text-tinta-suave">
                {rodape}
              </div>
            </div>
          </div>
        </ViewTransition>
      </div>
    </TransicaoPagina>
  );
}

function LequeCartas({ cartas }: { cartas: CartaVisual[] }) {
  const meio = (cartas.length - 1) / 2;
  return (
    <div aria-hidden className="relative h-52 w-96">
      {cartas.map((carta, i) => (
        <span
          key={`${carta.valor}${carta.naipe}`}
          className="absolute bottom-0 left-1/2 -ml-14 origin-[50%_120%] transition-transform duration-500 ease-(--ease-mola) hover:-translate-y-4"
          style={
            {
              "--angulo": `${(i - meio) * 11}deg`,
              animation: `abrir-leque 0.9s var(--ease-mola) ${150 + i * 90}ms both`,
            } as CSSProperties
          }
        >
          <Carta carta={carta} largura="7rem" />
        </span>
      ))}
    </div>
  );
}
