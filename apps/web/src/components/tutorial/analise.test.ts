import { describe, expect, it } from "vitest";
import { aplicarAcao, type EstadoMao } from "@poker/engine";
import { foiAllIn } from "../treino/textos";
import { analisarDecisoes } from "./analise";
import { ROTEIRO_DESISTIR, ROTEIRO_PRATICA, acaoDaJogada, iniciarRoteiro, type Roteiro } from "./roteiros";

function jogar(r: Roteiro): EstadoMao {
  let estado = iniciarRoteiro(r);
  for (const j of r.jogadas) estado = aplicarAcao(estado, estado.vez!, acaoDaJogada(j)).estado;
  return estado;
}

describe("análise das decisões do desafio", () => {
  it("elogia jogar forte com mão forte", () => {
    const decisoes = analisarDecisoes(jogar(ROTEIRO_PRATICA), 0);
    expect(decisoes).toHaveLength(4);
    expect(decisoes.every((d) => d.nota !== "atencao")).toBe(true);
    expect(decisoes[0]!.fase).toBe("preflop");
    expect(decisoes[0]!.nota).toBe("boa");
  });

  it("aprova largar 7-2 antes do flop", () => {
    const [d] = analisarDecisoes(jogar(ROTEIRO_DESISTIR), 0);
    expect(d).toMatchObject({ fase: "preflop", acao: "desistiu", nota: "boa" });
  });

  it("aponta quando você larga uma mão forte", () => {
    // Mesma mão de ases, mas desistindo logo de cara.
    const r: Roteiro = {
      ...ROTEIRO_PRATICA,
      jogadas: [ROTEIRO_PRATICA.jogadas[0]!, { tipo: "voce", espera: "desistir", dica: "", certo: "", errado: "" }],
    };
    let estado = iniciarRoteiro(r);
    for (const j of r.jogadas) estado = aplicarAcao(estado, estado.vez!, acaoDaJogada(j)).estado;
    expect(analisarDecisoes(estado, 0)[0]!.nota).toBe("atencao");
  });

  it("reconhece all-in no histórico (o motor guarda como aposta)", () => {
    const mao = jogar(ROTEIRO_PRATICA);
    const ultimaDoCaio = mao.acoes.findLastIndex((a) => a.indice === 3);
    expect(foiAllIn(mao, ultimaDoCaio)).toBe(true);
    expect(foiAllIn(mao, 0)).toBe(false);
    expect(analisarDecisoes(mao, 0).at(-1)!.acao).toBe("foi all-in (320)");
  });

  it("não quebra para quem não está na mão", () => {
    expect(analisarDecisoes(jogar(ROTEIRO_PRATICA), 9)).toEqual([]);
  });
});
