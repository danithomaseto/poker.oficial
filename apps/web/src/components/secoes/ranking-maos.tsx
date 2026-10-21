import { atraso } from "../animacao";
import { CabecalhoSecao } from "./cabecalho-secao";
import { RankingMaosInterativo } from "./ranking-maos-interativo";

export function RankingMaos() {
  return (
    <section id="cola" aria-labelledby="titulo-cola" className="papel textura-papel py-24 sm:py-32">
      <div className="conteiner relative">
        <CabecalhoSecao
          papel
          id="titulo-cola"
          numero="04"
          rotulo="A cola"
          titulo={
            <>
              Qual mão ganha? <span className="text-naipe-vermelho italic">Fica a cola.</span>
            </>
          }
          descricao="Da mais forte pra mais fraca. Passa o mouse ou toca numa mão pra ver as cartas na mesa."
        />
        <div data-revelar style={atraso(200)} className="mt-14">
          <RankingMaosInterativo />
        </div>
      </div>
    </section>
  );
}
