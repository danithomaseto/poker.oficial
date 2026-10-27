import { describe, expect, it } from "vitest";
import { nomeImproprio, nomeSchema } from "./nome";

describe("nomeSchema", () => {
  it("aceita nomes comuns e colapsa espaços", () => {
    expect(nomeSchema.parse("  Zé   do River ")).toBe("Zé do River");
  });

  it("recusa nomes curtos, longos ou com símbolos", () => {
    expect(nomeSchema.safeParse("Zé").success).toBe(false);
    expect(nomeSchema.safeParse("a".repeat(21)).success).toBe(false);
    expect(nomeSchema.safeParse("Rei<script>").success).toBe(false);
  });

  it("filtra palavrões mesmo com acento, maiúsculas ou separadores", () => {
    expect(nomeImproprio("P.O.R.R.A")).toBe(true);
    expect(nomeImproprio("Otário")).toBe(true);
    expect(nomeSchema.safeParse("Rei do Blefe").success).toBe(true);
  });
});
