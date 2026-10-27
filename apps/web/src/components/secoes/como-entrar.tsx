import { naipes, type Naipe } from "../baralho";
import { atraso } from "../animacao";
import { CabecalhoSecao } from "./cabecalho-secao";

type Passo = { numero: string; naipe: Naipe; titulo: string; texto: string; giro: string };

const passos: Passo[] = [
  {
    numero: "1",
    naipe: "espadas",
    titulo: "Receba o convite",
    texto:
      "Alguém do grupo te passa um código. Vale uma vez só e fica preso na sua conta: não dá pra repassar.",
    giro: "lg:-rotate-[5deg] lg:translate-y-6",
  },
  {
    numero: "2",
    naipe: "copas",
    titulo: "Faça seu boneco",
    texto:
      "Escolha o nome e o visual. Já vem uma aparência pronta, então um clique resolve. Dá pra mudar depois.",
    giro: "lg:rotate-0",
  },
  {
    numero: "3",
    naipe: "ouros",
    titulo: "Puxe a cadeira",
    texto:
      "Escolhe uma mesa e joga: o treino contra bots já está aberto. Pra falar, todo mundo no Discord, como já é hoje.",
    giro: "lg:rotate-[5deg] lg:translate-y-6",
  },
];

export function ComoEntrar() {
  return (
    <section
      id="como-entrar"
      aria-labelledby="titulo-como-entrar"
      className="textura-feltro relative bg-mesa-850 py-24 sm:py-32"
    >
      <div className="conteiner relative grid gap-16 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center">
        <CabecalhoSecao
          id="titulo-como-entrar"
          numero="01"
          rotulo="Como entrar"
          titulo={
            <>
              Três cartas <span className="text-ouro-300 italic">até a mesa.</span>
            </>
          }
          descricao="Não tem cadastro aberto nem gente estranha. Só entra quem recebeu convite de alguém do grupo."
        />

        <ol className="grid gap-5 sm:grid-cols-3 lg:gap-3">
          {passos.map((passo, i) => {
            const naipe = naipes[passo.naipe];
            const cor = naipe.vermelho ? "text-naipe-vermelho" : "text-tinta";
            return (
              <li
                key={passo.numero}
                data-revelar="virar"
                style={atraso(i * 150)}
                className="relative"
              >
                <article
                  className={`textura-papel group/carta relative flex min-h-[24rem] flex-col rounded-[14px] border border-black/10 bg-creme-50 p-5 text-tinta shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)] transition-[rotate,translate] duration-500 ease-(--ease-mola) hover:z-10 hover:-translate-y-4 hover:rotate-0 xl:p-7 ${passo.giro}`}
                >
                  {/* Índices nos cantos, como numa carta de baralho */}
                  <span
                    aria-hidden
                    className={`flex w-fit flex-col items-center font-display leading-none font-semibold ${cor}`}
                  >
                    <span className="text-3xl xl:text-4xl">{passo.numero}</span>
                    <span className="text-xl xl:text-2xl">{naipe.simbolo}</span>
                  </span>
                  <span
                    aria-hidden
                    className={`absolute right-5 bottom-5 flex rotate-180 flex-col items-center font-display leading-none font-semibold xl:right-7 xl:bottom-7 ${cor}`}
                  >
                    <span className="text-3xl xl:text-4xl">{passo.numero}</span>
                    <span className="text-xl xl:text-2xl">{naipe.simbolo}</span>
                  </span>

                  <div className="mt-auto mb-auto px-1 pt-4 pb-12">
                    <span
                      aria-hidden
                      className={`block font-display text-6xl leading-none xl:text-7xl ${cor}`}
                    >
                      {naipe.simbolo}
                    </span>
                    <h3 className="mt-4 font-display text-2xl leading-tight font-semibold xl:text-[1.7rem]">
                      <span className="sr-only">Passo {passo.numero}: </span>
                      {passo.titulo}
                    </h3>
                    <p className="mt-2 text-[0.92rem] leading-snug text-tinta-suave">
                      {passo.texto}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
