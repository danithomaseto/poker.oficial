import { describe, expect, it } from "vitest";
import { cartaParaTexto } from "./cartas";
import { aplicarAcao, iniciarMao, obterAcoesValidas, proximoBotao, reconstruirMao } from "./mao";
import { projetarParaJogador } from "./projecao";
import { ErroAcao } from "./tipos";
import { entrada, iniciar, jogar, todosAllIn } from "./teste-utils";

const passar = { tipo: "passar" } as const;
const pagar = { tipo: "pagar" } as const;
const desistir = { tipo: "desistir" } as const;
const aumentar = (valor: number) => ({ tipo: "aumentar", valor }) as const;
const apostar = (valor: number) => ({ tipo: "apostar", valor }) as const;

const soma = (fichas: number[]) => fichas.reduce((a, b) => a + b, 0);
const fichasDe = (estado: ReturnType<typeof iniciar>) => estado.jogadores.map((j) => j.fichas);

describe("blinds e ordem de ação", () => {
  it("heads-up: o botão posta o small blind e age primeiro no pré-flop", () => {
    const e = iniciar([1000, 1000], { botao: 0 });
    expect(e.smallBlind).toBe(0);
    expect(e.bigBlind).toBe(1);
    expect(e.jogadores[0]!.apostaRodada).toBe(5);
    expect(e.jogadores[1]!.apostaRodada).toBe(10);
    expect(e.vez).toBe(0);
  });

  it("heads-up: o botão age por último depois do flop", () => {
    const e = jogar(iniciar([1000, 1000], { botao: 0 }), [pagar, passar]);
    expect(e.fase).toBe("flop");
    expect(e.vez).toBe(1);
  });

  it("3 ou mais: pré-flop começa à esquerda do big blind e pós-flop à esquerda do botão", () => {
    const e = iniciar([1000, 1000, 1000, 1000], { botao: 0 });
    expect(e.smallBlind).toBe(1);
    expect(e.bigBlind).toBe(2);
    expect(e.vez).toBe(3);
    const flop = jogar(e, [pagar, pagar, pagar, passar]);
    expect(flop.fase).toBe("flop");
    expect(flop.vez).toBe(1);
  });

  it("o big blind tem a opção de aumentar quando todos só pagam", () => {
    const e = jogar(iniciar([1000, 1000, 1000], { botao: 0 }), [pagar, pagar]);
    expect(e.vez).toBe(2);
    const validas = obterAcoesValidas(e, 2);
    expect(validas.podePassar).toBe(true);
    expect(validas.aumentar).toEqual({ min: 20, max: 1000 });
  });

  it("ante opcional entra no pote como dinheiro morto", () => {
    const e = iniciar([1000, 1000, 1000], { ante: 2 });
    expect(e.jogadores.map((j) => j.totalApostado)).toEqual([2, 7, 12]);
    expect(e.apostaAtual).toBe(10);
  });

  it("blind maior que as fichas deixa o jogador all-in", () => {
    const e = iniciar([1000, 1000, 6], { botao: 0 });
    expect(e.jogadores[2]!.allIn).toBe(true);
    expect(e.jogadores[2]!.apostaRodada).toBe(6);
  });
});

