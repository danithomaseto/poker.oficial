import { atraso } from "../animacao";
import { CabecalhoSecao } from "./cabecalho-secao";

type Prato = { nome: string; detalhe: string; descricao: string };

const naEstreia: Prato[] = [
  {
    nome: "Texas Hold'em No-Limit",
    detalhe: "regra oficial",
    descricao:
      "Blinds, all-in, side pots, empate com ficha ímpar, heads-up certinho. Tudo testado antes da mesa abrir.",
  },
  {
    nome: "Mesa de até 9",
    detalhe: "do heads-up à cheia",
    descricao: "Quem senta no meio da mão entra na próxima.",
  },
  {
    nome: "Chat na mesa",
    detalhe: "só texto",
    descricao: "Pra zoar o all-in alheio. A voz continua no Discord.",
  },
  {
    nome: "Boneco 2D",
    detalhe: "só o nome é obrigatório",
    descricao: "Já vem um visual escolhido; muda quando quiser.",
  },
  {
    nome: "Lugar guardado",
    detalhe: "3 minutos",
    descricao: "Caiu a internet? A cadeira espera e, na sua vez, passa ou desiste por você.",
  },
  {
    nome: "Controle do anfitrião",
    detalhe: "blinds e tempo",
    descricao: "Quem abre a mesa inicia, pausa e ajusta o ritmo.",
  },
];

const depois: Prato[] = [
  {
    nome: "Treino contra bots",
    detalhe: "fácil a extremo",
    descricao: "Roda no navegador, até offline. Não conta na sua conta online.",
  },
  {
    nome: "Tutorial jogando",
    detalhe: "passo a passo",
    descricao: "Mãos prontas que explicam cada decisão.",
  },
  {
    nome: "Várias mesas",
    detalhe: "com plateia",
    descricao: "Quem só assiste nunca vê carta fechada de ninguém.",
  },
  {
    nome: "Lojinha",
    detalhe: "só visual",
    descricao: "Moeda ganha jogando vira roupa e acessório. Nada que mude o jogo.",
  },
  {
    nome: "Histórico de mãos",
    detalhe: "com replay",
    descricao: "Pra rever aquela mão que ninguém acreditou.",
  },
];

function Lista({
  titulo,
  nota,
  pratos,
  atrasoBase,
}: {
  titulo: string;
  nota: string;
  pratos: Prato[];
  atrasoBase: number;
}) {
  return (
    <div>
      <div
        data-revelar
        style={atraso(atrasoBase)}
        className="flex items-baseline justify-between border-b-2 border-tinta pb-3"
      >
        <h3 className="font-display text-2xl font-semibold italic sm:text-3xl">{titulo}</h3>
        <span className="rotulo text-tinta-suave">{nota}</span>
      </div>
      <ul className="divide-y divide-tinta/15">
        {pratos.map((prato, i) => (
          <li
            key={prato.nome}
            data-revelar
            style={atraso(atrasoBase + 80 + i * 60)}
            className="py-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex-nowrap">
              <span className="font-display text-xl font-semibold sm:text-[1.4rem]">
                {prato.nome}
              </span>
              <span aria-hidden className="pontilhado hidden sm:block" />
              <span className="rotulo basis-full text-naipe-vermelho sm:basis-auto sm:shrink-0">
                {prato.detalhe}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-[0.95rem] leading-relaxed text-tinta-suave">
              {prato.descricao}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Cardapio() {
  return (
    <section
      id="cardapio"
      aria-labelledby="titulo-cardapio"
      className="papel textura-papel py-24 sm:py-32"
    >
      <div className="conteiner relative">
        <CabecalhoSecao
          papel
          id="titulo-cardapio"
          numero="02"
          rotulo="O que tem na mesa"
          titulo={
            <>
              Cardápio <span className="text-naipe-vermelho italic">da casa.</span>
            </>
          }
          descricao="A estreia vem com o essencial bem feito: uma mesa online justa e que aguenta queda. O resto sai da cozinha aos poucos."
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20 2xl:gap-32">
          <Lista titulo="Servido na estreia" nota="mvp" pratos={naEstreia} atrasoBase={0} />
          <Lista titulo="Saindo da cozinha" nota="depois" pratos={depois} atrasoBase={150} />
        </div>
      </div>
    </section>
  );
}
