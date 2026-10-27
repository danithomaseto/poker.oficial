"use client";

import { useEffect } from "react";

const VERSAO = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local";

/**
 * Registra o service worker (só no build de produção: em desenvolvimento ele atrapalharia o
 * recarregamento). Depois de pronto, baixa o script dos bots para o treino funcionar offline.
 */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const registrar = () => {
      navigator.serviceWorker
        .register(`/sw.js?v=${VERSAO}`, { scope: "/" })
        .then(() => navigator.serviceWorker.ready)
        .then(() => import("./treino/executar-bot"))
        .then((m) => m.aquecerBots())
        .catch(() => undefined);
    };
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);
  return null;
}

/** Ao sair da conta: as páginas guardadas offline são baixadas de novo, sem o seu nome. */
export function limparPaginasOffline() {
  navigator.serviceWorker?.controller?.postMessage("limpar-paginas");
}
