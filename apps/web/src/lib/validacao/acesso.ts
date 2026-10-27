import { z } from "zod";
import { nomeSchema } from "./nome";

/**
 * Schemas dos formulários de acesso (login e resgate de convite).
 *
 * Eles rodam no servidor (Server Actions) e podem ser reaproveitados no cliente.
 * O formato final do código de convite será decidido na fase 2; por ora aceitamos
 * letras e números, ignorando espaços, hífens e maiúsculas/minúsculas.
 */

export const SENHA_MIN = 8;
/** O bcrypt usado pelo Supabase Auth só considera os primeiros 72 bytes. */
export const SENHA_MAX = 72;

export const CODIGO_CONVITE_MIN = 8;
export const CODIGO_CONVITE_MAX = 32;

/** Remove espaços e hífens e coloca em maiúsculas: "abcd-efgh" vira "ABCDEFGH". */
export function normalizarCodigoConvite(bruto: string): string {
  return bruto.replace(/[\s-]/g, "").toUpperCase();
}

export const codigoConviteSchema = z
  .string({ error: "Informe o código do convite." })
  .transform(normalizarCodigoConvite)
  .pipe(
    z
      .string()
      .min(CODIGO_CONVITE_MIN, "O código parece curto demais. Confira com quem te convidou.")
      .max(CODIGO_CONVITE_MAX, "O código parece longo demais. Confira com quem te convidou.")
      .regex(/^[A-Z0-9]+$/, "Use apenas letras e números."),
  );

export const emailSchema = z
  .string({ error: "Informe seu email." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Informe um email válido."));

export const senhaSchema = z
  .string({ error: "Informe sua senha." })
  .min(SENHA_MIN, `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`)
  .refine((senha) => new TextEncoder().encode(senha).length <= SENHA_MAX, {
    error: `A senha pode ter no máximo ${SENHA_MAX} bytes.`,
  });

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string({ error: "Informe sua senha." }).min(1, "Informe sua senha."),
});

export const resgateConviteSchema = z
  .object({
    codigo: codigoConviteSchema,
    nome: nomeSchema,
    email: emailSchema,
    senha: senhaSchema,
    confirmacaoSenha: z.string({ error: "Confirme sua senha." }),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    error: "As senhas não conferem.",
    path: ["confirmacaoSenha"],
  });

/** Primeiro acesso do dono: igual ao resgate, sem código (quem autoriza é o email no banco). */
export const primeiroAcessoSchema = z
  .object({
    nome: nomeSchema,
    email: emailSchema,
    senha: senhaSchema,
    confirmacaoSenha: z.string({ error: "Confirme sua senha." }),
  })
  .refine((dados) => dados.senha === dados.confirmacaoSenha, {
    error: "As senhas não conferem.",
    path: ["confirmacaoSenha"],
  });

export type DadosLogin = z.infer<typeof loginSchema>;
export type DadosResgateConvite = z.infer<typeof resgateConviteSchema>;
export type DadosPrimeiroAcesso = z.infer<typeof primeiroAcessoSchema>;

/** Converte FormData em objeto simples, descartando arquivos e campos internos do React. */
export function formDataParaObjeto(formData: FormData): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [chave, valor] of formData.entries()) {
    if (typeof valor === "string" && !chave.startsWith("$ACTION")) {
      resultado[chave] = valor;
    }
  }
  return resultado;
}
