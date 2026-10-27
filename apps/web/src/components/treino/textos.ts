import { cartaParaTexto, type EstadoMao, type TipoAcao } from "@poker/engine";

const fichas = (n: number) => n.toLocaleString("pt-BR");

/** "pagou 200", "aumentou para 600", "foi all-in (1.500)". */
export function descreverAcao(tipo: TipoAcao, valor: number, allIn: boolean): string {
  if (allIn && tipo !== "desistir" && tipo !== "passar") return `foi all-in (${fichas(valor)})`;
  switch (tipo) {
    case "desistir":
      return "desistiu";
    case "passar":
      return "passou";
    case "pagar":
      return `pagou ${fichas(valor)}`;
    case "apostar":
      return `apostou ${fichas(valor)}`;
    case "aumentar":
      return `aumentou para ${fichas(valor)}`;
    case "allin":
      return `foi all-in (${fichas(valor)})`;
  }
}

/** Rótulo curto para o balão em cima do assento. */
export function rotuloAcao(tipo: TipoAcao, valor: number, allIn: boolean): string {
  if (allIn && tipo !== "desistir" && tipo !== "passar") return "All-in";
  switch (tipo) {
    case "desistir":
      return "Desistiu";
    case "passar":
      return "Passou";
    case "pagar":
      return `Pagou`;
    case "apostar":
      return `Apostou`;
    case "aumentar":
      return `Aumentou`;
    case "allin":
      return "All-in";
  }
  return String(valor);
}

export { fichas as formatarFichas };

const NOMES_FASE = { preflop: "Pré-flop", flop: "Flop", turn: "Turn", river: "River", encerrada: "Fim" } as const;
const SIMBOLOS: Record<string, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };

/** "A♠ K♦ 7♥" a partir das cartas do motor. */
export function textoCartas(cartas: readonly number[]): string {
  return cartas
    .map((c) => {
      const t = cartaParaTexto(c);
      return `${t[0] === "T" ? "10" : t[0]}${SIMBOLOS[t[1]!]}`;
    })
    .join(" ");
}

export type LinhaLog = { tipo: "sistema" | "acao"; texto: string };

/**
 * Log de uma mão: ações em ordem, com mensagens do sistema quando muda a rua.
 * Só mostra cartas do board que já foram reveladas na tela (`cartasVisiveis`).
 */
export function linhasDaMao(mao: EstadoMao, cartasVisiveis = mao.board.length, nomeVoce?: string): LinhaLog[] {
  const nome = (i: number) => (mao.jogadores[i]!.id === "voce" && nomeVoce ? nomeVoce : mao.jogadores[i]!.nome);
  const linhas: LinhaLog[] = [
    {
      tipo: "sistema",
      texto: `Mão #${mao.numero} · blinds ${fichas(mao.config.smallBlind)}/${fichas(mao.config.bigBlind)} · botão: ${nome(mao.botao)}`,
    },
  ];
  const ruas: { fase: "flop" | "turn" | "river"; inicio: number; fim: number }[] = [
    { fase: "flop", inicio: 0, fim: 3 },
    { fase: "turn", inicio: 3, fim: 4 },
    { fase: "river", inicio: 4, fim: 5 },
  ];
  const anunciarRua = (fase: "flop" | "turn" | "river") => {
    const rua = ruas.find((r) => r.fase === fase)!;
    if (cartasVisiveis >= rua.fim && mao.board.length >= rua.fim) {
      linhas.push({ tipo: "sistema", texto: `${NOMES_FASE[fase]}: ${textoCartas(mao.board.slice(0, rua.fim))}` });
    }
  };
  let faseAtual: string = "preflop";
  for (const a of mao.acoes) {
    if (a.fase !== faseAtual && a.fase !== "preflop" && a.fase !== "encerrada") {
      anunciarRua(a.fase);
      faseAtual = a.fase;
    }
    linhas.push({ tipo: "acao", texto: `${nome(a.indice)} ${descreverAcao(a.tipo, a.valor, false)}` });
  }
  // Ruas que saíram sem novas apostas (todos all-in, ou fim da mão)
  for (const rua of ruas) {
    const anunciada = linhas.some((l) => l.tipo === "sistema" && l.texto.startsWith(NOMES_FASE[rua.fase]));
    if (!anunciada) anunciarRua(rua.fase);
  }
  return linhas;
}
