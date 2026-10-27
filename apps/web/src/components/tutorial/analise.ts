import { percentilPreflop } from "@poker/bots";
import { Categoria, avaliar, categoriaDe, descreverMao, type EstadoMao, type Fase } from "@poker/engine";
import { descreverAcao, foiAllIn } from "../treino/textos";

export type Nota = "boa" | "ok" | "atencao";

export interface Decisao {
  fase: Fase;
  acao: string;
  nota: Nota;
  comentario: string;
}

const CARTAS_NA_MESA: Record<Fase, number> = { preflop: 0, flop: 3, turn: 4, river: 5, encerrada: 5 };

/**
 * Comenta cada decisão sua numa mão já encerrada, com regras simples de iniciante: força da
 * mão inicial no pré-flop e o que você tinha formado depois do flop. Não é solver: é um
 * espelho para pensar ("larguei uma mão forte?", "paguei sem ter nada?").
 */
export function analisarDecisoes(mao: EstadoMao, indice: number): Decisao[] {
  const eu = mao.jogadores[indice];
  if (!eu) return [];
  const [c1, c2] = eu.cartas;
  return mao.acoes
    .map((a, i) => ({ ...a, allIn: foiAllIn(mao, i) }))
    .filter((a) => a.indice === indice)
    .map((a) => {
      const acao = descreverAcao(a.tipo, a.valor, a.allIn);
      // Pagar um all-in alheio (mesmo ficando sem fichas) continua sendo pagar.
      const agressiva = a.tipo === "apostar" || a.tipo === "aumentar";
      if (a.fase === "preflop") {
        const p = percentilPreflop(c1, c2);
        const top = `top ${Math.max(1, Math.round((1 - p) * 100))}%`;
        if (a.tipo === "desistir")
          return p >= 0.85
            ? nota(a.fase, acao, "atencao", `Sua mão estava no ${top} das iniciais: forte demais para largar antes do flop.`)
            : nota(a.fase, acao, "boa", "Largar mãos comuns antes do flop economiza fichas. Paciência é parte do jogo.");
        if (agressiva)
          return p >= 0.75
            ? nota(a.fase, acao, "boa", `Mão no ${top}: aumentar com mão forte é o certo.`)
            : p < 0.4
              ? nota(a.fase, acao, "atencao", "Aumentar com mão fraca é um blefe caro quando alguém paga.")
              : nota(a.fase, acao, "ok", "Aumento com mão razoável: funciona melhor quando você fala por último.");
        return p < 0.3
          ? nota(a.fase, acao, "atencao", "Mão fraca: entrar no pote com ela costuma custar fichas no longo prazo.")
          : nota(a.fase, acao, "ok", "Entrar no pote com uma mão razoável para ver o flop.");
      }
      const pontos = avaliar([c1, c2, ...mao.board.slice(0, CARTAS_NA_MESA[a.fase])]);
      const categoria = categoriaDe(pontos);
      const mao5 = descreverMao(pontos).toLowerCase();
      if (a.tipo === "desistir")
        return categoria >= Categoria.DoisPares
          ? nota(a.fase, acao, "atencao", `Você tinha ${mao5}: mão forte demais para desistir.`)
          : categoria === Categoria.Par
            ? nota(a.fase, acao, "ok", "Um par nem sempre aguenta aposta grande: decisão aceitável.")
            : nota(a.fase, acao, "boa", "Sem nada formado, desistir diante de aposta é sensato.");
      if (a.tipo === "passar")
        return categoria >= Categoria.Trinca
          ? nota(a.fase, acao, "ok", `Com ${mao5}, apostar faria o pote crescer.`)
          : nota(a.fase, acao, "boa", "Passar controlou o tamanho do pote.");
      if (agressiva)
        return categoria >= Categoria.DoisPares
          ? nota(a.fase, acao, "boa", `Apostou com ${mao5}: é assim que se ganha fichas.`)
          : categoria === Categoria.Par
            ? nota(a.fase, acao, "ok", `Aposta com ${mao5}: boa se o par for alto.`)
            : nota(a.fase, acao, "atencao", "Apostar sem nada formado é blefe: às vezes funciona, mas sai caro quando pagam.");
      return categoria === Categoria.CartaAlta
        ? nota(a.fase, acao, "atencao", "Pagou só com carta alta: só vale a pena se faltar uma carta para um flush ou uma sequência.")
        : nota(a.fase, acao, "ok", `Pagou com ${mao5}.`);
    });
}

function nota(fase: Fase, acao: string, n: Nota, comentario: string): Decisao {
  return { fase, acao, nota: n, comentario };
}
