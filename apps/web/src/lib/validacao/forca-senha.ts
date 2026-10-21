/**
 * Estimativa simples da força de uma senha, só para orientar quem está digitando.
 * Não substitui as regras do servidor (mínimo de 8 caracteres, máximo de 72 bytes).
 */
export type ForcaSenha = { nivel: 0 | 1 | 2 | 3 | 4; rotulo: string };

const rotulos = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"] as const;

export function avaliarForcaSenha(senha: string): ForcaSenha {
  if (senha.length === 0) return { nivel: 0, rotulo: "" };

  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  // Repetições como "aaaaaaaa" ou "12121212" valem pouco.
  if (new Set(senha).size <= 3) pontos = Math.min(pontos, 1);
  if (senha.length < 8) pontos = Math.min(pontos, 1);

  const nivel = Math.min(4, pontos) as ForcaSenha["nivel"];
  return { nivel, rotulo: rotulos[nivel] };
}
