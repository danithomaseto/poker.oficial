import type { EstadoMao } from "@poker/engine";

/**
 * Estatísticas que o bot Extremo usa para se adaptar ao estilo de cada adversário.
 * Atualizadas pelo controlador da mesa ao fim de cada mão, só com ações públicas.
 */
export interface PerfilAdversario {
  maos: number;
  /** Mãos em que colocou fichas por vontade própria no pré-flop (pagou ou aumentou). */
  vpip: number;
  /** Mãos em que aumentou no pré-flop. */
  pfr: number;
  apostasOuAumentos: number;
  pagamentos: number;
  /** Vezes que desistiu diante de uma aposta. */
  desistencias: number;
}

export type Perfis = Record<string, PerfilAdversario>;

function perfilVazio(): PerfilAdversario {
  return { maos: 0, vpip: 0, pfr: 0, apostasOuAumentos: 0, pagamentos: 0, desistencias: 0 };
}

export function registrarMao(perfis: Perfis, estadoFinal: EstadoMao): Perfis {
  const novo: Perfis = { ...perfis };
  estadoFinal.jogadores.forEach((j, i) => {
    const p = { ...(novo[j.id] ?? perfilVazio()) };
    p.maos++;
    const minhas = estadoFinal.acoes.filter((a) => a.indice === i);
    const preflop = minhas.filter((a) => a.fase === "preflop");
    if (preflop.some((a) => a.tipo === "pagar" || a.tipo === "aumentar" || a.tipo === "apostar")) p.vpip++;
    if (preflop.some((a) => a.tipo === "aumentar")) p.pfr++;
    for (const a of minhas) {
      if (a.tipo === "apostar" || a.tipo === "aumentar") p.apostasOuAumentos++;
      else if (a.tipo === "pagar") p.pagamentos++;
      else if (a.tipo === "desistir") p.desistencias++;
    }
    novo[j.id] = p;
  });
  return novo;
}

/** Leitura do estilo, com médias suavizadas para poucas mãos não enganarem. */
export function lerEstilo(perfil: PerfilAdversario | undefined) {
  const maos = perfil?.maos ?? 0;
  const vpip = ((perfil?.vpip ?? 0) + 2.5) / (maos + 10); // tende a 25% sem dados
  const agressivas = perfil?.apostasOuAumentos ?? 0;
  const passivas = perfil?.pagamentos ?? 0;
  const fatorAgressao = (agressivas + 1) / (passivas + 1);
  const enfrentou = agressivas + passivas + (perfil?.desistencias ?? 0);
  const desisteDiante = ((perfil?.desistencias ?? 0) + 3) / (enfrentou + 8); // tende a ~37%
  return { vpip, fatorAgressao, desisteDiante, confianca: Math.min(1, maos / 30) };
}
