import { CODIGO_CONVITE_MAX, normalizarCodigoConvite } from "./acesso";

/**
 * Formata o código enquanto a pessoa digita: "k7qp2mzx" vira "K7QP-2MZX".
 * Só muda a exibição; o servidor sempre normaliza de novo antes de validar.
 */
export function formatarCodigoConvite(bruto: string): string {
  const limpo = normalizarCodigoConvite(bruto)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODIGO_CONVITE_MAX);
  return limpo.match(/.{1,4}/g)?.join("-") ?? "";
}
