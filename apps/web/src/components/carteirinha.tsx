import type { ReactNode } from "react";
import { Avatar, type AparenciaDemo } from "./ilustracoes/avatar";

type Props = {
  nome: string;
  numero: number;
  aparencia: AparenciaDemo;
  desde: string;
  /** Saldo de moedas cosméticas; sem ele mostra o valor das fichas (sempre zero). */
  moedas?: number;
  /** Selo no topo (ex.: "Dono", "Banido"). */
  selo?: { texto: string; tom: "ouro" | "vermelho" | "neutro" } | null;
  inclinada?: boolean;
  /** Muda quando a aparência muda, para animar a troca. */
  chaveAnimacao?: string | number;
  rodape?: ReactNode;
  /** Versão menor, para colunas estreitas (lobby). */
  compacta?: boolean;
  className?: string;
};

/** Carteirinha de sócio: o "personagem" do jogador, usada no site, no lobby e no admin. */
export function Carteirinha({
  nome,
  numero,
  aparencia,
  desde,
  moedas,
  selo,
  inclinada,
  chaveAnimacao,
  rodape,
  compacta,
  className,
}: Props) {
  const tons = {
    ouro: "bg-ouro-300 text-tinta",
    vermelho: "bg-tinta text-creme-50",
    neutro: "bg-creme-100 text-tinta",
  } as const;
  return (
    <div
      className={`w-full ${inclinada ? "-rotate-2 transition-transform duration-700 ease-(--ease-mola) hover:rotate-0" : ""} ${className ?? ""}`}
    >
      <div className="textura-papel relative overflow-hidden rounded-[10px] bg-creme-50 text-tinta shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between gap-3 bg-naipe-vermelho px-5 py-2.5 text-creme-50">
          <span className="rotulo">Carteirinha de sócio</span>
          <span className="flex items-center gap-2">
            {selo && (
              <span className={`rotulo rounded-[3px] px-1.5 py-0.5 ${tons[selo.tom]}`}>
                {selo.texto}
              </span>
            )}
            <span className="rotulo tabular-nums">Nº {String(numero).padStart(4, "0")}</span>
          </span>
        </div>
        <div className={`m-2.5 grid grid-cols-[auto_1fr] border border-tinta/25 ${compacta ? "gap-3.5 p-3.5" : "gap-4 p-4 sm:gap-5 sm:p-5"}`}>
          <div
            key={chaveAnimacao}
            className={`animar-surgir overflow-hidden rounded-[6px] border-2 border-tinta ${compacta ? "size-20" : "size-24 sm:size-32"}`}
          >
            <Avatar
              aparencia={aparencia}
              className="size-full scale-[1.18]"
              titulo={`Personagem de ${nome}`}
            />
          </div>
          <dl className="grid min-w-0 content-center gap-3">
            <div className="min-w-0">
              <dt className="rotulo text-tinta-suave">Nome na mesa</dt>
              <dd
                key={`nome-${chaveAnimacao}`}
                className={`animar-mensagem truncate font-display leading-tight font-semibold ${compacta ? "text-xl" : "text-2xl sm:text-3xl"}`}
              >
                {nome}
              </dd>
            </div>
            <div className={`flex ${compacta ? "gap-4" : "gap-6"}`}>
              <div>
                <dt className="rotulo text-tinta-suave">Sócio desde</dt>
                <dd className="font-mono text-sm">{desde}</dd>
              </div>
              <div>
                <dt className="rotulo text-tinta-suave">
                  {moedas === undefined ? "Valor das fichas" : "Moedas"}
                </dt>
                <dd className="font-mono text-sm tabular-nums">
                  {moedas === undefined ? "R$ 0,00" : moedas.toLocaleString("pt-BR")}
                </dd>
              </div>
            </div>
          </dl>
        </div>
        {rodape ?? (
          <p
            aria-hidden
            className="truncate px-5 pb-3 font-mono text-[0.7rem] tracking-[0.5em] text-tinta/35"
          >
            ♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣♠♥♦♣
          </p>
        )}
      </div>
    </div>
  );
}
