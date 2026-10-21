import { describe, expect, it } from "vitest";
import {
  SENHA_MAX,
  codigoConviteSchema,
  emailSchema,
  formDataParaObjeto,
  loginSchema,
  normalizarCodigoConvite,
  resgateConviteSchema,
  senhaSchema,
} from "./acesso";

describe("normalizarCodigoConvite", () => {
  it("remove espaços e hífens e coloca em maiúsculas", () => {
    expect(normalizarCodigoConvite(" abcd-efgh 1234 ")).toBe("ABCDEFGH1234");
  });
});

describe("codigoConviteSchema", () => {
  it("aceita código válido e devolve normalizado", () => {
    expect(codigoConviteSchema.parse("k7qp-2mzx-9wrt")).toBe("K7QP2MZX9WRT");
  });

  it("rejeita código curto demais", () => {
    expect(codigoConviteSchema.safeParse("ab-12").success).toBe(false);
  });

  it("rejeita caracteres fora de letras e números", () => {
    expect(codigoConviteSchema.safeParse("ABCD_EFGH!").success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("normaliza para minúsculas e remove espaços", () => {
    expect(emailSchema.parse("  Fulano@Exemplo.COM ")).toBe("fulano@exemplo.com");
  });

  it("rejeita email inválido", () => {
    expect(emailSchema.safeParse("fulano@").success).toBe(false);
  });
});

describe("senhaSchema", () => {
  it("rejeita senha com menos de 8 caracteres", () => {
    expect(senhaSchema.safeParse("1234567").success).toBe(false);
  });

  it("aceita senha com 8 caracteres", () => {
    expect(senhaSchema.safeParse("12345678").success).toBe(true);
  });

  it("conta bytes, não caracteres, no limite máximo", () => {
    // "é" ocupa 2 bytes em UTF-8: 37 deles somam 74 bytes, acima do limite de 72.
    expect(senhaSchema.safeParse("é".repeat(37)).success).toBe(false);
    expect(senhaSchema.safeParse("a".repeat(SENHA_MAX)).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("exige senha preenchida", () => {
    const resultado = loginSchema.safeParse({ email: "a@b.com", senha: "" });
    expect(resultado.success).toBe(false);
  });
});

describe("resgateConviteSchema", () => {
  const base = {
    codigo: "ABCD-EFGH-1234",
    email: "amigo@exemplo.com",
    senha: "senha-forte-1",
    confirmacaoSenha: "senha-forte-1",
  };

  it("aceita dados válidos", () => {
    const resultado = resgateConviteSchema.parse(base);
    expect(resultado.codigo).toBe("ABCDEFGH1234");
  });

  it("aponta o erro no campo de confirmação quando as senhas diferem", () => {
    const resultado = resgateConviteSchema.safeParse({ ...base, confirmacaoSenha: "outra" });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(["confirmacaoSenha"]);
  });
});

describe("formDataParaObjeto", () => {
  it("ignora campos internos do React e arquivos", () => {
    const formData = new FormData();
    formData.set("email", "a@b.com");
    formData.set("$ACTION_ID_123", "");
    formData.set("arquivo", new Blob(["x"]));
    expect(formDataParaObjeto(formData)).toEqual({ email: "a@b.com" });
  });
});
