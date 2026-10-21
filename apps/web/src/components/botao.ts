/**
 * Classes de botão compartilhadas por <button> e <Link>.
 * Botões "físicos": cantos pouco arredondados e uma borda inferior que afunda no clique,
 * como uma tecla ou uma ficha sendo empurrada.
 */
type Variante = "primario" | "secundario" | "tinta" | "fantasma";
type Tamanho = "md" | "lg";

const base =
  "group/botao relative inline-flex items-center justify-center gap-2 rounded-[5px] font-semibold whitespace-nowrap transition-[translate,background-color,border-color,color,border-bottom-width] duration-150 disabled:pointer-events-none disabled:opacity-60";

const variantes: Record<Variante, string> = {
  primario:
    "border border-b-[3px] border-ouro-600 bg-ouro-300 text-tinta hover:bg-ouro-200 active:translate-y-[2px] active:border-b",
  secundario:
    "border border-b-[3px] border-creme-100/35 text-creme-50 hover:border-creme-100/70 hover:bg-creme-100/5 active:translate-y-[2px] active:border-b",
  tinta:
    "border border-b-[3px] border-black bg-tinta text-creme-50 hover:bg-mesa-800 active:translate-y-[2px] active:border-b",
  fantasma: "text-creme-100 underline-offset-4 hover:text-ouro-200 hover:underline",
};

const tamanhos: Record<Tamanho, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-13 px-6 text-base",
};

export function classesBotao(variante: Variante = "primario", tamanho: Tamanho = "md"): string {
  return `${base} ${variantes[variante]} ${tamanhos[tamanho]}`;
}
