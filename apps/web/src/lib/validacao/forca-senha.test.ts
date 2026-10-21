import { describe, expect, it } from "vitest";
import { avaliarForcaSenha } from "./forca-senha";

describe("avaliarForcaSenha", () => {
  it("senha vazia não tem rótulo", () => {
    expect(avaliarForcaSenha("")).toEqual({ nivel: 0, rotulo: "" });
  });

  it("senha curta fica no máximo como fraca", () => {
    expect(avaliarForcaSenha("Ab1!").nivel).toBeLessThanOrEqual(1);
  });

  it("repetição de poucos caracteres fica no máximo como fraca", () => {
    expect(avaliarForcaSenha("aaaaaaaaaaaaaaaa").nivel).toBeLessThanOrEqual(1);
  });

  it("senha longa e variada é forte", () => {
    expect(avaliarForcaSenha("Fichas-Na-Mesa-2026").rotulo).toBe("Forte");
  });
});