describe("apostas e aumentos", () => {
  it("aumento mínimo é o tamanho do último aumento completo", () => {
    const e = jogar(iniciar([1000, 1000, 1000], { botao: 0 }), [aumentar(30)]);
    // aumentou 20 sobre o big blind: o próximo aumento vai a pelo menos 50
    expect(obterAcoesValidas(e, e.vez!).aumentar?.min).toBe(50);
  });

  it("aposta mínima depois do flop é o big blind", () => {
    const e = jogar(iniciar([1000, 1000], { botao: 0 }), [pagar, passar]);
    expect(obterAcoesValidas(e, e.vez!).apostar).toEqual({ min: 10, max: 990 });
  });

  it("all-in menor que um aumento completo não reabre a ação para quem já agiu", () => {
    // 0 aumenta para 100, 1 paga, 2 (big blind) vai all-in com 150: aumento de só 50 (< 90).
    let e = iniciar([1000, 1000, 150], { botao: 0 });
    e = jogar(e, [aumentar(100), pagar, { tipo: "allin" }]);
    expect(e.apostaAtual).toBe(150);
    expect(e.vez).toBe(0);
    const validas = obterAcoesValidas(e, 0);
    expect(validas.valorParaPagar).toBe(50);
    expect(validas.aumentar).toBeNull();
  });

  it("all-in que completa um aumento reabre a ação", () => {
    let e = iniciar([1000, 1000, 300], { botao: 0 });
    e = jogar(e, [aumentar(100), pagar, { tipo: "allin" }]);
    expect(obterAcoesValidas(e, 0).aumentar).not.toBeNull();
  });

  it("recusa passar diante de aposta, ação fora da vez e valor abaixo do mínimo", () => {
    const e = iniciar([1000, 1000, 1000], { botao: 0 });
    expect(() => aplicarAcao(e, 0, passar)).toThrow(ErroAcao);
    expect(() => aplicarAcao(e, 1, pagar)).toThrow(/vez/);
    expect(() => aplicarAcao(e, 0, aumentar(15))).toThrow(/entre/);
  });

  it("não altera o estado anterior (reducer puro)", () => {
    const e = iniciar([1000, 1000], { botao: 0 });
    const copia = structuredClone(e);
    aplicarAcao(e, 0, aumentar(40));
    expect(e).toEqual(copia);
  });
});

describe("fim da mão", () => {
  it("se todos desistem, o último ganha sem mostrar as cartas", () => {
    const e = jogar(iniciar([1000, 1000, 1000], { botao: 0 }), [desistir, desistir]);
    expect(e.fase).toBe("encerrada");
    expect(e.resultado?.showdown).toBe(false);
    expect(e.jogadores[2]!.fichas).toBe(1005);
    const visao = projetarParaJogador(e, 0);
    expect(visao.jogadores[2]!.cartas).toBeNull();
  });

  it("sem mais apostas possíveis o board corre até o river, com uma queima antes de cada rua", () => {
    const e = todosAllIn(iniciar([500, 500], { botao: 0 }));
    expect(e.fase).toBe("encerrada");
    expect(e.board).toHaveLength(5);
    expect(e.queimadas).toHaveLength(3);
    expect(e.resultado?.showdown).toBe(true);
    expect(soma(fichasDe(e))).toBe(1000);
  });

  it("showdown revela as mãos de quem chegou até o fim", () => {
    const e = jogar(iniciar([1000, 1000], { botao: 0 }), [pagar, passar, passar, passar, passar, passar, passar, passar]);
    expect(e.fase).toBe("encerrada");
    const visao = projetarParaJogador(e, "espectador");
    expect(visao.jogadores.every((j) => j.cartas !== null)).toBe(true);
  });
});

