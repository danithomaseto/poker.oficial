import { decidir, type EntradaBot } from "@poker/bots";
import type { Acao } from "@poker/engine";
import { aleatorio01 } from "./aleatorio";

export type PedidoBot = Omit<EntradaBot, "aleatorio">;

/**
 * Roda a decisão do bot num Web Worker para as simulações Monte Carlo não travarem a tela.
 * Se o navegador não suportar workers, decide na própria thread.
 */
let worker: Worker | null = null;
let proximoId = 0;
const pendentes = new Map<number, (acao: Acao) => void>();

function obterWorker(): Worker | null {
  if (worker || typeof Worker === "undefined") return worker;
  try {
    worker = new Worker(new URL("./bot.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (evento: MessageEvent<{ id: number; acao: Acao }>) => {
      pendentes.get(evento.data.id)?.(evento.data.acao);
      pendentes.delete(evento.data.id);
    };
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
    };
  } catch {
    worker = null;
  }
  return worker;
}

export function pedirDecisao(pedido: PedidoBot): Promise<Acao> {
  const w = obterWorker();
  if (!w) return Promise.resolve(decidir({ ...pedido, aleatorio: aleatorio01 }));
  const id = proximoId++;
  return new Promise((resolver) => {
    pendentes.set(id, resolver);
    w.postMessage({ id, pedido });
    // Segurança: se o worker não responder, decide aqui mesmo.
    setTimeout(() => {
      if (pendentes.has(id)) {
        pendentes.delete(id);
        resolver(decidir({ ...pedido, aleatorio: aleatorio01 }));
      }
    }, 4000);
  });
}

/**
 * Baixa o script dos bots uma vez (o service worker guarda) para o treino funcionar offline
 * mesmo que você ainda não tenha jogado com internet. O worker de aquecimento é descartado.
 */
export function aquecerBots(): void {
  if (worker || typeof Worker === "undefined") return;
  try {
    const temporario = new Worker(new URL("./bot.worker.ts", import.meta.url), { type: "module" });
    setTimeout(() => temporario.terminate(), 5000);
  } catch {
    // sem worker: os bots decidem na thread principal, nada a baixar
  }
}
