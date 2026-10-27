import { decidir } from "@poker/bots";
import { aleatorio01 } from "./aleatorio";
import type { PedidoBot } from "./executar-bot";

// Este arquivo roda dentro de um Web Worker: `self` é o escopo do worker, não a janela.
const escopo = self as unknown as {
  onmessage: ((evento: MessageEvent<{ id: number; pedido: PedidoBot }>) => void) | null;
  postMessage(mensagem: unknown): void;
};

escopo.onmessage = (evento) => {
  const { id, pedido } = evento.data;
  escopo.postMessage({ id, acao: decidir({ ...pedido, aleatorio: aleatorio01 }) });
};
