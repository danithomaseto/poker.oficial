/** Páginas do jogo: fundo de feltro de ponta a ponta. */
export default function LayoutApp({ children }: LayoutProps<"/">) {
  return <div className="textura-feltro relative flex min-h-dvh flex-col bg-mesa-700">{children}</div>;
}
