/** Crédito do autor com link para o Instagram. */
export const autor = {
  nome: "Daniel Thomaseto",
  instagram: "https://www.instagram.com/danithomaseto/",
};

/** Glifo de câmera (contorno arredondado + lente + flash) usado como ícone do Instagram. */
export function IconeInstagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Credito({ className }: { className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <span>
        Desenvolvido por <span className="text-creme-100">{autor.nome}</span>
      </span>
      <a
        href={autor.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram de ${autor.nome} (abre em nova aba)`}
        className="grid size-8 place-items-center rounded-[6px] border border-creme-100/25 text-creme-100 transition-[color,border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-ouro-300 hover:text-ouro-200"
      >
        <IconeInstagram className="size-4.5" />
      </a>
    </p>
  );
}
