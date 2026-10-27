import { atraso } from "../animacao";
import { CabecalhoSecao } from "./cabecalho-secao";

type Prato = { nome: string; detalhe: string; descricao: string };

const jaNaMesa: Prato[] = [
  {
    nome: "Treino contra bots",
    detalhe: "fácil a extremo",
    descricao: "Seis mesas da casa ou a sua, de 2 a 9 lugares. Roda no seu aparelho e não conta na conta online.",
  },
  {
    nome: "Texas Hold'em No-Limit",
    detalhe: "regra oficial",
    descricao: "Blinds, all-in, side pots, empate com ficha ímpar, heads-up certinho. Motor testado com 48 testes.",
  },
  {
    nome: "Carteirinha de sócio",
    detalhe: "seu boneco",
    descricao: "Nome na mesa e visual em camadas. Aparece no lobby e na sua cadeira.",
  },
  {
    nome: "Entrada por convite",
    detalhe: "uso único",
    descricao: "Cada código é de uma pessoa só. O dono gera, revoga e pode tirar o acesso de quem precisar.",
  },
  {
    nome: "Preferências",
    detalhe: "baralho de 4 cores",
    descricao: "Bots rápidos, dicas de treino, próxima mão automática e menos animação.",
  },
];

const chegando: Prato[] = [
  { nome: "Mesas online", detalhe: "até 9 da turma", descricao: "Servidor dando as cartas, cada um vendo só as próprias." },
  { nome: "Chat na mesa", detalhe: "só texto", descricao: "Pra zoar o all-in alheio. A voz continua no Discord." },
  {
    nome: "Lugar guardado",
    detalhe: "3 minutos",
    descricao: "Caiu a internet? A cadeira espera e, na sua vez, passa ou desiste por você.",
  },
  { nome: "Controle do anfitrião", detalhe: "blinds e tempo", descricao: "Quem abre a mesa inicia, pausa e ajusta o ritmo." },
  { nome: "Lojinha", detalhe: "só visual", descricao: "Moeda ganha jogando vira roupa e acessório. Nada que mude o jogo." },
  { nome: "Tutorial jogando", detalhe: "passo a passo", descricao: "Mãos prontas que explicam cada decisão." },
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
          descricao="O que já dá para usar hoje e o que ainda está no forno. Sem promessa de enfeite: o que está na lista da esquerda funciona."
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20 2xl:gap-32">
          <Lista titulo="Já na mesa" nota="disponível" pratos={jaNaMesa} atrasoBase={0} />
          <Lista titulo="Saindo da cozinha" nota="próximas etapas" pratos={chegando} atrasoBase={150} />
        </div>
      </div>
    </section>
  );
}
