import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";

export default function LayoutSite({ children }: LayoutProps<"/">) {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Rodape />
    </>
  );
}
