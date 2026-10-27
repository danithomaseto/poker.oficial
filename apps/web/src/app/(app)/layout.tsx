import { ProvedorAvisos } from "@/components/avisos";

/** Páginas do jogo: fundo de feltro de ponta a ponta e notificações compartilhadas. */
export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <ProvedorAvisos>
      <div className="textura-feltro relative flex min-h-dvh flex-col bg-mesa-700">{children}</div>
    </ProvedorAvisos>
  );
}
