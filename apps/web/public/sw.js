/*
 * Service worker do Poker entre Amigos: deixa o treino, o tutorial, a coleção e o progresso
 * funcionando sem internet. Regras:
 *
 * - /_next/static/* (arquivos com hash, nunca mudam): cache primeiro.
 * - Páginas (navegação): rede primeiro; sem rede, a cópia guardada; sem cópia, /offline.
 * - Pedidos RSC sem rede falham de propósito: o Next refaz como navegação normal, que cai
 *   na regra de cima e abre a cópia guardada.
 * - Supabase e qualquer outro domínio: não passam por aqui (sempre rede).
 *
 * A versão vem do endereço de registro (/sw.js?v=<commit>): cada deploy troca os caches.
 */
const VERSAO = new URL(self.location.href).searchParams.get("v") || "local";
const ESTATICO = `poker-estatico-${VERSAO}`;
const PAGINAS = `poker-paginas-${VERSAO}`;
const OFFLINE = ["/treino", "/tutorial", "/baralhos", "/progresso", "/offline", "/"];

/** Guarda a página e os arquivos /_next/static que ela carrega (scripts, estilos, fontes). */
async function guardarPagina(caminho) {
  const resposta = await fetch(caminho, { cache: "reload", credentials: "same-origin" });
  if (!resposta.ok) return;
  const html = await resposta.clone().text();
  await (await caches.open(PAGINAS)).put(caminho, resposta);
  const arquivos = new Set(html.match(/\/_next\/static\/[^"'\s)<>\\]+/g) || []);
  const estatico = await caches.open(ESTATICO);
  await Promise.allSettled(
    [...arquivos].map(async (url) => {
      if (await estatico.match(url)) return;
      const r = await fetch(url);
      if (r.ok) await estatico.put(url, r);
    }),
  );
}

self.addEventListener("install", (evento) => {
  evento.waitUntil(Promise.allSettled(OFFLINE.map(guardarPagina)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("poker-") && n !== ESTATICO && n !== PAGINAS).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (evento) => {
  // Ao sair da conta: troca as páginas guardadas (o cabeçalho delas tinha o seu nome). Espera
  // alguns segundos para o servidor terminar de encerrar a sessão antes de baixar de novo.
  if (evento.data === "limpar-paginas") {
    evento.waitUntil(
      new Promise((pronto) => setTimeout(pronto, 4000)).then(() => Promise.allSettled(OFFLINE.map(guardarPagina))),
    );
  }
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    evento.respondWith(
      caches.open(ESTATICO).then(async (cache) => {
        const guardada = await cache.match(pedido);
        if (guardada) return guardada;
        const resposta = await fetch(pedido);
        if (resposta.ok) cache.put(pedido, resposta.clone());
        return resposta;
      }),
    );
    return;
  }

  if (pedido.mode === "navigate") {
    evento.respondWith(
      (async () => {
        const cache = await caches.open(PAGINAS);
        try {
          const resposta = await fetch(pedido);
          if (resposta.ok && OFFLINE.includes(url.pathname)) cache.put(url.pathname, resposta.clone());
          return resposta;
        } catch {
          return (await cache.match(url.pathname)) || (await cache.match("/offline")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Ícone, manifesto e outros arquivos do próprio site: rede, com a cópia guardada de reserva.
  if (!url.searchParams.has("_rsc") && !pedido.headers.has("RSC")) {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          if (resposta.ok && (url.pathname === "/icon.svg" || url.pathname === "/manifest.webmanifest")) {
            const copia = resposta.clone();
            caches.open(ESTATICO).then((c) => c.put(pedido, copia));
          }
          return resposta;
        })
        .catch(async () => (await caches.match(pedido)) || Response.error()),
    );
  }
});
