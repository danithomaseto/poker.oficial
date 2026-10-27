import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { baralhoOrdenado, embaralhar } from "./cartas";
import { aplicarAcao, iniciarMao, obterAcoesValidas } from "./mao";
import { projetarParaJogador } from "./projecao";
import type { Acao, EstadoMao } from "./tipos";

/** Gerador pseudoaleatório simples e determinístico (só para os testes). */
function geradorComSemente(semente: number) {
  let s = semente >>> 0 || 1;
  return (n: number) => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) % n;
  };
}

/** Escolhe uma ação válida qualquer, guiada pelo gerador. */
function acaoAleatoria(estado: EstadoMao, aleatorio: (n: number) => number): Acao {
  const v = obterAcoesValidas(estado, estado.vez!);
  const opcoes: Acao[] = [{ tipo: "desistir" }, { tipo: "allin" }];
  if (v.podePassar) opcoes.push({ tipo: "passar" }, { tipo: "passar" });
  if (v.valorParaPagar > 0) opcoes.push({ tipo: "pagar" }, { tipo: "pagar" });
  if (v.apostar) opcoes.push({ tipo: "apostar", valor: v.apostar.min + aleatorio(v.apostar.max - v.apostar.min + 1) });
  if (v.aumentar) {
    opcoes.push({ tipo: "aumentar", valor: v.aumentar.min + aleatorio(v.aumentar.max - v.aumentar.min + 1) });
  }
  return opcoes[aleatorio(opcoes.length)]!;
}

const cenario = fc.record({
  fichas: fc.array(fc.integer({ min: 1, max: 5000 }), { minLength: 2, maxLength: 9 }),
  smallBlind: fc.integer({ min: 1, max: 50 }),
  ante: fc.integer({ min: 0, max: 5 }),
  botaoBruto: fc.nat(),
  semente: fc.integer({ min: 1, max: 2 ** 31 - 1 }),
});

type Cenario = { fichas: number[]; smallBlind: number; ante: number; botaoBruto: number; semente: number };

function jogarMaoAleatoria({ fichas, smallBlind, ante, botaoBruto, semente }: Cenario) {
  const aleatorio = geradorComSemente(semente);
  let estado = iniciarMao({
    config: { smallBlind, bigBlind: smallBlind * 2, ante },
    numero: 1,
    botao: botaoBruto % fichas.length,
    jogadores: fichas.map((f, i) => ({ id: `j${i}`, nome: `J${i}`, assento: i, fichas: f })),
    baralho: embaralhar(baralhoOrdenado(), aleatorio),
  }).estado;
  let passos = 0;
  while (estado.vez !== null && passos < 500) {
    estado = aplicarAcao(estado, estado.vez, acaoAleatoria(estado, aleatorio)).estado;
    passos++;
  }
  return { estado, passos };
}

describe("propriedades do motor", () => {
  it("a mão sempre termina", () => {
    fc.assert(
      fc.property(cenario, (c) => {
        const { estado, passos } = jogarMaoAleatoria(c);
        expect(passos).toBeLessThan(500);
        expect(estado.fase).toBe("encerrada");
      }),
      { numRuns: 400 },
    );
  });

  it("a soma das fichas nunca muda", () => {
    fc.assert(
      fc.property(cenario, (c) => {
        const { estado } = jogarMaoAleatoria(c);
        const antes = c.fichas.reduce((a, b) => a + b, 0);
        const depois = estado.jogadores.reduce((a, j) => a + j.fichas, 0);
        expect(depois).toBe(antes);
        expect(estado.resultado!.ganhos.reduce((a, b) => a + b, 0)).toBe(
          estado.jogadores.reduce((a, j) => a + j.totalApostado, 0),
        );
      }),
      { numRuns: 400 },
    );
  });

  it("ninguém fica com saldo negativo", () => {
    fc.assert(
      fc.property(cenario, (c) => {
        const { estado } = jogarMaoAleatoria(c);
        expect(estado.jogadores.every((j) => j.fichas >= 0)).toBe(true);
      }),
      { numRuns: 400 },
    );
  });

  it("antes do showdown, nenhuma visão contém cartas fechadas alheias", () => {
    fc.assert(
      fc.property(cenario, (c) => {
        const aleatorio = geradorComSemente(c.semente);
        let estado = iniciarMao({
          config: { smallBlind: c.smallBlind, bigBlind: c.smallBlind * 2, ante: 0 },
          numero: 1,
          botao: c.botaoBruto % c.fichas.length,
          jogadores: c.fichas.map((f, i) => ({ id: `j${i}`, nome: `J${i}`, assento: i, fichas: f })),
          baralho: embaralhar(baralhoOrdenado(), aleatorio),
        }).estado;
        while (estado.vez !== null) {
          for (let quem = 0; quem < estado.jogadores.length; quem++) {
            const visao = projetarParaJogador(estado, quem);
            visao.jogadores.forEach((j) => {
              if (j.indice !== quem) expect(j.cartas).toBeNull();
            });
          }
          estado = aplicarAcao(estado, estado.vez, acaoAleatoria(estado, aleatorio)).estado;
        }
      }),
      { numRuns: 150 },
    );
  });
});
