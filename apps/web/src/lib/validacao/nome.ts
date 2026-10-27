import { z } from "zod";

/**
 * Nome exibido na mesa: 3 a 20 caracteres, letras, números, espaço, ponto, hífen e sublinhado,
 * com filtro simples de palavrões (comparando sem acentos e sem diferenciar maiúsculas).
 */
export const NOME_MIN = 3;
export const NOME_MAX = 20;

const PROIBIDOS = [
  "porra",
  "caralho",
  "puta",
  "puto",
  "merda",
  "buceta",
  "viado",
  "foder",
  "fodase",
  "arrombado",
  "corno",
  "cuzao",
  "otario",
  "vagabundo",
  "fdp",
  "pqp",
  "vsf",
  "nazista",
  "hitler",
];

export function semAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function nomeImproprio(nome: string): boolean {
  const limpo = semAcentos(nome)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return PROIBIDOS.some((p) => limpo.includes(p));
}

export const nomeSchema = z
  .string({ error: "Escolha um nome para a mesa." })
  .transform((n) => n.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(NOME_MIN, `O nome precisa ter pelo menos ${NOME_MIN} caracteres.`)
      .max(NOME_MAX, `O nome pode ter no máximo ${NOME_MAX} caracteres.`)
      .regex(/^[\p{L}\p{N} ._-]+$/u, "Use letras, números, espaço, ponto, hífen ou sublinhado.")
      .refine((n) => !nomeImproprio(n), { error: "Esse nome não rola. Escolhe outro?" }),
  );
