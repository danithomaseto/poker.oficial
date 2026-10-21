import { atraso } from "../animacao";
import { Avatar, type AparenciaDemo } from "../ilustracoes/avatar";
import { CabecalhoSecao } from "./cabecalho-secao";

/**
 * Dúvidas frequentes no formato de conversa de grupo: alguém pergunta, o dono da mesa
 * responde. Semanticamente é uma lista de definição (pergunta → resposta).
 */

type Amigo = { nome: string; aparencia: AparenciaDemo };

const amigos: Record<string, Amigo> = {
  bia: {
    nome: "Bia",
    aparencia: {
      pele: "#7c4a2d",
      cabelo: { estilo: "longo", cor: "#1d1410" },
      roupa: "#6d4bd8",
      acessorio: "brinco",
      fundo: "#22193a",
    },
  },
  caio: {
    nome: "Caio",
    aparencia: {
      pele: "#f6d3b3",
      cabelo: { estilo: "curto", cor: "#b5651d" },
      roupa: "#2f7dd1",
      acessorio: "nenhum",
      fundo: "#1d2b3a",
    },
  },
  duda: {
    nome: "Duda",
    aparencia: {
      pele: "#a8724d",
      cabelo: { estilo: "coque", cor: "#3b2219" },
      roupa: "#d14b6a",
      acessorio: "nenhum",
      fundo: "#3a1f2b",
    },
  },
  leo: {
    nome: "Léo",
    aparencia: {
      pele: "#eab98f",
      cabelo: { estilo: "curto", cor: "#e8c27a" },
      roupa: "#1f9d74",
      acessorio: "bone",
      fundo: "#0f3d2a",
    },
  },
  mari: {
    nome: "Mari",
    aparencia: {
      pele: "#d39a6a",
      cabelo: { estilo: "longo", cor: "#6b3e22" },
      roupa: "#e07b2d",
      acessorio: "oculos",
      fundo: "#2d2a1a",
    },
  },
  teo: {
    nome: "Teo",
    aparencia: {
      pele: "#56331f",
      cabelo: { estilo: "careca", cor: "#1d1410" },
      roupa: "#3a4048",
      acessorio: "oculos",
      fundo: "#1d2b3a",
    },
  },
};

const conversa: { de: keyof typeof amigos; pergunta: string; resposta: string }[] = [
  {
    de: "bia",
    pergunta: "precisa instalar alguma coisa?",
    resposta: "Nada. Abre o site, entra com sua conta e pronto. Versão nova chega sozinha.",
  },
  {
    de: "caio",
    pergunta: "quanto custa isso?",
    resposta: "Zero. E não tem pagamento nenhum dentro do jogo, nem vai ter.",
  },
  {
    de: "leo",
    pergunta: "e se eu ganhar tudo, recebo o quê?",
    resposta: "Moral. As fichas são de mentira: não vale dinheiro, não saca, não transfere.",
  },
  {
    de: "duda",
    pergunta: "como eu entro?",
    resposta: "Me pede um convite. É um código só seu, vale uma vez e fica preso na sua conta.",
  },
  {
    de: "mari",
    pergunta: "dá pra ver a carta dos outros?",
    resposta: "Não. O servidor só manda pra cada um as próprias cartas. Nem quem assiste vê.",
  },
  {
    de: "teo",
    pergunta: "e se minha internet cair no meio da mão?",
    resposta:
      "Sua cadeira fica guardada uns 3 minutos. Na sua vez o jogo passa ou desiste por você até voltar.",
  },
  {
    de: "bia",
    pergunta: "tem chat de voz?",
    resposta: "No jogo só texto. Voz é no Discord, por fora, do jeito que a gente já faz.",
  },
  {
    de: "caio",
    pergunta: "dá pra treinar sozinho antes?",
    resposta: "Vai dar: treino contra bots e tutorial estão no cardápio, rodando até sem internet.",
  },
];

export function Perguntas() {
  return (
    <section
      id="perguntas"
      aria-labelledby="titulo-perguntas"
      className="papel textura-papel py-24 sm:py-32"
    >
      <div className="conteiner relative grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] 2xl:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <CabecalhoSecao
            papel
            id="titulo-perguntas"
            numero="06"
            rotulo="Perguntas"
            titulo={
              <>
                O que sempre <span className="text-naipe-vermelho italic">perguntam no grupo.</span>
              </>
            }
            descricao="Juntamos aqui pra ninguém precisar perguntar de novo. (Vão perguntar mesmo assim.)"
          />
        </div>

        <div className="rounded-[10px] border-2 border-tinta bg-creme-50 shadow-[8px_8px_0_0_var(--color-tinta)]">
          <div className="flex items-center justify-between border-b-2 border-tinta px-5 py-3">
            <span className="font-display text-lg font-semibold">Poker da turma 🃏</span>
            <span className="rotulo text-tinta-suave">7 participantes</span>
          </div>
          <dl className="space-y-6 p-5 sm:p-7">
            {conversa.map((item, i) => {
              const amigo = amigos[item.de]!;
              return (
                <div key={item.pergunta} className="space-y-2">
                  <dt
                    data-revelar="esquerda"
                    style={atraso(i * 40)}
                    className="flex items-end gap-2.5"
                  >
                    <Avatar
                      aparencia={amigo.aparencia}
                      className="size-8 shrink-0 rounded-full border border-tinta/30"
                    />
                    <span className="max-w-[80%] rounded-[14px] rounded-bl-[3px] border border-tinta/15 bg-papel-escuro/60 px-4 py-2.5">
                      <span className="rotulo block text-naipe-vermelho">{amigo.nome}</span>
                      <span className="text-[1.02rem]">{item.pergunta}</span>
                    </span>
                  </dt>
                  <dd
                    data-revelar="direita"
                    style={atraso(i * 40 + 120)}
                    className="flex justify-end"
                  >
                    <span className="max-w-[85%] rounded-[14px] rounded-br-[3px] bg-mesa-700 px-4 py-2.5 text-creme-50">
                      <span className="rotulo block text-ouro-300">Dono da mesa</span>
                      <span className="text-[1.02rem] leading-relaxed">{item.resposta}</span>
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
