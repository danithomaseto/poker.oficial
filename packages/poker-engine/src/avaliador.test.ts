import { describe, expect, it } from "vitest";
import { Categoria, avaliar, categoriaDe, descreverMao, melhoresCinco } from "./avaliador";
import { cartas } from "./cartas";

const p = (texto: string) => avaliar(cartas(texto));

describe("avaliador: categorias", () => {
  const exemplos: [string, Categoria][] = [
    ["As Ks Qs Js Ts 2d 3c", Categoria.StraightFlush],
    ["9h 9d 9s 9c 2d 3c 4h", Categoria.Quadra],
    ["Kh Kd Ks 4c 4d 2s 7h", Categoria.FullHouse],
    ["Ah Jh 8h 6h 2h Kd Qc", Categoria.Flush],
    ["Tc 9d 8s 7h 6c 2d 2h", Categoria.Sequencia],
    ["7s 7h 7c Kd 2s 4d 9c", Categoria.Trinca],
    ["Jh Jc 5s 5d Ac 3h 2d", Categoria.DoisPares],
    ["Th Ts Kc 8d 3h 2s 4c", Categoria.Par],
    ["Ac Qd 9s 6h 3c 2d 4s", Categoria.CartaAlta],
  ];

  it.each(exemplos)("%s é da categoria %i", (mao, categoria) => {
    expect(categoriaDe(p(mao))).toBe(categoria);
  });

  it("categorias ficam em ordem de força", () => {
    const pontuacoes = exemplos.map(([mao]) => p(mao));
    const ordenadas = [...pontuacoes].sort((a, b) => b - a);
    expect(pontuacoes).toEqual(ordenadas);
  });
});

describe("avaliador: desempates", () => {
  it("kicker decide entre pares iguais", () => {
    expect(p("Ah Ad Kc 7s 4d 3h 2c")).toBeGreaterThan(p("Ah Ad Qc 7s 4d 3h 2c"));
  });

  it("a roda (A-2-3-4-5) é a menor sequência", () => {
    const roda = p("Ah 2d 3c 4s 5h 9d Kc");
    expect(categoriaDe(roda)).toBe(Categoria.Sequencia);
    expect(p("2d 3c 4s 5h 6h 9d Kc")).toBeGreaterThan(roda);
    expect(descreverMao(roda)).toBe("Sequência baixa (A-5)");
  });

  it("straight flush na roda", () => {
    expect(categoriaDe(p("Ah 2h 3h 4h 5h Kd Kc"))).toBe(Categoria.StraightFlush);
  });

  it("board jogando: as duas mãos empatam", () => {
    const board = "As Ks Qs Js Ts";
    expect(p(`${board} 2d 3c`)).toBe(p(`${board} 4h 5d`));
  });

  it("com três pares, o terceiro pode virar kicker", () => {
    // Pares de K e Q; o 9 (do terceiro par) é melhor kicker que o 5 solto.
    expect(p("Kh Kd Qh Qd 9s 9c 5h")).toBeGreaterThan(p("Kh Kd Qh Qd 8s 7c 5h"));
  });

  it("full house com duas trincas usa a maior como trinca", () => {
    expect(descreverMao(p("Kh Kd Ks 4c 4d 4s 7h"))).toBe("Full house, Reis com Quatros");
  });

  it("flush com seis cartas do naipe usa as cinco maiores", () => {
    expect(p("Ah Jh 8h 6h 3h 2h Kd")).toBeGreaterThan(p("Ah Jh 8h 6h 2h 4d Kd"));
  });

  it("royal flush tem nome próprio", () => {
    expect(descreverMao(p("As Ks Qs Js Ts 2d 3c"))).toBe("Royal flush");
  });

  it("melhoresCinco devolve as 5 cartas da melhor mão", () => {
    const sete = cartas("Kh Kd Ks 4c 4d 2s 7h");
    const cinco = melhoresCinco(sete);
    expect(cinco).toHaveLength(5);
    expect(avaliar(cinco)).toBe(avaliar(sete));
  });

  it("recusa menos de 5 cartas", () => {
    expect(() => avaliar(cartas("As Ks"))).toThrow(RangeError);
  });
});
