import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BARALHOS, NIVEIS_DE_DESBLOQUEIO, ehGratuito } from "@poker/progressao";

const css = readFileSync(join(__dirname, "../app/temas-baralho.css"), "utf8");

describe("temas de baralho", () => {
  it("tem pelo menos 10 baralhos gratuitos", () => {
    expect(BARALHOS.filter(ehGratuito).length).toBeGreaterThanOrEqual(10);
  });

  it("libera baralhos nos níveis combinados", () => {
    expect([...NIVEIS_DE_DESBLOQUEIO]).toEqual([3, 5, 8, 10, 13, 15, 18, 20, 23, 25, 30]);
  });

  it("todo baralho do catálogo tem o tema no CSS, com face e verso", () => {
    for (const b of BARALHOS) {
      const inicio = css.indexOf(`[data-tema-baralho="${b.id}"]`);
      expect(inicio, b.id).toBeGreaterThanOrEqual(0);
      const bloco = css.slice(inicio, css.indexOf("}", inicio));
      for (const v of ["--carta-face", "--cor-espadas", "--cor-copas", "--verso-fundo"]) {
        expect(bloco, `${b.id} sem ${v}`).toContain(v);
      }
    }
  });
});