describe("side pots", () => {
  // Board sem sequência nem flush possível para estas mãos: o ranking é pelo par.
  const board = "2c 7d 9h Js 3s";

  it("3 all-ins de tamanhos diferentes", () => {
    const e = todosAllIn(
      iniciar([100, 300, 600], { botao: 0, sb: 5, bb: 10, maos: ["Ac Ad", "Kc Kd", "Qc Qd"], board }),
    );
    // A (100) leva 300, B leva 400 do pote lateral, C recebe de volta os 300 que ninguém cobriu.
    expect(fichasDe(e)).toEqual([300, 400, 300]);
  });

  it("4 all-ins de tamanhos diferentes", () => {
    const e = todosAllIn(
      iniciar([50, 150, 300, 500], {
        botao: 0,
        sb: 5,
        bb: 10,
        maos: ["Ac Ad", "Kc Kd", "Qc Qd", "Tc Td"],
        board,
      }),
    );
    expect(fichasDe(e)).toEqual([200, 300, 300, 200]);
  });

  it("5 all-ins de tamanhos diferentes, com o do meio vencendo", () => {
    const e = todosAllIn(
      iniciar([100, 200, 300, 400, 500], {
        botao: 0,
        sb: 5,
        bb: 10,
        maos: ["Kc Kd", "Qc Qd", "Ac Ad", "Tc Td", "8c 8d"],
        board,
      }),
    );
    // C ganha os três primeiros potes (500 + 400 + 300), D ganha 200 de E, E recebe 100 de volta.
    expect(fichasDe(e)).toEqual([0, 0, 1200, 200, 100]);
    expect(e.resultado!.potes.map((p) => p.valor)).toEqual([500, 400, 300, 200, 100]);
  });

  it("fichas de quem desistiu ficam no pote, mas a pessoa não concorre", () => {
    let e = iniciar([1000, 1000, 1000], { botao: 0, maos: ["2h 3d", "Ac Ad", "Kc Kd"], board });
    e = jogar(e, [aumentar(100), pagar, pagar]); // todos colocam 100
    e = jogar(e, [apostar(50), pagar, desistir]); // no flop: SB aposta, BB paga, botão desiste
    while (e.vez !== null) e = aplicarAcao(e, e.vez, passar).estado;
    expect(e.jogadores[1]!.fichas).toBe(850 + 400);
    expect(e.resultado!.potes).toHaveLength(1);
    expect(e.resultado!.potes[0]!.elegiveis).toEqual([1, 2]);
  });
});

describe("empate e ficha ímpar", () => {
  it("divide o pote e a ficha que sobra vai ao primeiro vencedor à esquerda do botão", () => {
    // Board com royal flush: todos empatam. 0 (botão) paga, 1 (SB) desiste, 2 (BB) passa.
    let e = iniciar([1000, 1000, 1000], {
      botao: 0,
      maos: ["2h 3d", "4h 5d", "6c 8d"],
      board: "As Ks Qs Js Ts",
    });
    e = jogar(e, [pagar, desistir, passar]);
    while (e.vez !== null) e = aplicarAcao(e, e.vez, passar).estado;
    // Pote de 25: 13 para o jogador 2 (primeiro à esquerda do botão entre os vencedores), 12 para o 0.
    expect(e.resultado!.ganhos).toEqual([12, 0, 13]);
  });
});

describe("projeção e reconstrução", () => {
  it("cada jogador vê só as próprias cartas e ninguém vê o baralho", () => {
    const e = iniciar([1000, 1000, 1000]);
    const visao = projetarParaJogador(e, 1);
    expect(visao.jogadores[1]!.cartas).not.toBeNull();
    expect(visao.jogadores[0]!.cartas).toBeNull();
    expect(visao.jogadores[2]!.cartas).toBeNull();
    expect(JSON.stringify(visao)).not.toContain("baralho");
    expect(JSON.stringify(visao)).not.toContain("queimadas");
    expect(projetarParaJogador(e, "espectador").jogadores.every((j) => j.cartas === null)).toBe(true);
  });

  it("a mão é reconstruída pela entrada + ações", () => {
    const ent = entrada([1000, 1000, 1000], { botao: 1 });
    const acoes = [
      { indice: 1, acao: aumentar(30) },
      { indice: 2, acao: pagar },
      { indice: 0, acao: pagar },
    ];
    let e = iniciarMao(ent).estado;
    for (const { indice, acao } of acoes) e = aplicarAcao(e, indice, acao).estado;
    expect(reconstruirMao(ent, acoes)).toEqual(e);
    expect(e.board.map(cartaParaTexto)).toHaveLength(3);
  });

  it("o botão avança para o próximo assento ocupado", () => {
    expect(proximoBotao([0, 2, 5], 2)).toBe(2);
    expect(proximoBotao([0, 2, 5], 5)).toBe(0);
    expect(proximoBotao([1, 3], null)).toBe(0);
  });
});
