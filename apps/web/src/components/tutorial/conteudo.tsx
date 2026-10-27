"use client";

import type { ReactNode } from "react";
import type { IdModuloTutorial } from "@poker/progressao";
import { Desafio } from "./desafio";
import { MaoGuiada } from "./mao-guiada";
import { ComparaMaos, Explicacao, MaoEmCartas, MesaDidatica, Pergunta, QuemGanha, type PropsPasso } from "./passos";
import { ROTEIRO_ACOES, ROTEIRO_DESISTIR, ROTEIRO_ORDEM, ROTEIRO_PRATICA, ROTEIRO_RODADAS, estadoApos } from "./roteiros";

export interface Etapa {
  titulo: string;
  render: (p: PropsPasso) => ReactNode;
}

// Mesa de 4 com você no botão: no início da mão (vez do Caio) e no flop (vez do Rafa).
const PRE_FLOP = estadoApos(ROTEIRO_ORDEM, 0);
const NO_FLOP = estadoApos(ROTEIRO_ORDEM, 4);

const RANKING: { nome: string; cartas: string; texto: string }[] = [
  { nome: "Royal flush", cartas: "As Ks Qs Js Ts", texto: "A, K, Q, J e 10 do mesmo naipe. A mão perfeita." },
  { nome: "Straight flush", cartas: "9h 8h 7h 6h 5h", texto: "Cinco em sequência, todas do mesmo naipe." },
  { nome: "Quadra", cartas: "Kc Kd Kh Ks 2d", texto: "Quatro cartas do mesmo valor." },
  { nome: "Full house", cartas: "Qs Qd Qh 7c 7d", texto: "Uma trinca mais um par." },
  { nome: "Flush", cartas: "Ad 9d 7d 4d 2d", texto: "Cinco cartas do mesmo naipe, em qualquer ordem." },
  { nome: "Sequência", cartas: "Tc 9d 8h 7s 6c", texto: "Cinco valores seguidos, naipes misturados. O ás vale alto ou baixo (A-2-3-4-5)." },
  { nome: "Trinca", cartas: "8s 8h 8d Kc 3s", texto: "Três cartas do mesmo valor." },
  { nome: "Dois pares", cartas: "Jh Jc 4s 4d 9c", texto: "Dois pares diferentes." },
  { nome: "Par", cartas: "Ah Ad 9s 6c 3h", texto: "Duas cartas do mesmo valor." },
  { nome: "Carta alta", cartas: "As Jd 8c 5h 3d", texto: "Nada formado: vale a carta mais alta." },
];

