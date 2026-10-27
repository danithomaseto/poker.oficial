/** Indicador de carregamento padrão (Suspense, botões e painéis). */
export function Carregando({ texto = "Carregando…", className }: { texto?: string; className?: string }) {
  return (
    <p role="status" className={`flex items-center gap-3 text-creme-300 ${className ?? ""}`}>
      <span
        aria-hidden
        className="size-4 rounded-full border-2 border-creme-100/20 border-t-ouro-300"
        style={{ animation: "girar-indicador 0.8s linear infinite" }}
      />
      {texto}
    </p>
  );
}
