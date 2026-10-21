import { describe, expect, it } from "vitest";
import { formatarCodigoConvite } from "./formatar-codigo";

describe("formatarCodigoConvite", () => {
  it("agrupa de 4 em 4 com hífen e maiúsculas", () => {
    expect(formatarCodigoConvite("k7qp2mzx9wrt")).toBe("K7QP-2MZX-9WRT");
  });

  it("remove caracteres inválidos e hífens digitados", () => {
    expect(formatarCodigoConvite("k7-qp_2m!")).toBe("K7QP-2M");
  });

  it("retorna vazio para entrada vazia", () => {
    expect(formatarCodigoConvite("")).toBe("");
  });
});
