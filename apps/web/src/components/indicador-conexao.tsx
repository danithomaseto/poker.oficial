"use client";

import { useOnline } from "@/lib/conexao";
import { useNivelEfetivo } from "@/lib/progresso/sincronizacao";

/** Estado de conexão e de sincronização, discreto no cabeçalho. */
export function IndicadorConexao() {
  const online = useOnline();
  const { sync, local } = useNivelEfetivo();
  const pendentes = local.pendentes.length;

  const [cor, texto, dica] = !online
    ? ["bg-ouro-400", "Offline", "Sem internet: treino, tutorial, coleção e progresso continuam funcionando neste aparelho."]
    : sync.estado === "sincronizando"
      ? ["bg-ouro-300 animate-pulse", "Sincronizando", "Enviando seu progresso para a conta."]
      : sync.estado === "erro"
        ? ["bg-perigo", "Sem conexão com a conta", "O servidor não respondeu. Tentamos de novo quando você voltar para a página."]
        : sync.estado === "ok"
          ? pendentes > 0
            ? ["bg-ouro-300", `${pendentes} pendente${pendentes > 1 ? "s" : ""}`, "Progresso feito agora, ainda a caminho da conta."]
            : ["bg-sucesso", "Conta em dia", "Progresso salvo na sua conta."]
          : sync.estado === "desconfigurado"
            ? ["bg-creme-500", "Só neste aparelho", "Contas ainda não ativadas neste site: o progresso fica salvo aqui."]
            : ["bg-creme-500", pendentes > 0 ? "Progresso local" : "Convidado", "Sem login: o progresso fica salvo neste aparelho."];

  return (
    <span title={dica} className="rotulo hidden items-center gap-2 rounded-full border border-borda px-3 py-1.5 text-creme-300 lg:inline-flex">
      <span aria-hidden className={`size-2 rounded-full ${cor}`} />
      <span>{texto}</span>
      <span className="sr-only">: {dica}</span>
    </span>
  );
}
