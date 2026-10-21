import type { ReactNode } from "react";
import { atraso } from "../animacao";

type Props = {
  numero: string;
  rotulo: string;
  titulo: ReactNode;
  descricao?: ReactNode;
  id: string;
  /** Em seções de papel o texto é tinta escura. */
  papel?: boolean;
  className?: string;
};

/**
 * Título de seção no estilo impresso: número e rótulo em mono sobre um fio,
 * título serifado grande alinhado à esquerda.
 */
export function CabecalhoSecao({ numero, rotulo, titulo, descricao, id, papel, className }: Props) {
  return (
    <header className={className}>
      <div
        data-revelar
        className={`rotulo flex items-center gap-4 border-t pt-3 ${papel ? "border-tinta/25 text-tinta-suave" : "border-ouro-400/35 text-ouro-300"}`}
      >
        <span className={papel ? "text-naipe-vermelho" : "text-creme-50"}>{numero}</span>
        <span>{rotulo}</span>
      </div>
      <h2
        id={id}
        data-revelar
        style={atraso(80)}
        className={`mt-6 max-w-4xl font-display text-4xl leading-[1.02] font-medium tracking-[-0.02em] text-balance [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl 2xl:text-7xl ${
          papel ? "text-tinta" : "text-creme-50"
        }`}
      >
        {titulo}
      </h2>
      {descricao && (
        <p
          data-revelar
          style={atraso(160)}
          className={`mt-5 max-w-2xl text-lg leading-relaxed ${papel ? "text-tinta-suave" : "text-creme-100/80"}`}
        >
          {descricao}
        </p>
      )}
    </header>
  );
}
