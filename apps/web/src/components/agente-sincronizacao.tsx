"use client";

import { useEffect, useRef } from "react";
import { podeEquipar } from "@poker/progressao";
import { salvarPreferencias } from "@/lib/preferencias";
import { useProgressoLocal } from "@/lib/progresso/local";
import { responderAssociacao, sincronizar, useNivelEfetivo } from "@/lib/progresso/sincronizacao";
import { classesBotao } from "./botao";

/**
 * Mantém o progresso em dia com a conta: sincroniza ao abrir, ao voltar a internet, ao voltar
 * para a aba e logo depois de ganhar XP. Também pergunta, uma vez, se o progresso de convidado
 * deve ir para a conta logada.
 */
export function AgenteSincronizacao() {
  const { pendentes } = useProgressoLocal();
  const { sync, situacao } = useNivelEfetivo();
  const baralhoAplicado = useRef(false);

  useEffect(() => {
    void sincronizar();
    const aoVoltar = () => void sincronizar();
    const aoFocar = () => document.visibilityState === "visible" && void sincronizar();
    window.addEventListener("online", aoVoltar);
    document.addEventListener("visibilitychange", aoFocar);
    return () => {
      window.removeEventListener("online", aoVoltar);
      document.removeEventListener("visibilitychange", aoFocar);
    };
  }, []);

  // Depois de ganhar XP, envia em lote (alguns segundos depois).
  useEffect(() => {
    if (pendentes.length === 0) return;
    const id = window.setTimeout(() => void sincronizar(), 3000);
    return () => window.clearTimeout(id);
  }, [pendentes.length]);

  // Ao entrar na conta, o baralho salvo nela vale neste aparelho (se o nível permitir).
  useEffect(() => {
    if (sync.estado !== "ok" || !sync.remoto || baralhoAplicado.current) return;
    baralhoAplicado.current = true;
    if (podeEquipar(sync.remoto.baralho, situacao.nivel)) salvarPreferencias({ temaBaralho: sync.remoto.baralho });
  }, [sync.estado, sync.remoto, situacao.nivel]);

  if (sync.estado !== "pede-associacao") return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-associar" className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animar-aviso w-full max-w-md rounded-(--radius-painel) border border-borda bg-superficie-2 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
        <p className="rotulo text-ouro-300">Progresso deste aparelho</p>
        <h2 id="titulo-associar" className="mt-2 font-display text-2xl text-creme-50">
          Juntar com a sua conta?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-creme-300">
          Você tem {sync.pendentesConvidado} {sync.pendentesConvidado === 1 ? "conquista" : "conquistas"} de treino e
          tutorial feitas aqui sem estar logado. Se juntar, o servidor confere cada uma (com os mesmos limites diários)
          e soma na conta. Se não, elas continuam só neste aparelho. Nada é apagado.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={classesBotao("primario", "lg")} onClick={() => void responderAssociacao(true)}>
            Juntar à conta
          </button>
          <button type="button" className={classesBotao("secundario", "lg")} onClick={() => void responderAssociacao(false)}>
            Manter só aqui
          </button>
        </div>
      </div>
    </div>
  );
}
