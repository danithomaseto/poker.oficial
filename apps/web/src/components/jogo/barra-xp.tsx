import { tituloDoNivel, type SituacaoNivel } from "@poker/progressao";

/** Barra de XP padrão: nível, título e quanto falta para o próximo. */
export function BarraXp({ situacao, compacta }: { situacao: SituacaoNivel; compacta?: boolean }) {
  const pct = Math.round(situacao.fracao * 100);
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-2">
          <span className={`font-display text-ouro-200 ${compacta ? "text-lg" : "text-2xl"}`}>Nível {situacao.nivel}</span>
          <span className="truncate text-sm text-creme-300">{tituloDoNivel(situacao.nivel)}</span>
        </p>
        <p className="shrink-0 font-mono text-xs text-creme-300 tabular-nums">
          {situacao.maximo
            ? `${situacao.xpTotal.toLocaleString("pt-BR")} XP · nível máximo`
            : `${situacao.xpNoNivel.toLocaleString("pt-BR")} / ${situacao.xpParaProximo.toLocaleString("pt-BR")} XP`}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progresso até o próximo nível"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className={`mt-2 overflow-hidden rounded-full bg-creme-100/10 ${compacta ? "h-1.5" : "h-2.5"}`}
      >
        <span
          className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-ouro-500),var(--color-ouro-300))] transition-[width] duration-700 ease-(--ease-saida)"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!situacao.maximo && !compacta && (
        <p className="mt-1.5 text-xs text-creme-500">
          Faltam {(situacao.xpParaProximo - situacao.xpNoNivel).toLocaleString("pt-BR")} XP para o nível {situacao.nivel + 1}.
        </p>
      )}
    </div>
  );
}
