import { z } from "zod";

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** Mesma validação que a função salvar_aparencia faz no banco. */
export const aparenciaSchema = z.object({
  pele: cor,
  roupa: cor,
  fundo: cor,
  acessorio: z.enum(["nenhum", "oculos", "bone", "brinco"]),
  cabelo: z.object({ estilo: z.enum(["curto", "longo", "coque", "moicano", "careca"]), cor }),
});
