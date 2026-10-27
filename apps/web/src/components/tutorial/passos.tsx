"use client";

import { useState, type ReactNode } from "react";
import { avaliar, cartas, categoriaDe, descreverMao, melhoresCinco, type EstadoMao } from "@poker/engine";
import { Carta } from "../carta";
import { paraVisual } from "../treino/mesa-jogo";
import { formatarFichas } from "../treino/textos";

/** Toda etapa recebe `aoConcluir`: só depois dela o botão "Continuar" do módulo libera. */
export interface PropsPasso {
  aoConcluir: () => void;
  concluido: boolean;
}

/* ------------------------------------------------------------------ */
/* Explicação curta (única etapa que dá para pular)                     */
/* ------------------------------------------------------------------ */

export function Explicacao({ titulo, children, aoConcluir, concluido }: PropsPasso & { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-2xl text-creme-50">{titulo}</h3>
      <div className="space-y-3 leading-relaxed text-creme-100/90">{children}</div>
      {!concluido && (
        <button type="button" onClick={aoConcluir} className="rotulo rounded-(--radius-controle) border border-borda-forte px-4 py-2 text-creme-100 hover:border-creme-100/60">
          Entendi
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pergunta de múltipla escolha com feedback imediato                   */
/* ------------------------------------------------------------------ */

export interface Opcao {
  texto: ReactNode;
  correta: boolean;
  /** Explicação mostrada ao escolher (certa ou errada). */
  explicacao: string;
}

export function Pergunta({
  pergunta,
  opcoes,
  ilustracao,
  aoConcluir,
  concluido,
}: PropsPasso & { pergunta: ReactNode; opcoes: Opcao[]; ilustracao?: ReactNode }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const atual = escolha === null ? null : opcoes[escolha]!;
  return (
    <div className="space-y-4">
      <p className="font-display text-xl leading-snug text-creme-50">{pergunta}</p>
      {ilustracao}
      <div role="radiogroup" className="grid gap-2">
        {opcoes.map((o, i) => {
          const marcado = escolha === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={marcado}
              disabled={concluido && !o.correta}
              onClick={() => {
                setEscolha(i);
                if (o.correta) aoConcluir();
              }}
              className={`rounded-(--radius-cartao) border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                marcado
                  ? o.correta
                    ? "border-sucesso bg-sucesso/15 text-creme-50"
                    : "border-perigo bg-perigo/10 text-creme-50"
                  : "border-borda text-creme-100 hover:border-borda-forte"
              }`}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
      {atual && (
        <p role="status" className={`animar-aviso rounded-(--radius-cartao) border-l-4 px-4 py-2.5 text-sm ${atual.correta ? "border-sucesso bg-sucesso/10 text-creme-50" : "border-perigo bg-perigo/10 text-perigo-claro"}`}>
          {atual.correta ? "Isso! " : "Ainda não. "}
          {atual.explicacao}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Qual mão ganha? (comparado pelo avaliador do motor)                  */
/* ------------------------------------------------------------------ */

export function MaoEmCartas({ texto, largura = "3.4rem" }: { texto: string; largura?: string }) {
  return (
    <span className="flex gap-1">
      {cartas(texto).map((c) => (
        <Carta key={c} carta={paraVisual(c)} largura={largura} />
      ))}
    </span>
  );
}

export function ComparaMaos({ pares, aoConcluir, concluido }: PropsPasso & { pares: [string, string][] }) {
  const [rodada, setRodada] = useState(0);
  const [resposta, setResposta] = useState<{ certa: boolean; texto: string } | null>(null);
  const par = pares[Math.min(rodada, pares.length - 1)]!;
  const a = avaliar(cartas(par[0]));
  const b = avaliar(cartas(par[1]));
  const certo: "a" | "b" | "empate" = a > b ? "a" : b > a ? "b" : "empate";

  const responder = (r: "a" | "b" | "empate") => {
    const ok = r === certo;
    const motivo =
      certo === "empate"
        ? "As duas mãos têm exatamente o mesmo valor: o pote é dividido."
        : `A mão ${certo.toUpperCase()} vence.`;
    setResposta({ certa: ok, texto: ok ? motivo : `${motivo} Tente a próxima com calma.` });
    if (ok && rodada === pares.length - 1) aoConcluir();
  };

  return (
    <div className="space-y-4">
      <p className="rotulo text-creme-300">
        Rodada {Math.min(rodada + 1, pares.length)} de {pares.length}
      </p>
      <p className="font-display text-xl text-creme-50">Qual mão vence?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["a", "b"] as const).map((lado, i) => (
          <button
            key={lado}
            type="button"
            disabled={!!resposta?.certa}
            onClick={() => responder(lado)}
            className="flex flex-col items-start gap-2 rounded-(--radius-cartao) border border-borda p-3 transition-colors hover:border-borda-forte"
          >
            <span className="rotulo text-creme-300">Mão {lado.toUpperCase()}</span>
            <MaoEmCartas texto={par[i]!} largura="2.8rem" />
          </button>
        ))}
      </div>
      <button type="button" disabled={!!resposta?.certa} onClick={() => responder("empate")} className="rotulo rounded-(--radius-controle) border border-borda px-4 py-2 text-creme-100 hover:border-borda-forte">
        Empate
      </button>
      {resposta && (
        <div role="status" className={`animar-aviso flex flex-wrap items-center justify-between gap-3 rounded-(--radius-cartao) border-l-4 px-4 py-2.5 text-sm ${resposta.certa ? "border-sucesso bg-sucesso/10 text-creme-50" : "border-perigo bg-perigo/10 text-perigo-claro"}`}>
          <span>{resposta.texto}</span>
          {resposta.certa && rodada < pares.length - 1 && (
            <button
              type="button"
              onClick={() => {
                setRodada((r) => r + 1);
                setResposta(null);
              }}
              className="rotulo rounded-(--radius-controle) bg-creme-100 px-3 py-1.5 text-tinta"
            >
              Próxima
            </button>
          )}
          {!resposta.certa && (
            <button type="button" onClick={() => setResposta(null)} className="rotulo rounded-(--radius-controle) border border-perigo/50 px-3 py-1.5">
              Tentar de novo
            </button>
          )}
        </div>
      )}
      {concluido && <p className="text-sm text-creme-300">Comparação feita pelo mesmo avaliador usado nas mesas.</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mesa didática: um estado REAL do motor, com partes clicáveis         */
/* ------------------------------------------------------------------ */

export type ParteMesa = "suas-cartas" | "board" | "pote" | "dealer" | "small-blind" | "big-blind" | `jogador-${number}`;

const POSICOES = [
  { x: 50, y: 86 },
  { x: 10, y: 50 },
  { x: 50, y: 12 },
  { x: 90, y: 50 },
];

export function MesaDidatica({
  estado,
  alvo,
  pergunta,
  aoConcluir,
  concluido,
  explicacaoCerta,
  dica,
}: PropsPasso & { estado: EstadoMao; alvo: ParteMesa; pergunta: string; explicacaoCerta: string; dica?: string }) {
  const [erro, setErro] = useState<string | null>(null);
  const clicar = (parte: ParteMesa) => {
    if (concluido) return;
    if (parte === alvo) {
      setErro(null);
      aoConcluir();
    } else setErro(dica ?? DICAS[alvo] ?? "Ainda não. Olhe a mesa com calma.");
  };
  const destaque = (parte: ParteMesa) =>
    concluido && parte === alvo ? "ring-4 ring-ouro-300 ring-offset-2 ring-offset-mesa-700" : "hover:ring-2 hover:ring-creme-100/50";
  const voce = estado.jogadores[0]!;

  return (
    <div className="space-y-4">
      <p className="font-display text-xl text-creme-50">{pergunta}</p>
      <div className="relative mx-auto aspect-[16/10] w-full max-w-2xl">
        <div className="textura-feltro absolute inset-[14%_8%] rounded-[50%] border-[10px] border-[#2a1d14] bg-[radial-gradient(ellipse_at_50%_40%,#217a52,#0b3524)] shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
        {/* Pote */}
        <button type="button" aria-label="Pote" onClick={() => clicar("pote")} className={`absolute top-[33%] left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 font-mono text-sm text-creme-50 transition-shadow ${destaque("pote")}`}>
          Pote {formatarFichas(estado.jogadores.reduce((s, j) => s + j.totalApostado, 0))}
        </button>
        {/* Board */}
        <button type="button" aria-label="Cartas comunitárias" onClick={() => clicar("board")} className={`absolute top-1/2 left-1/2 flex -translate-1/2 gap-1 rounded-md p-1 transition-shadow ${destaque("board")}`}>
          {estado.board.length === 0 ? (
            <span className="px-3 py-4 text-xs text-creme-300">(ainda sem cartas na mesa)</span>
          ) : (
            estado.board.map((c) => <Carta key={c} carta={paraVisual(c)} largura="2.6rem" />)
          )}
        </button>
        {/* Jogadores */}
        {estado.jogadores.map((j, i) => {
          const p = POSICOES[i]!;
          return (
            <div key={j.id} className="absolute flex -translate-1/2 flex-col items-center gap-1" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              {i === 0 && (
                <button type="button" aria-label="Suas cartas" onClick={() => clicar("suas-cartas")} className={`flex gap-1 rounded-md p-0.5 transition-shadow ${destaque("suas-cartas")}`}>
                  {voce.cartas.map((c) => (
                    <Carta key={c} carta={paraVisual(c)} largura="2.4rem" />
                  ))}
                </button>
              )}
              <button
                type="button"
                onClick={() => clicar(`jogador-${i}`)}
                className={`rounded-(--radius-controle) border px-2.5 py-1 text-center text-xs transition-shadow ${i === 0 ? "border-ouro-400 bg-superficie-2" : "border-borda bg-superficie-1"} ${destaque(`jogador-${i}`)}`}
              >
                <span className="block font-semibold text-creme-50">{i === 0 ? "Você" : j.nome}</span>
                <span className="font-mono text-ouro-200">{formatarFichas(j.fichas)}</span>
              </button>
              <span className="flex gap-1">
                {estado.botao === i && (
                  <button type="button" aria-label="Botão do dealer" onClick={() => clicar("dealer")} className={`grid size-6 place-items-center rounded-full bg-creme-50 font-mono text-[0.65rem] font-black text-tinta ${destaque("dealer")}`}>
                    D
                  </button>
                )}
                {estado.smallBlind === i && (
                  <button type="button" aria-label="Small blind" onClick={() => clicar("small-blind")} className={`rounded-full bg-superficie-3 px-1.5 font-mono text-[0.6rem] text-creme-100 ${destaque("small-blind")}`}>
                    SB
                  </button>
                )}
                {estado.bigBlind === i && (
                  <button type="button" aria-label="Big blind" onClick={() => clicar("big-blind")} className={`rounded-full bg-superficie-3 px-1.5 font-mono text-[0.6rem] text-creme-100 ${destaque("big-blind")}`}>
                    BB
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {erro && !concluido && (
        <p role="status" className="animar-aviso rounded-(--radius-cartao) border-l-4 border-perigo bg-perigo/10 px-4 py-2.5 text-sm text-perigo-claro">
          {erro}
        </p>
      )}
      {concluido && (
        <p role="status" className="animar-aviso rounded-(--radius-cartao) border-l-4 border-sucesso bg-sucesso/10 px-4 py-2.5 text-sm text-creme-50">
          {explicacaoCerta}
        </p>
      )}
    </div>
  );
}

const DICAS: Record<string, string> = {
  "suas-cartas": "Procure as duas cartas viradas para cima perto de você, embaixo.",
  board: "As cartas comunitárias ficam no centro da mesa: todo mundo usa.",
  pote: "O pote é o total apostado, mostrado em cima das cartas do centro.",
  dealer: "Procure a fichinha branca com a letra D ao lado de um jogador.",
  "small-blind": "O small blind é a aposta obrigatória menor: procure o selo SB.",
  "big-blind": "O big blind é a aposta obrigatória maior: procure o selo BB.",
};

/* ------------------------------------------------------------------ */
/* Showdown: quem leva o pote? (decidido pelo avaliador do motor)       */
/* ------------------------------------------------------------------ */

export function QuemGanha({ board, maos, aoConcluir, concluido }: PropsPasso & { board: string; maos: { nome: string; cartas: string }[] }) {
  const [escolha, setEscolha] = useState<number | "dividem" | null>(null);
  const mesa = cartas(board);
  const avaliadas = maos.map((m) => {
    const sete = [...cartas(m.cartas), ...mesa];
    const pontos = avaliar(sete);
    return { ...m, pontos, descricao: descreverMao(pontos), cinco: new Set(melhoresCinco(sete)) };
  });
  const melhor = Math.max(...avaliadas.map((a) => a.pontos));
  const ganhadores = avaliadas.flatMap((a, i) => (a.pontos === melhor ? [i] : []));
  const resposta: number | "dividem" = ganhadores.length > 1 ? "dividem" : ganhadores[0]!;
  // Mesma categoria entre o vencedor e alguém: quem decidiu foram as cartas restantes (kicker).
  const peloKicker =
    resposta !== "dividem" &&
    avaliadas.some((a, i) => i !== resposta && categoriaDe(a.pontos) === categoriaDe(melhor));
  const acertou = escolha === resposta;
  const revelar = acertou || concluido;

  const escolher = (e: number | "dividem") => {
    setEscolha(e);
    if (e === resposta) aoConcluir();
  };

  return (
    <div className="space-y-4">
      <p className="font-display text-xl text-creme-50">Showdown! Quem leva o pote?</p>
      <div>
        <p className="rotulo mb-1.5 text-creme-300">Mesa</p>
        <span className="flex gap-1">
          {mesa.map((c) => (
            <Carta key={c} carta={paraVisual(c)} largura="2.8rem" destaque={revelar && avaliadas.some((a, i) => ganhadores.includes(i) && a.cinco.has(c))} />
          ))}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {avaliadas.map((a, i) => (
          <button
            key={a.nome}
            type="button"
            disabled={revelar}
            onClick={() => escolher(i)}
            className={`flex flex-col items-start gap-2 rounded-(--radius-cartao) border p-3 text-left transition-colors ${
              revelar && ganhadores.includes(i)
                ? "border-sucesso bg-sucesso/10"
                : escolha === i && !acertou
                  ? "border-perigo bg-perigo/10"
                  : "border-borda hover:border-borda-forte"
            }`}
          >
            <span className="font-semibold text-creme-50">{a.nome}</span>
            <span className="flex gap-1">
              {cartas(a.cartas).map((c) => (
                <Carta key={c} carta={paraVisual(c)} largura="2.6rem" destaque={revelar && ganhadores.includes(i) && a.cinco.has(c)} />
              ))}
            </span>
            {revelar && <span className="text-sm text-creme-300">{a.descricao}</span>}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={revelar}
        onClick={() => escolher("dividem")}
        className={`rotulo rounded-(--radius-controle) border px-4 py-2 ${revelar && resposta === "dividem" ? "border-sucesso text-creme-50" : "border-borda text-creme-100 hover:border-borda-forte"}`}
      >
        Empate: dividem o pote
      </button>
      {escolha !== null && (
        <p role="status" className={`animar-aviso rounded-(--radius-cartao) border-l-4 px-4 py-2.5 text-sm ${acertou ? "border-sucesso bg-sucesso/10 text-creme-50" : "border-perigo bg-perigo/10 text-perigo-claro"}`}>
          {acertou
            ? resposta === "dividem"
              ? "Isso! As melhores cinco cartas têm o mesmo valor: o pote é dividido igualmente."
              : `Isso! ${avaliadas[resposta as number]!.nome} vence com ${avaliadas[resposta as number]!.descricao.toLowerCase()}.${
                  peloKicker ? " Os dois tinham a mesma mão: o desempate foi pela carta mais alta que sobra (o kicker)." : ""
                }`
            : "Ainda não. Monte a melhor mão de 5 cartas de cada um (2 dele + 5 da mesa) e compare."}
        </p>
      )}
    </div>
  );
}
