import type { Acao, AcoesValidas, VisaoMao } from "@poker/engine";
import { equidade, type Aleatorio } from "./equidade";
import { forcaPreflop, percentilPreflop } from "./forca";
import { lerEstilo, type Perfis } from "./perfis";

export type NivelBot = "facil" | "medio" | "dificil" | "extremo";

export const NIVEIS: Record<NivelBot, { nome: string; descricao: string }> = {
  facil: { nome: "Fácil", descricao: "Joga no impulso: paga muito e quase nunca blefa." },
  medio: { nome: "Médio", descricao: "Olha a força da mão e faz a conta do pote." },
  dificil: { nome: "Difícil", descricao: "Simula milhares de mãos, respeita posição e dimensiona as apostas." },
  extremo: {
    nome: "Extremo",
    descricao: "Estima o range de cada adversário, blefa na medida e se adapta ao seu estilo.",
  },
};

export interface EntradaBot {
  visao: VisaoMao;
  acoes: AcoesValidas;
  nivel: NivelBot;
  aleatorio: Aleatorio;
  /** Estatísticas dos adversários (só o Extremo usa). */
  perfis?: Perfis;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

interface Contexto {
  visao: VisaoMao;
  acoes: AcoesValidas;
  aleatorio: Aleatorio;
  eu: VisaoMao["jogadores"][number];
  cartas: NonNullable<VisaoMao["jogadores"][number]["cartas"]>;
  oponentesVivos: VisaoMao["jogadores"];
  devendo: number;
  pote: number;
  oddsDoPote: number;
  bb: number;
  /** 0 = primeiro a agir depois do botão, 1 = botão (melhor posição). */
  posicao: number;
  /** Quantos só pagaram o big blind no pré-flop (aumenta um pouco mais em pote com limpers). */
  limpers: number;
}

function montarContexto(visao: VisaoMao, acoes: AcoesValidas, aleatorio: Aleatorio): Contexto {
  const eu = visao.jogadores[visao.eu!]!;
  const oponentesVivos = visao.jogadores.filter((j) => j.indice !== eu.indice && !j.desistiu);
  const devendo = acoes.valorParaPagar;
  const n = visao.jogadores.length;
  const distanciaDoBotao = (eu.indice - visao.botao + n) % n; // 0 = botão
  return {
    visao,
    acoes,
    aleatorio,
    eu,
    cartas: eu.cartas!,
    oponentesVivos,
    devendo,
    pote: visao.pote,
    oddsDoPote: devendo > 0 ? devendo / (visao.pote + devendo) : 0,
    bb: visao.bigBlindValor,
    posicao: distanciaDoBotao === 0 ? 1 : (distanciaDoBotao - 1) / Math.max(1, n - 1),
    limpers:
      visao.fase === "preflop"
        ? oponentesVivos.filter((j) => j.ultimaAcao?.tipo === "pagar" && j.apostaRodada === visao.bigBlindValor).length
        : 0,
  };
}

const passarOuDesistir = (c: Contexto): Acao => (c.acoes.podePassar ? { tipo: "passar" } : { tipo: "desistir" });
const passarOuPagar = (c: Contexto): Acao =>
  c.acoes.podePassar ? { tipo: "passar" } : { tipo: "pagar" };

/** Aposta ou aumento de `fracaoDoPote` do pote, ajustado às faixas válidas. */
function apostarFracao(c: Contexto, fracaoDoPote: number): Acao {
  const faixa = c.acoes.apostar ?? c.acoes.aumentar;
  if (!faixa) return passarOuPagar(c);
  // No aumento, o tamanho é medido a partir do valor para pagar ("pagar e aumentar X% do pote").
  const base = c.acoes.aumentar ? c.visao.apostaAtual : 0;
  const tamanho = Math.round((c.pote + c.devendo) * fracaoDoPote);
  const alvo = arredondar(base + tamanho, c.bb);
  const valor = Math.max(faixa.min, Math.min(faixa.max, alvo));
  if (valor >= faixa.max) return { tipo: "allin" };
  return { tipo: c.acoes.apostar ? "apostar" : "aumentar", valor };
}

/** Aumento pré-flop em múltiplos do big blind (ou da aposta atual). */
function aumentarPreflop(c: Contexto, multiplicador: number): Acao {
  const faixa = c.acoes.aumentar ?? c.acoes.apostar;
  if (!faixa) return passarOuPagar(c);
  const alvo = arredondar(Math.max(c.visao.apostaAtual, c.bb) * multiplicador + c.bb * c.limpers, c.bb);
  const valor = Math.max(faixa.min, Math.min(faixa.max, alvo));
  if (valor >= faixa.max) return { tipo: "allin" };
  return { tipo: c.acoes.aumentar ? "aumentar" : "apostar", valor };
}

function arredondar(valor: number, bb: number): number {
  const passo = Math.max(1, Math.round(bb / 2));
  return Math.round(valor / passo) * passo;
}

/* ------------------------------------------------------------------ */
/* Fácil: decisões aleatórias ponderadas                               */
/* ------------------------------------------------------------------ */

function facil(c: Contexto): Acao {
  const r = c.aleatorio();
  const boaMao = c.visao.fase === "preflop" ? forcaPreflop(...c.cartas) > 0.6 : false;
  if (c.acoes.podePassar) {
    if (r < (boaMao ? 0.45 : 0.18)) return apostarFracao(c, 0.4 + c.aleatorio() * 0.4);
    return { tipo: "passar" };
  }
  // Diante de aposta: paga muito, desiste às vezes, aumenta pouco.
  const caro = c.devendo > c.eu.fichas * 0.5;
  if (r < (caro ? 0.5 : 0.22)) return { tipo: "desistir" };
  if (r > (boaMao ? 0.8 : 0.93) && c.acoes.aumentar) return aumentarPreflop(c, 2);
  return { tipo: "pagar" };
}

/* ------------------------------------------------------------------ */
/* Médio: força da mão + odds do pote                                  */
/* ------------------------------------------------------------------ */

function medio(c: Contexto): Acao {
  if (c.visao.fase === "preflop") {
    const s = forcaPreflop(...c.cartas);
    if (s >= 0.72) return aumentarPreflop(c, 3);
    if (s >= 0.52) return c.devendo <= c.bb * 4 ? passarOuPagar(c) : passarOuDesistir(c);
    if (s >= 0.38) return c.devendo <= c.bb ? passarOuPagar(c) : passarOuDesistir(c);
    return passarOuDesistir(c);
  }
  const e = equidade(c.cartas, c.visao.board, c.oponentesVivos.length, 250, c.aleatorio);
  if (e > 0.75) return apostarFracao(c, 0.66);
  if (c.acoes.podePassar) {
    if (e > 0.55 && c.aleatorio() < 0.5) return apostarFracao(c, 0.5);
    if (c.aleatorio() < 0.05) return apostarFracao(c, 0.5); // blefe raro
    return { tipo: "passar" };
  }
  return e > c.oddsDoPote + 0.05 ? { tipo: "pagar" } : { tipo: "desistir" };
}

/* ------------------------------------------------------------------ */
/* Difícil: Monte Carlo + posição + dimensionamento                    */
/* ------------------------------------------------------------------ */

function dificil(c: Contexto): Acao {
  const p = percentilPreflop(...c.cartas);
  if (c.visao.fase === "preflop") {
    const houveAumento = c.visao.apostaAtual > c.bb;
    // Abre mais mãos em posição tardia.
    const limiarAbrir = 0.62 - c.posicao * 0.2;
    if (p >= 0.95) return aumentarPreflop(c, 3);
    if (!houveAumento) {
      if (p >= limiarAbrir) return aumentarPreflop(c, 2.5);
      if (p >= limiarAbrir - 0.12 && c.devendo <= c.bb) return passarOuPagar(c);
      return passarOuDesistir(c);
    }
    const e = equidade(c.cartas, [], c.oponentesVivos.length, 400, c.aleatorio);
    if (p >= 0.88 && c.aleatorio() < 0.6) return aumentarPreflop(c, 3);
    if (e > c.oddsDoPote + 0.04 && c.devendo <= c.eu.fichas * 0.35) return passarOuPagar(c);
    return passarOuDesistir(c);
  }

  const e = equidade(c.cartas, c.visao.board, c.oponentesVivos.length, 900, c.aleatorio);
  const tardia = c.posicao > 0.6;
  if (c.acoes.podePassar) {
    if (e > 0.8) return apostarFracao(c, 0.75);
    if (e > 0.62) return apostarFracao(c, 0.55);
    // Semi-blefe com projeto no flop/turn, mais em posição.
    if (c.visao.fase !== "river" && e > 0.32 && e < 0.5 && c.aleatorio() < (tardia ? 0.35 : 0.18)) {
      return apostarFracao(c, 0.5);
    }
    return { tipo: "passar" };
  }
  if (e > 0.85 && c.acoes.aumentar) return apostarFracao(c, 0.8);
  return e > c.oddsDoPote + 0.03 ? { tipo: "pagar" } : { tipo: "desistir" };
}

/* ------------------------------------------------------------------ */
/* Extremo: range dos adversários + blefe controlado + adaptação       */
/* ------------------------------------------------------------------ */

/** Percentil mínimo estimado da mão de cada adversário vivo, pelas ações nesta mão. */
function faixasEstimadas(c: Contexto, perfis: Perfis): number[] {
  return c.oponentesVivos.map((op) => {
    const acoes = c.visao.historico.filter((a) => a.indice === op.indice);
    const estilo = lerEstilo(perfis[op.id]);
    // Quanto mais solto o adversário, mais larga a faixa dele.
    const folga = (estilo.vpip - 0.25) * 0.6 * estilo.confianca;
    let minimo = 0;
    if (acoes.some((a) => a.fase === "preflop" && a.tipo === "aumentar")) minimo = 0.72;
    else if (acoes.some((a) => a.fase === "preflop" && a.tipo === "pagar")) minimo = 0.4;
    const agressoesPosFlop = acoes.filter(
      (a) => a.fase !== "preflop" && (a.tipo === "apostar" || a.tipo === "aumentar"),
    ).length;
    minimo += agressoesPosFlop * 0.06;
    return Math.max(0, Math.min(0.9, minimo - folga));
  });
}

function extremo(c: Contexto, perfis: Perfis): Acao {
  const p = percentilPreflop(...c.cartas);
  const estilos = c.oponentesVivos.map((op) => lerEstilo(perfis[op.id]));
  const desistemMuito = estilos.length > 0 && estilos.every((s) => s.desisteDiante > 0.45);
  const pagamMuito = estilos.some((s) => s.vpip > 0.45 && s.fatorAgressao < 0.8);
  const agressivos = estilos.some((s) => s.fatorAgressao > 2);

  if (c.visao.fase === "preflop") {
    const houveAumento = c.visao.apostaAtual > c.bb;
    const limiarAbrir = 0.6 - c.posicao * 0.24 - (desistemMuito ? 0.06 : 0);
    if (p >= 0.96) {
      // Às vezes só paga com monstro para disfarçar (slow play).
      return c.aleatorio() < 0.15 && houveAumento ? passarOuPagar(c) : aumentarPreflop(c, 3);
    }
    if (!houveAumento) {
      if (p >= limiarAbrir) return aumentarPreflop(c, c.posicao > 0.6 ? 2.2 : 2.7);
      if (p >= limiarAbrir - 0.15 && c.devendo <= c.bb) return passarOuPagar(c);
      return passarOuDesistir(c);
    }
    const e = equidade(c.cartas, [], c.oponentesVivos.length, 700, c.aleatorio, faixasEstimadas(c, perfis));
    if (p >= 0.9 && c.aleatorio() < 0.55) return aumentarPreflop(c, 3);
    // 3-bet de blefe ocasional com mãos jogáveis, em posição.
    if (p >= 0.55 && p < 0.75 && c.posicao > 0.6 && c.aleatorio() < 0.08) return aumentarPreflop(c, 3);
    if (e > c.oddsDoPote + 0.02 && c.devendo <= c.eu.fichas * 0.4) return passarOuPagar(c);
    return passarOuDesistir(c);
  }

  const e = equidade(c.cartas, c.visao.board, c.oponentesVivos.length, 1800, c.aleatorio, faixasEstimadas(c, perfis));
  const ajusteChamada = agressivos ? -0.05 : pagamMuito ? 0.03 : 0;

  if (c.acoes.podePassar) {
    if (e > 0.82) {
      // Monstro: às vezes passa para armar o check-raise.
      if (c.visao.fase !== "river" && c.aleatorio() < 0.2) return { tipo: "passar" };
      return apostarFracao(c, pagamMuito ? 0.9 : 0.7);
    }
    if (e > 0.6) return apostarFracao(c, pagamMuito ? 0.7 : 0.5);
    // Blefe com frequência controlada: a aposta de 2/3 do pote "precisa" funcionar 40% das
    // vezes; contra quem desiste muito, blefa mais; contra quem paga tudo, quase nunca.
    const frequencia = pagamMuito ? 0.03 : desistemMuito ? 0.4 : 0.2;
    const blefavel = c.visao.fase === "river" ? e < 0.3 : e > 0.25 && e < 0.5;
    if (blefavel && c.aleatorio() < frequencia) return apostarFracao(c, 0.66);
    return { tipo: "passar" };
  }

  if (e > 0.8 && c.acoes.aumentar) return apostarFracao(c, pagamMuito ? 1 : 0.8);
  return e > c.oddsDoPote + ajusteChamada ? { tipo: "pagar" } : { tipo: "desistir" };
}

/* ------------------------------------------------------------------ */

/** Decide a ação do bot. Sempre devolve uma ação válida para o estado recebido. */
export function decidir({ visao, acoes, nivel, aleatorio, perfis = {} }: EntradaBot): Acao {
  if (visao.eu === null || !visao.jogadores[visao.eu]?.cartas) return { tipo: "desistir" };
  const c = montarContexto(visao, acoes, aleatorio);
  const acao =
    nivel === "facil" ? facil(c) : nivel === "medio" ? medio(c) : nivel === "dificil" ? dificil(c) : extremo(c, perfis);
  return garantirValida(acao, acoes);
}

/** Rede de segurança: converte qualquer escolha impossível na alternativa mais próxima. */
export function garantirValida(acao: Acao, acoes: AcoesValidas): Acao {
  switch (acao.tipo) {
    case "passar":
      return acoes.podePassar ? acao : { tipo: "desistir" };
    case "pagar":
      return acoes.valorParaPagar > 0 ? acao : acoes.podePassar ? { tipo: "passar" } : { tipo: "desistir" };
    case "apostar":
    case "aumentar": {
      const faixa = acao.tipo === "apostar" ? acoes.apostar : acoes.aumentar;
      if (!faixa) return acoes.valorParaPagar > 0 ? { tipo: "pagar" } : { tipo: "passar" };
      const valor = Math.max(faixa.min, Math.min(faixa.max, Math.round(acao.valor ?? faixa.min)));
      return { tipo: acao.tipo, valor };
    }
    default:
      return acao;
  }
}