function Lista({ itens }: { itens: [string, string][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {itens.map(([t, d]) => (
        <div key={t} className="rounded-(--radius-cartao) border border-borda bg-black/15 px-4 py-3">
          <dt className="font-semibold text-creme-50">{t}</dt>
          <dd className="mt-0.5 text-sm text-creme-300">{d}</dd>
        </div>
      ))}
    </dl>
  );
}

export const CONTEUDO: Record<IdModuloTutorial, Etapa[]> = {
  mesa: [
    {
      titulo: "Bem-vindo à mesa",
      render: (p) => (
        <Explicacao {...p} titulo="Uma mesa de Texas Hold'em">
          <p>
            Cada jogador recebe <strong>duas cartas fechadas</strong>, que só ele vê. No meio da mesa vão sair até{" "}
            <strong>cinco cartas comunitárias</strong>, que todos usam. As fichas apostadas vão para o <strong>pote</strong>, e
            o botão <strong>D</strong> (dealer) marca quem “dá as cartas” na mão e gira a cada rodada.
          </p>
          <p>Vamos achar cada parte numa mesa de verdade. Clique onde for pedido.</p>
        </Explicacao>
      ),
    },
    {
      titulo: "Suas cartas",
      render: (p) => (
        <MesaDidatica {...p} estado={NO_FLOP} alvo="suas-cartas" pergunta="Clique nas SUAS cartas." explicacaoCerta="Essas duas são só suas. Ninguém mais vê até o showdown." />
      ),
    },
    {
      titulo: "Cartas comunitárias",
      render: (p) => (
        <MesaDidatica {...p} estado={NO_FLOP} alvo="board" pergunta="Agora clique nas cartas COMUNITÁRIAS." explicacaoCerta="Isso é o “board”: as cartas da mesa, que todo mundo pode usar para montar a mão." />
      ),
    },
    {
      titulo: "O pote",
      render: (p) => (
        <MesaDidatica {...p} estado={NO_FLOP} alvo="pote" pergunta="Onde está o POTE?" explicacaoCerta="O pote junta todas as fichas apostadas na mão. Quem vencer leva tudo." />
      ),
    },
    {
      titulo: "O dealer",
      render: (p) => (
        <MesaDidatica {...p} estado={NO_FLOP} alvo="dealer" pergunta="Clique no botão do DEALER." explicacaoCerta="O botão D passa para o próximo jogador a cada mão: assim todos passam por todas as posições." />
      ),
    },
  ],

  objetivo: [
    {
      titulo: "Como se ganha",
      render: (p) => (
        <Explicacao {...p} titulo="Duas formas de levar o pote">
          <p>
            <strong>1. Ter a melhor mão no fim (showdown).</strong> Cada um monta a melhor combinação de{" "}
            <strong>5 cartas</strong> usando as 2 suas e as 5 da mesa (pode usar as duas, uma ou nenhuma das suas).
          </p>
          <p>
            <strong>2. Ficar sozinho.</strong> Se todos os outros desistirem, você leva o pote sem mostrar as cartas.
          </p>
          <p className="text-creme-300">Aqui as fichas são de mentira: o objetivo é aprender e se divertir.</p>
        </Explicacao>
      ),
    },
    {
      titulo: "Quantas cartas valem",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="No fim da mão, quantas cartas formam a sua mão?"
          opcoes={[
            { texto: "As 5 melhores entre as 7 (2 suas + 5 da mesa)", correta: true, explicacao: "Sempre 5 cartas: a melhor combinação possível." },
            { texto: "Só as 2 suas", correta: false, explicacao: "As cartas da mesa também contam: são de todos." },
            { texto: "Todas as 7", correta: false, explicacao: "Uma mão de poker tem sempre exatamente 5 cartas." },
          ]}
        />
      ),
    },
    {
      titulo: "Sua melhor mão",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Você tem A e K de copas. Qual é a sua melhor mão com esta mesa?"
          ilustracao={
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <p className="rotulo mb-1 text-creme-300">Suas</p>
                <MaoEmCartas texto="Ah Kh" largura="2.8rem" />
              </div>
              <div>
                <p className="rotulo mb-1 text-creme-300">Mesa</p>
                <MaoEmCartas texto="Qh Jh 2c 7h 3s" largura="2.8rem" />
              </div>
            </div>
          }
          opcoes={[
            { texto: "Par de damas", correta: false, explicacao: "Ninguém formou par aqui: olhe os naipes." },
            { texto: "Flush de copas, ás alto", correta: true, explicacao: "A♥ K♥ + Q♥ J♥ 7♥: cinco copas. Faltou só o 10♥ para o royal flush!" },
            { texto: "Sequência", correta: false, explicacao: "Para a sequência faltaria um 10. Mas tem coisa melhor: conte as copas." },
          ]}
        />
      ),
    },
    {
      titulo: "Todos desistiram",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Você apostou e todos os outros desistiram. O que acontece?"
          opcoes={[
            { texto: "Vamos ao showdown para comparar as mãos", correta: false, explicacao: "Showdown só acontece com dois ou mais jogadores no fim." },
            { texto: "Você leva o pote, sem precisar mostrar as cartas", correta: true, explicacao: "Por isso uma aposta pode ganhar mesmo sem a melhor mão (é o blefe)." },
            { texto: "O pote fica para a próxima mão", correta: false, explicacao: "O pote sempre tem dono no fim da mão." },
          ]}
        />
      ),
    },
  ],

  ranking: [
    {
      titulo: "Da mais forte à mais fraca",
      render: (p) => (
        <Explicacao {...p} titulo="Ranking das mãos">
          <ol className="grid gap-2 lg:grid-cols-2">
            {RANKING.map((r, i) => (
              <li key={r.nome} className="flex items-center gap-3 rounded-(--radius-cartao) border border-borda bg-black/15 px-3 py-2">
                <span className="w-5 shrink-0 text-right font-mono text-sm text-creme-500">{i + 1}</span>
                <MaoEmCartas texto={r.cartas} largura="1.9rem" />
                <span className="min-w-0">
                  <span className="block font-semibold text-creme-50">{r.nome}</span>
                  <span className="block text-xs text-creme-300">{r.texto}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-creme-300">
            Empate de categoria? Ganha quem tem as cartas mais altas dentro dela, e depois a carta de desempate (o “kicker”).
          </p>
        </Explicacao>
      ),
    },
    {
      titulo: "Compare",
      render: (p) => (
        <ComparaMaos
          {...p}
          pares={[
            ["Ad 9d 7d 4d 2d", "Tc 9d 8h 7s 6c"],
            ["Jh Jc 4s 4d 9c", "8s 8h 8d Kc 3s"],
            ["Qs Qd Qh 7c 7d", "Ah Kh Jh 9h 4h"],
            ["Ah Ad 9s 6c 3h", "As Ac Kd 4h 2c"],
            ["Tc 9d 8h 7s 6c", "Th 9s 8c 7d 6h"],
          ]}
        />
      ),
    },
  ],

  ordem: [
    {
      titulo: "Blinds e ordem",
      render: (p) => (
        <Explicacao {...p} titulo="Quem paga e quem fala">
          <p>
            Antes das cartas, os dois jogadores depois do dealer (no sentido horário) colocam apostas obrigatórias: o{" "}
            <strong>small blind</strong> (metade) e o <strong>big blind</strong> (valor cheio). Isso garante que sempre tem algo em
            disputa.
          </p>
          <p>
            <strong>Pré-flop:</strong> começa quem está logo depois do big blind. <strong>Flop, turn e river:</strong> começa o
            primeiro jogador ainda na mão depois do dealer. O dealer fala por último, e por isso é a melhor posição.
          </p>
        </Explicacao>
      ),
    },
    {
      titulo: "Small blind",
      render: (p) => (
        <MesaDidatica {...p} estado={PRE_FLOP} alvo="small-blind" pergunta="Você é o dealer nesta mão. Clique no SMALL BLIND." explicacaoCerta="O small blind é o primeiro depois do dealer e paga metade do big blind (10)." />
      ),
    },
    {
      titulo: "Big blind",
      render: (p) => (
        <MesaDidatica {...p} estado={PRE_FLOP} alvo="big-blind" pergunta="Agora o BIG BLIND." explicacaoCerta="O big blind vem logo depois e paga a aposta cheia (20)." />
      ),
    },
    {
      titulo: "Primeiro no pré-flop",
      render: (p) => (
        <MesaDidatica
          {...p}
          estado={PRE_FLOP}
          alvo={`jogador-${PRE_FLOP.vez!}`}
          pergunta="Quem fala PRIMEIRO antes do flop? Clique no jogador."
          dica="No pré-flop começa quem está logo DEPOIS do big blind, seguindo o sentido horário."
          explicacaoCerta="Isso: o Caio está logo depois do big blind. Depois dele vem você e por fim os blinds."
        />
      ),
    },
    {
      titulo: "Primeiro no flop",
      render: (p) => (
        <MesaDidatica
          {...p}
          estado={NO_FLOP}
          alvo={`jogador-${NO_FLOP.vez!}`}
          pergunta="Todos pagaram e saiu o flop. Quem fala PRIMEIRO agora?"
          dica="Depois do flop começa o primeiro jogador ainda na mão DEPOIS do dealer (você)."
          explicacaoCerta="Depois do flop a ordem recomeça logo após o dealer: o small blind (Rafa). Você fala por último."
        />
      ),
    },
  ],

  acoes: [
    {
      titulo: "As seis ações",
      render: (p) => (
        <Explicacao {...p} titulo="O que você pode fazer na sua vez">
          <Lista
            itens={[
              ["Desistir", "Larga a mão e não arrisca mais nada. As fichas já apostadas ficam no pote."],
              ["Passar", "Continua sem apostar. Só quando ninguém apostou na rodada."],
              ["Pagar", "Iguala a aposta de quem apostou antes."],
              ["Apostar", "Coloca as primeiras fichas da rodada."],
              ["Aumentar", "Sobe a aposta de alguém. O aumento mínimo é o tamanho do último aumento."],
              ["All-in", "Coloca todas as suas fichas. Nunca dá para perder mais do que se tem."],
            ]}
          />
        </Explicacao>
      ),
    },
    {
      titulo: "Ninguém apostou",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Ninguém apostou ainda nesta rodada. Qual ação NÃO está disponível para você?"
          opcoes={[
            { texto: "Passar", correta: false, explicacao: "Passar é justamente o que dá para fazer quando ninguém apostou." },
            { texto: "Pagar", correta: true, explicacao: "Não há aposta para igualar: você pode passar ou apostar." },
            { texto: "Apostar", correta: false, explicacao: "Sem aposta na rodada, você pode ser o primeiro a apostar." },
          ]}
        />
      ),
    },
    {
      titulo: "Aumento mínimo",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="O big blind é 20 e ninguém aumentou. Qual é o menor aumento possível?"
          opcoes={[
            { texto: "Para 21", correta: false, explicacao: "O aumento precisa ser pelo menos do tamanho da última aposta (20)." },
            { texto: "Para 30", correta: false, explicacao: "Aumentar 10 é menos que a aposta atual de 20." },
            { texto: "Para 40", correta: true, explicacao: "20 do big blind + um aumento de pelo menos 20 = 40." },
          ]}
        />
      ),
    },
    { titulo: "Pratique: desistir", render: (p) => <MaoGuiada {...p} roteiro={ROTEIRO_DESISTIR} /> },
    { titulo: "Pratique: as outras ações", render: (p) => <MaoGuiada {...p} roteiro={ROTEIRO_ACOES} /> },
  ],

  rodadas: [
    {
      titulo: "As quatro rodadas",
      render: (p) => (
        <Explicacao {...p} titulo="Uma mão em quatro rodadas de apostas">
          <Lista
            itens={[
              ["Pré-flop", "Cada um com suas 2 cartas, nada na mesa ainda. Primeira rodada de apostas."],
              ["Flop", "Saem 3 cartas comunitárias de uma vez. Nova rodada de apostas."],
              ["Turn", "Sai a 4ª carta. Mais uma rodada."],
              ["River", "Sai a 5ª e última carta. Última rodada; depois, showdown."],
            ]}
          />
          <p className="text-creme-300">Em toda rodada, quem quiser continuar precisa igualar a maior aposta.</p>
        </Explicacao>
      ),
    },
    { titulo: "Jogue as quatro rodadas", render: (p) => <MaoGuiada {...p} roteiro={ROTEIRO_RODADAS} /> },
    {
      titulo: "Revisão",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Quantas cartas saem no flop, no turn e no river?"
          opcoes={[
            { texto: "1, 1 e 1", correta: false, explicacao: "O flop é especial: sai mais de uma de uma vez." },
            { texto: "3, 1 e 1", correta: true, explicacao: "3 no flop, 1 no turn e 1 no river: 5 cartas comunitárias." },
            { texto: "2, 2 e 1", correta: false, explicacao: "Lembre da mão que você jogou: quantas saíram juntas no começo?" },
          ]}
        />
      ),
    },
  ],

  pratica: [
    {
      titulo: "Antes de jogar",
      render: (p) => (
        <Explicacao {...p} titulo="Uma mão do começo ao fim">
          <p>
            Agora junta tudo: posição, força da mão e ações. Você vai jogar uma mão forte. A cada decisão aparece uma dica;
            se errar, o tutorial explica e você tenta de novo.
          </p>
        </Explicacao>
      ),
    },
    { titulo: "Jogue a mão", render: (p) => <MaoGuiada {...p} roteiro={ROTEIRO_PRATICA} /> },
  ],

  vencedor: [
    {
      titulo: "O showdown",
      render: (p) => (
        <Explicacao {...p} titulo="Quem leva o pote">
          <p>
            Se dois ou mais jogadores chegam ao fim, as cartas são abertas: é o <strong>showdown</strong>. Cada um usa as 5
            melhores cartas entre as 7. Ganha a mão mais alta no ranking.
          </p>
          <p>
            Se as cinco melhores cartas tiverem o mesmo valor, o pote é <strong>dividido</strong>. O naipe nunca desempata.
          </p>
        </Explicacao>
      ),
    },
    {
      titulo: "Desempate pelo kicker",
      render: (p) => <QuemGanha {...p} board="Ks Qd 7h 4c 2s" maos={[{ nome: "Rafa", cartas: "Ah Kd" }, { nome: "Bia", cartas: "Kc Js" }]} />,
    },
    {
      titulo: "Flush contra sequência",
      render: (p) => <QuemGanha {...p} board="Th Jh Qh 3s 8c" maos={[{ nome: "Rafa", cartas: "Ad Ks" }, { nome: "Bia", cartas: "9h 2h" }]} />,
    },
    {
      titulo: "Pote dividido",
      render: (p) => <QuemGanha {...p} board="9h 9d 5s 5c Ah" maos={[{ nome: "Rafa", cartas: "Kc Jd" }, { nome: "Bia", cartas: "Ks Td" }]} />,
    },
    {
      titulo: "Três no showdown",
      render: (p) => (
        <QuemGanha
          {...p}
          board="6s 6h 6d Kc 3c"
          maos={[
            { nome: "Rafa", cartas: "Kh 2d" },
            { nome: "Bia", cartas: "Ac Ad" },
            { nome: "Caio", cartas: "6c 4s" },
          ]}
        />
      ),
    },
    {
      titulo: "All-in com menos fichas",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Você foi all-in com 200. Dois rivais apostaram 1.000 cada. Você tem a melhor mão. Quanto você leva?"
          opcoes={[
            { texto: "2.200, o pote todo", correta: false, explicacao: "Você só disputa o que conseguiu cobrir." },
            { texto: "600: 200 seus + 200 de cada rival", correta: true, explicacao: "O resto vira um pote paralelo (side pot) disputado só entre os dois rivais." },
            { texto: "200, só o que você apostou", correta: false, explicacao: "Você ganha também o que os rivais colocaram até o seu valor." },
          ]}
        />
      ),
    },
  ],

  estrategia: [
    {
      titulo: "Quatro ideias básicas",
      render: (p) => (
        <Explicacao {...p} titulo="Estratégia para começar bem">
          <Lista
            itens={[
              ["Posição", "Falar por último é vantagem: você vê o que os outros fizeram. O dealer é a melhor posição."],
              ["Força da mão", "Jogue poucas mãos iniciais, mas jogue-as com vontade. Pares altos e cartas altas do mesmo naipe são boas."],
              ["Tamanho da aposta", "Apostas entre metade e três quartos do pote costumam funcionar bem."],
              ["Risco", "Pagar só vale se a chance de ganhar for maior que o preço. E não arrisque tudo com mão média."],
            ]}
          />
        </Explicacao>
      ),
    },
    {
      titulo: "Posição",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Depois do flop, qual é a melhor posição da mesa?"
          opcoes={[
            { texto: "Small blind", correta: false, explicacao: "O small blind fala primeiro depois do flop: é a pior posição." },
            { texto: "Dealer (botão)", correta: true, explicacao: "O dealer fala por último em todas as rodadas depois do flop." },
            { texto: "Tanto faz", correta: false, explicacao: "Posição é uma das maiores vantagens do poker." },
          ]}
        />
      ),
    },
    {
      titulo: "Mão inicial",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Qual destas mãos iniciais é a mais forte?"
          opcoes={[
            { texto: <MaoEmCartas texto="Jc 4d" largura="2.2rem" />, correta: false, explicacao: "Uma carta alta e uma baixa, de naipes diferentes: fraca." },
            { texto: <MaoEmCartas texto="As Ks" largura="2.2rem" />, correta: true, explicacao: "Ás e rei do mesmo naipe: uma das melhores mãos iniciais." },
            { texto: <MaoEmCartas texto="8h 5c" largura="2.2rem" />, correta: false, explicacao: "Cartas baixas e separadas: raramente vale jogar." },
          ]}
        />
      ),
    },
    {
      titulo: "Tamanho da aposta",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="O pote tem 200 e você tem uma boa mão. Qual aposta faz mais sentido?"
          opcoes={[
            { texto: "10", correta: false, explicacao: "Pequena demais: qualquer um paga e o pote quase não cresce." },
            { texto: "Entre 100 e 150", correta: true, explicacao: "Metade a três quartos do pote: cobra caro de mãos piores sem assustar todo mundo." },
            { texto: "Todas as fichas, sempre", correta: false, explicacao: "All-in toda hora só é pago por quem tem mão melhor." },
          ]}
        />
      ),
    },
    {
      titulo: "Vale pagar?",
      render: (p) => (
        <Pergunta
          {...p}
          pergunta="Para pagar 50, o pote fica com 200. Quantas vezes você precisa ganhar para valer a pena?"
          opcoes={[
            { texto: "25% das vezes", correta: true, explicacao: "50 ÷ 200 = 25%. No treino, com dicas ligadas, essa conta aparece para você." },
            { texto: "50% das vezes", correta: false, explicacao: "Você arrisca 50 para ganhar um pote de 200: precisa de bem menos que metade." },
            { texto: "75% das vezes", correta: false, explicacao: "Seria verdade se o pote fosse pequeno perto da aposta. Aqui é o contrário." },
          ]}
        />
      ),
    },
  ],

  desafio: [
    {
      titulo: "O desafio",
      render: (p) => (
        <Explicacao {...p} titulo="Hora de jogar sozinho">
          <p>
            Três bots iniciantes, cartas embaralhadas de verdade, sem roteiro e sem dica obrigatória. Jogue 3 mãos completas.
            Ao fim de cada uma, o tutorial comenta suas decisões.
          </p>
          <p className="text-creme-300">Ganhar fichas não é o objetivo: o que conta é decidir com calma.</p>
        </Explicacao>
      ),
    },
    { titulo: "Jogue", render: (p) => <Desafio {...p} /> },
  ],
};
