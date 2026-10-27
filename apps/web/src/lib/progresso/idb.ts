/**
 * IndexedDB mínimo, sem dependência: um banco "poker-amigos" com duas lojas.
 * - "eventos": eventos de XP (chave = id do evento)
 * - "kv": pares chave/valor (progresso do tutorial, primeiro acesso, sessão do treino)
 * Se o navegador não tiver IndexedDB (aba anônima restrita, por exemplo), cai para memória
 * e avisa: o jogo continua, só não guarda entre aberturas.
 */
const NOME = "poker-amigos";
const VERSAO = 1;

let promessa: Promise<IDBDatabase | null> | null = null;
const memoria = { eventos: new Map<string, unknown>(), kv: new Map<string, unknown>() };
export let armazenamentoPersistente = true;

function abrir(): Promise<IDBDatabase | null> {
  if (promessa) return promessa;
  promessa = new Promise((resolver) => {
    if (typeof indexedDB === "undefined") {
      armazenamentoPersistente = false;
      resolver(null);
      return;
    }
    try {
      const pedido = indexedDB.open(NOME, VERSAO);
      pedido.onupgradeneeded = () => {
        const banco = pedido.result;
        if (!banco.objectStoreNames.contains("eventos")) banco.createObjectStore("eventos", { keyPath: "id" });
        if (!banco.objectStoreNames.contains("kv")) banco.createObjectStore("kv");
      };
      pedido.onsuccess = () => resolver(pedido.result);
      pedido.onerror = () => {
        armazenamentoPersistente = false;
        resolver(null);
      };
    } catch {
      armazenamentoPersistente = false;
      resolver(null);
    }
  });
  return promessa;
}

function transacao<T>(loja: "eventos" | "kv", modo: IDBTransactionMode, agir: (store: IDBObjectStore) => IDBRequest<T>) {
  return abrir().then(
    (banco) =>
      new Promise<T | undefined>((resolver, rejeitar) => {
        if (!banco) {
          resolver(undefined);
          return;
        }
        const pedido = agir(banco.transaction(loja, modo).objectStore(loja));
        pedido.onsuccess = () => resolver(pedido.result);
        pedido.onerror = () => rejeitar(pedido.error);
      }),
  );
}

export async function listarEventos<T>(): Promise<T[]> {
  const banco = await abrir();
  if (!banco) return [...memoria.eventos.values()] as T[];
  return ((await transacao("eventos", "readonly", (s) => s.getAll())) ?? []) as T[];
}

export async function gravarEvento<T extends { id: string }>(evento: T): Promise<void> {
  const banco = await abrir();
  if (!banco) {
    memoria.eventos.set(evento.id, evento);
    return;
  }
  await transacao("eventos", "readwrite", (s) => s.put(evento));
}

export async function lerValor<T>(chave: string): Promise<T | undefined> {
  const banco = await abrir();
  if (!banco) return memoria.kv.get(chave) as T | undefined;
  return (await transacao("kv", "readonly", (s) => s.get(chave))) as T | undefined;
}

export async function gravarValor(chave: string, valor: unknown): Promise<void> {
  const banco = await abrir();
  if (!banco) {
    memoria.kv.set(chave, valor);
    return;
  }
  await transacao("kv", "readwrite", (s) => s.put(valor, chave));
}
