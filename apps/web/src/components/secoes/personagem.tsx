import { atraso } from "../animacao";
import { CabecalhoSecao } from "./cabecalho-secao";
import { PersonagemDemo } from "./personagem-demo";

export function Personagem() {
  return (
    <section
      id="carteirinha"
      aria-labelledby="titulo-carteirinha"
      className="textura-feltro relative bg-mesa-700 py-24 sm:py-32"
    >
      <div className="conteiner relative grid gap-16 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center 2xl:gap-24">
        <div>
          <CabecalhoSecao
            id="titulo-carteirinha"
            numero="03"
            rotulo="Seu personagem"
            titulo={
              <>
                Faça sua <span className="text-ouro-300 italic">carteirinha</span> de sócio.
              </>
            }
            descricao="No primeiro acesso você escolhe nome e visual. É esse boneco que aparece no lobby e do lado da sua cadeira."
          />
          <dl
            data-revelar
            style={atraso(240)}
            className="mt-10 grid gap-4 border-l-2 border-ouro-400/40 pl-5 text-creme-100/85"
          >
            <div>
              <dt className="rotulo text-ouro-300">Nome</dt>
              <dd className="mt-1">De 3 a 20 caracteres, e ninguém do grupo pode ter igual.</dd>
            </div>
            <div>
              <dt className="rotulo text-ouro-300">Visual</dt>
              <dd className="mt-1">Só enfeite: não mexe em carta, ficha nem regra.</dd>
            </div>
          </dl>
        </div>

        <div data-revelar="direita" style={atraso(150)}>
          <PersonagemDemo />
        </div>
      </div>
    </section>
  );
}
