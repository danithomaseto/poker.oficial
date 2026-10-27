/**
 * Catálogo de baralhos (cosméticos). Só metadados: o visual de cada tema mora no CSS do app
 * (`[data-tema-baralho="<id>"]`), então adicionar um tema novo é: uma entrada aqui, um bloco
 * de variáveis no CSS e (se desbloqueável) uma linha na tabela `catalogo_baralhos` do banco.
 *
 * Tema nunca muda valor, naipe ou regra: só cores, texturas e o verso.
 */
export type CategoriaBaralho = "classico" | "escuro" | "natureza" | "luxo" | "artistico";

export interface Baralho {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaBaralho;
  /** 1 = gratuito desde o início. */
  nivelMinimo: number;
  versao: number;
  /** Fica no catálogo mas não pode ser equipado (ex.: em manutenção). */
  disponivel: boolean;
}

export const BARALHO_PADRAO = "classico";

export const BARALHOS: readonly Baralho[] = [
  // Gratuitos (nível 1)
  { id: "classico", nome: "Clássico", descricao: "Papel creme, naipes tradicionais e o verso vinho da casa.", categoria: "classico", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "meia-noite", nome: "Meia-noite", descricao: "Face azul-noite com naipes claros e verso estrelado.", categoria: "escuro", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "esmeralda", nome: "Esmeralda", descricao: "Marfim com moldura verde e verso em treliça de esmeralda.", categoria: "natureza", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "carmim", nome: "Carmim", descricao: "Moldura vermelho-escura e verso adamascado.", categoria: "luxo", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "oceano", nome: "Oceano", descricao: "Branco-gelo, naipes marinhos e verso de ondas.", categoria: "natureza", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "monocromo", nome: "Monocromo", descricao: "Preto, branco e cinza. Copas e ouros em cinza com contorno.", categoria: "classico", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "realeza", nome: "Realeza", descricao: "Pergaminho, filete dourado e verso púrpura com brasão.", categoria: "luxo", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "circuito", nome: "Circuito", descricao: "Grafite com naipes ciano e magenta e verso em malha.", categoria: "escuro", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "deserto", nome: "Ouro do Deserto", descricao: "Areia, terracota e verso listrado em dourado.", categoria: "natureza", nivelMinimo: 1, versao: 1, disponivel: true },
  { id: "aurora", nome: "Aurora", descricao: "Face clara e verso em faixas de luz violeta, verde e azul.", categoria: "artistico", nivelMinimo: 1, versao: 1, disponivel: true },
  // Desbloqueáveis por nível
  { id: "feltro", nome: "Feltro de Mesa", descricao: "Verso com a textura do feltro e o friso da mesa.", categoria: "classico", nivelMinimo: 3, versao: 1, disponivel: true },
  { id: "art-deco", nome: "Art Déco", descricao: "Preto e ouro em geometria de leque.", categoria: "luxo", nivelMinimo: 5, versao: 1, disponivel: true },
  { id: "cartografia", nome: "Cartografia", descricao: "Papel antigo com curvas de nível no verso.", categoria: "artistico", nivelMinimo: 8, versao: 1, disponivel: true },
  { id: "vitral", nome: "Vitral", descricao: "Verso em mosaico de vidro colorido.", categoria: "artistico", nivelMinimo: 10, versao: 1, disponivel: true },
  { id: "carvao", nome: "Carvão", descricao: "Traço de carvão sobre papel e verso esfumado.", categoria: "artistico", nivelMinimo: 13, versao: 1, disponivel: true },
  { id: "jade", nome: "Jade Imperial", descricao: "Verde-jade com detalhes em ouro velho.", categoria: "luxo", nivelMinimo: 15, versao: 1, disponivel: true },
  { id: "safira", nome: "Safira", descricao: "Azul profundo lapidado e verso facetado.", categoria: "luxo", nivelMinimo: 18, versao: 1, disponivel: true },
  { id: "obsidiana", nome: "Obsidiana", descricao: "Face negra polida, naipes em ouro e verso espelhado.", categoria: "escuro", nivelMinimo: 20, versao: 1, disponivel: true },
  { id: "cobre", nome: "Cobre Antigo", descricao: "Cobre com pátina verde nas bordas.", categoria: "natureza", nivelMinimo: 23, versao: 1, disponivel: true },
  { id: "luar", nome: "Luar", descricao: "Prata fria e verso com lua crescente.", categoria: "escuro", nivelMinimo: 25, versao: 1, disponivel: true },
  { id: "mestres", nome: "Mesa dos Mestres", descricao: "O baralho de quem chegou ao topo: preto, ouro e um brilho discreto.", categoria: "luxo", nivelMinimo: 30, versao: 1, disponivel: true },
];

export const NIVEIS_DE_DESBLOQUEIO = [3, 5, 8, 10, 13, 15, 18, 20, 23, 25, 30] as const;

export function baralhoPorId(id: string): Baralho | undefined {
  return BARALHOS.find((b) => b.id === id);
}

export const ehGratuito = (b: Baralho) => b.nivelMinimo <= 1;

/** Pode equipar: existe, está disponível e o nível alcança o mínimo. */
export function podeEquipar(id: string, nivel: number): boolean {
  const b = baralhoPorId(id);
  return !!b && b.disponivel && nivel >= b.nivelMinimo;
}

/** Baralho que vem como recompensa de um nível (se houver). */
export function baralhoDoNivel(nivel: number): Baralho | undefined {
  return BARALHOS.find((b) => b.nivelMinimo === nivel && nivel > 1);
}
