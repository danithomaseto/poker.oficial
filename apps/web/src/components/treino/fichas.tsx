/**
 * Pilha de fichas com cores por valor, como numa mesa de verdade.
 * Só representa o valor que veio do estado do jogo: não arredonda nem inventa fichas.
 */
const DENOMINACOES = [
  { valor: 5000, cor: "#d9792b", borda: "#f3c08f" },
  { valor: 1000, cor: "#d8b13a", borda: "#f5e3a2" },
  { valor: 500, cor: "#6b3fa0", borda: "#c7b0e6" },
  { valor: 100, cor: "#1b1d1f", borda: "#d8d2c2" },
  { valor: 25, cor: "#1f7a4d", borda: "#bfe3cd" },
  { valor: 5, cor: "#b5332f", borda: "#f2c1bd" },
  { valor: 1, cor: "#ece6d6", borda: "#8a846f" },
] as const;

/** Até 3 colunas com até 5 fichas cada, das maiores para as menores. */
function decompor(valor: number) {
  const colunas: { cor: string; borda: string; quantidade: number }[] = [];
  let resto = valor;
  for (const d of DENOMINACOES) {
    const n = Math.floor(resto / d.valor);
    if (n > 0) {
      colunas.push({ cor: d.cor, borda: d.borda, quantidade: Math.min(5, n) });
      resto -= n * d.valor;
    }
    if (colunas.length === 3) break;
  }
  return colunas;
}

export function PilhaFichas({ valor, tamanho }: { valor: number; tamanho: number }) {
  const colunas = decompor(valor);
  const altura = tamanho * 0.32;
  return (
    <span aria-hidden className="flex items-end" style={{ gap: tamanho * 0.08 }}>
      {colunas.map((c, i) => (
        <span key={i} className="relative" style={{ width: tamanho, height: altura * (c.quantidade - 1) * 0.55 + tamanho * 0.62 }}>
          {Array.from({ length: c.quantidade }, (_, k) => (
            <span
              key={k}
              className="absolute left-0 rounded-[50%]"
              style={{
                bottom: k * altura * 0.55,
                width: tamanho,
                height: tamanho * 0.62,
                background: `radial-gradient(circle at 50% 40%, ${c.cor} 0 38%, ${c.borda} 39% 46%, ${c.cor} 47%)`,
                boxShadow: `0 ${tamanho * 0.08}px 0 rgba(0,0,0,0.55), inset 0 -${tamanho * 0.06}px 0 rgba(0,0,0,0.25)`,
                outline: `${Math.max(1, tamanho * 0.05)}px dashed ${c.borda}`,
                outlineOffset: -tamanho * 0.12,
              }}
            />
          ))}
        </span>
      ))}
    </span>
  );
}
