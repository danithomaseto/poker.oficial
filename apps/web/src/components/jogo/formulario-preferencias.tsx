"use client";

import type { ReactNode } from "react";
import { usePreferencias, type Preferencias } from "@/lib/preferencias";
import { useAvisar } from "../avisos";
import { c } from "../baralho";
import { Carta } from "../carta";

/** Chave liga/desliga acessível (role="switch"). */
function Chave({
  titulo,
  descricao,
  ligada,
  aoMudar,
  previa,
}: {
  titulo: string;
  descricao: string;
  ligada: boolean;
  aoMudar: (ligada: boolean) => void;
  previa?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <p className="font-semibold text-creme-50">{titulo}</p>
        <p className="mt-1 max-w-xl text-sm text-creme-300">{descricao}</p>
        {previa && <div className="mt-3">{previa}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ligada}
        aria-label={titulo}
        onClick={() => aoMudar(!ligada)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors ${
          ligada ? "border-ouro-500 bg-ouro-300" : "border-borda-forte bg-superficie-3"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5.5 rounded-full shadow transition-[left,background-color] duration-200 ${
            ligada ? "left-[1.45rem] bg-tinta" : "left-0.5 bg-creme-100"
          }`}
        />
      </button>
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="rounded-(--radius-painel) border border-borda bg-superficie-1/80 px-5 sm:px-6">
      <h2 className="rotulo border-b border-borda py-4 text-ouro-300">{titulo}</h2>
      <div className="divide-y divide-borda">{children}</div>
    </section>
  );
}

/**
 * Preferências salvas neste aparelho. Só aparecem opções que realmente mudam algo:
 * o jogo ainda não tem som, então não há configuração de áudio.
 */
export function FormularioPreferencias() {
  const [p, salvar] = usePreferencias();
  const avisar = useAvisar();
  const mudar = (parcial: Partial<Preferencias>) => {
    salvar(parcial);
    avisar("sucesso", "Preferência salva neste aparelho.");
  };

  return (
    <div className="grid max-w-3xl gap-6">
      <Grupo titulo="Mesa">
        <Chave
          titulo="Baralho de 4 cores"
          descricao="Ouros em azul e paus em verde. Fica mais difícil confundir os naipes numa olhada rápida."
          ligada={p.baralho4Cores}
          aoMudar={(v) => mudar({ baralho4Cores: v })}
          previa={
            <span className="flex gap-2" aria-hidden>
              {(["espadas", "copas", "ouros", "paus"] as const).map((n) => (
                <Carta key={n} carta={c("A", n)} largura="2.6rem" />
              ))}
            </span>
          }
        />
        <Chave
          titulo="Dicas de treino"
          descricao="Mostra o nome da sua mão e quanto você precisa ganhar para pagar uma aposta (odds do pote)."
          ligada={p.dicasTreino}
          aoMudar={(v) => mudar({ dicasTreino: v })}
        />
      </Grupo>

      <Grupo titulo="Ritmo">
        <Chave
          titulo="Bots rápidos"
          descricao="Os bots decidem mais depressa. Dá para trocar durante a partida, no botão da mesa."
          ligada={p.velocidadeBots === "rapida"}
          aoMudar={(v) => mudar({ velocidadeBots: v ? "rapida" : "normal" })}
        />
        <Chave
          titulo="Próxima mão automática"
          descricao="Começa a mão seguinte alguns segundos depois do resultado. Desligado, você clica em “Próxima mão”."
          ligada={p.avancoAutomatico}
          aoMudar={(v) => mudar({ avancoAutomatico: v })}
        />
      </Grupo>

      <Grupo titulo="Acessibilidade">
        <Chave
          titulo="Reduzir animações"
          descricao="Desliga distribuição animada, fichas voando e transições. Se o seu sistema já pede menos movimento, isso já vale automaticamente."
          ligada={p.reduzirAnimacoes}
          aoMudar={(v) => mudar({ reduzirAnimacoes: v })}
        />
      </Grupo>
    </div>
  );
}
