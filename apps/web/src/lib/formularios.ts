/**
 * Estado devolvido pelas Server Actions dos formulários (usado com useActionState).
 */
export type EstadoFormulario<Campo extends string> = {
  status: "ocioso" | "erro" | "indisponivel" | "sucesso";
  mensagem?: string;
  erros?: Partial<Record<Campo, string[]>>;
  /** Valores para repreencher o formulário. Senhas nunca voltam ao cliente. */
  valores?: Partial<Record<Campo, string>>;
};

export function estadoInicial<Campo extends string>(): EstadoFormulario<Campo> {
  return { status: "ocioso" };
}
