import { describe, expect, it } from "vitest";
import {
  aplicarAcao,
  baralhoOrdenado,
  cartas,
  embaralhar,
  iniciarMao,
  obterAcoesValidas,
  projetarParaJogador,
  type EstadoMao,
} from "@poker/engine";
import { equidade } from "./equidade";
import { decidir, type NivelBot } from "./estrategias";
import { forcaPreflop, pontosChen } from "./forca";
import { registrarMao, type Perfis } from "./perfis";

function gerador(semente: number) {
  let s = semente >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

describe("força pré-flop", () => {
  it("segue a fórmula de Chen nos exemplos clássicos", () => {
    const [a, b] = cartas("As Ad");
    expect(pontosChen(a!, b!)).toBe(20);
    const [c, d] = cartas("7h 2c");
    expect(pontosChen(c!, d!)).toBe(-1);
    const [e, f] = cartas("Ks Qs");
    expect(pontosChen(e!, f!)).toBe(10);
  });

  it("AA é mais forte que 7-2", () => {
    const [a, b] = cartas("As Ad");
    const [c, d] = cartas("7h 2c");
    expect(forcaPreflop(a!, b!)).toBeGreaterThan(forcaPreflop(c!, d!));
  });
});

describe("equidade por Monte Carlo", () => {
  it("AA contra uma mão aleatória ganha por volta de 85%", () => {
    const [a, b] = cartas("As Ad");
    const e = equidade([a!, b!], [], 1, 4000, gerador(7));
    expect(e).toBeGreaterThan(0.8);
    expect(e).toBeLessThan(0.9);
  });

  it("nuts no river vale 100%", () => {
    const [a, b] = cartas("As Ks");
    const e = equidade([a!, b!], cartas("Qs Js Ts 2d 3c"), 3, 500, gerador(3));
    expect(e).toBe(1);
  });

  it("faixa mais forte do oponente reduz a equidade de uma mão média", () => {
    const [a, b] = cartas("Jh Tc");
    const contraQualquer = equidade([a!, b!], [], 1, 3000, gerador(11));
    const contraForte = equidade([a!, b!], [], 1, 3000, gerador(11), [0.85]);
    expect(contraForte).toBeLessThan(contraQualquer);
  });
});

describe("decisões dos bots", () => {
  const niveis: NivelBot[] = ["facil", "medio", "dificil", "extremo"];

  it.each(niveis)("bot %s joga mãos inteiras sempre com ações válidas", (nivel) => {
    const aleatorio = gerador(nivel.length * 97);
    let perfis: Perfis = {};
    for (let mao = 0; mao < 40; mao++) {
      const n = 2 + (mao % 7);
      let estado: EstadoMao = iniciarMao({
        config: { smallBlind: 10, bigBlind: 20, ante: 0 },
        numero: mao + 1,
        botao: mao % n,
        jogadores: Array.from({ length: n }, (_, i) => ({
          id: `b${i}`,
          nome: `Bot ${i}`,
          assento: i,
          fichas: 400 + ((mao * 37 + i * 91) % 1600),
        })),
        baralho: embaralhar(baralhoOrdenado(), (k) => Math.floor(aleatorio() * k)),
      }).estado;
      let passos = 0;
      while (estado.vez !== null && passos++ < 300) {
        const vez = estado.vez;
        const acao = decidir({
          visao: projetarParaJogador(estado, vez),
          acoes: obterAcoesValidas(estado, vez),
          nivel,
          aleatorio,
          perfis,
        });
        estado = aplicarAcao(estado, vez, acao).estado; // lança se a ação for inválida
      }
      expect(estado.fase).toBe("encerrada");
      perfis = registrarMao(perfis, estado);
    }
    expect(perfis["b0"]!.maos).toBe(40);
  });

  it("bot fácil nunca desiste quando pode passar de graça", () => {
    const aleatorio = gerador(5);
    for (let i = 0; i < 200; i++) {
      const estado = iniciarMao({
        config: { smallBlind: 10, bigBlind: 20, ante: 0 },
        numero: 1,
        botao: 0,
        jogadores: [
          { id: "a", nome: "A", assento: 0, fichas: 1000 },
          { id: "b", nome: "B", assento: 1, fichas: 1000 },
        ],
        baralho: embaralhar(baralhoOrdenado(), (k) => Math.floor(aleatorio() * k)),
      }).estado;
      // SB paga; o BB pode passar
      const depois = aplicarAcao(estado, 0, { tipo: "pagar" }).estado;
      const acao = decidir({
        visao: projetarParaJogador(depois, 1),
        acoes: obterAcoesValidas(depois, 1),
        nivel: "facil",
        aleatorio,
      });
      expect(acao.tipo).not.toBe("desistir");
    }
  });
});
