/**
 * Os 10 módulos do tutorial, na ordem. Só estas chaves rendem XP de módulo: assim ninguém
 * inventa "tutorial:qualquer-coisa" para somar XP ou completar o tutorial sem fazer.
 * O servidor usa a mesma lista (migração de progressão).
 */
export const IDS_MODULOS_TUTORIAL = [
  "mesa",
  "objetivo",
  "ranking",
  "ordem",
  "acoes",
  "rodadas",
  "pratica",
  "vencedor",
  "estrategia",
  "desafio",
] as const;

export type IdModuloTutorial = (typeof IDS_MODULOS_TUTORIAL)[number];
