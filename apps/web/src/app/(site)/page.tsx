import { TransicaoPagina } from "@/components/transicao-pagina";
import { Cardapio } from "@/components/secoes/cardapio";
import { ComoEntrar } from "@/components/secoes/como-entrar";
import { ConviteFinal } from "@/components/secoes/convite-final";
import { Heroi } from "@/components/secoes/heroi";
import { Perguntas } from "@/components/secoes/perguntas";
import { Personagem } from "@/components/secoes/personagem";
import { RankingMaos } from "@/components/secoes/ranking-maos";
import { RegrasDaCasa } from "@/components/secoes/regras-da-casa";

/** Página inicial: alterna seções de feltro (escuras) e de papel cartão (claras). */
export default function PaginaInicial() {
  return (
    <TransicaoPagina>
      <div>
        <Heroi />
        <ComoEntrar />
        <Cardapio />
        <Personagem />
        <RankingMaos />
        <RegrasDaCasa />
        <Perguntas />
        <ConviteFinal />
      </div>
    </TransicaoPagina>
  );
}
