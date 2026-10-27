"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, GraduationCap, Play, RotateCcw } from "lucide-react";
import { IDS_MODULOS_TUTORIAL, REGRAS_XP } from "@poker/progressao";
import { registrarEvento, useProgressoLocal } from "@/lib/progresso/local";
import { classesBotao } from "../botao";
import { CONTEUDO } from "./conteudo";
import { MODULOS_TUTORIAL, type InfoModulo } from "./modulos";

type Tela = { tipo: "menu" } | { tipo: "modulo"; indice: number; chave: number };

/**
 * Tutorial: menu (aprender, continuar ou praticar) e o módulo em andamento. Funciona sem
 * internet e sem conta. O XP de cada módulo só é registrado ao concluir TODAS as etapas dele.
 */
export function Tutorial() {
  const [tela, setTela] = useState<Tela>({ tipo: "menu" });
  const { chaves, carregado } = useProgressoLocal();
  const feito = (m: InfoModulo) => chaves.has(`tutorial:${m.id}`);
  const abrir = (indice: number) => {
    setTela((t) => ({ tipo: "modulo", indice, chave: (t.tipo === "modulo" ? t.chave : 0) + 1 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (tela.tipo === "modulo") {
    return (
      <ModuloEmAndamento
        key={tela.chave}
        indice={tela.indice}
        aoSair={() => setTela({ tipo: "menu" })}
        aoAbrir={abrir}
      />
    );
  }

  const concluidos = MODULOS_TUTORIAL.filter(feito).length;
  const proximo = MODULOS_TUTORIAL.findIndex((m) => !feito(m));
  const tudo = concluidos === MODULOS_TUTORIAL.length;

  return (
    <div className="space-y-10">
      <section className="grid gap-3 md:grid-cols-3">
        <OpcaoEntrada
          icone={<GraduationCap className="size-6" aria-hidden />}
          titulo="Aprender a jogar"
          texto="Do zero: a mesa, o ranking, as ações e uma mão jogada com dicas. Uns 15 minutos."
          acao={<button type="button" className={classesBotao("primario", "lg")} onClick={() => abrir(0)}>Começar do módulo 1</button>}
        />
        <OpcaoEntrada
          icone={<Play className="size-6" aria-hidden />}
          titulo="Continuar tutorial"
          texto={
            !carregado
              ? "Carregando seu progresso…"
              : tudo
                ? "Você concluiu os 10 módulos. Pode rever qualquer um quando quiser."
                : concluidos === 0
                  ? "Você ainda não concluiu nenhum módulo. Comece pelo primeiro."
                  : `Próximo: módulo ${proximo + 1}, ${MODULOS_TUTORIAL[proximo]!.titulo}.`
          }
          acao={
            <button
              type="button"
              disabled={!carregado || tudo || concluidos === 0}
              className={classesBotao("secundario", "lg")}
              onClick={() => abrir(proximo)}
            >
              {tudo ? "Tutorial concluído ✓" : "Continuar"}
            </button>
          }
        />
        <OpcaoEntrada
          icone={<RotateCcw className="size-6" aria-hidden />}
          titulo="Praticar livremente"
          texto="Mesas contra bots do fácil ao extremo, sem roteiro. Cada mão jogada também rende XP."
          acao={<Link href="/treino" className={classesBotao("secundario", "lg")}>Ir para o treino</Link>}
        />
      </section>

      <section aria-labelledby="titulo-modulos">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titulo-modulos" className="font-display text-3xl text-creme-50">
            Módulos
          </h2>
          <p className="text-sm text-creme-300">
            <span className="font-mono text-ouro-200">{concluidos}</span> de {MODULOS_TUTORIAL.length} concluídos · +
            {REGRAS_XP.tutorial_modulo.xp} XP por módulo e +{REGRAS_XP.tutorial_completo.xp} XP ao terminar todos
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="Módulos concluídos"
          aria-valuemin={0}
          aria-valuemax={MODULOS_TUTORIAL.length}
          aria-valuenow={concluidos}
          className="mt-3 flex gap-1"
        >
          {MODULOS_TUTORIAL.map((m) => (
            <span key={m.id} className={`h-1.5 flex-1 rounded-full ${feito(m) ? "bg-ouro-300" : "bg-creme-100/10"}`} />
          ))}
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {MODULOS_TUTORIAL.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => abrir(i)}
                className={`flex h-full w-full flex-col rounded-(--radius-cartao) border p-4 text-left transition-colors hover:border-borda-forte ${
                  i === proximo && concluidos > 0 ? "border-ouro-300/70 bg-white/[0.04]" : "border-borda bg-superficie-1/60"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-creme-500">{String(m.numero).padStart(2, "0")}</span>
                  {feito(m) ? (
                    <span className="rotulo inline-flex items-center gap-1 rounded-[3px] bg-sucesso/25 px-1.5 py-0.5 text-creme-50">
                      <Check className="size-3" aria-hidden /> Feito
                    </span>
                  ) : (
                    <span className="rotulo rounded-[3px] bg-ouro-300/15 px-1.5 py-0.5 text-ouro-200">+{REGRAS_XP.tutorial_modulo.xp} XP</span>
                  )}
                </span>
                <span className="mt-2 font-display text-lg leading-snug text-creme-50">{m.titulo}</span>
                <span className="mt-1 text-sm text-creme-300">{m.resumo}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function OpcaoEntrada({ icone, titulo, texto, acao }: { icone: ReactNode; titulo: string; texto: string; acao: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5">
      <span className="grid size-11 place-items-center rounded-full border border-ouro-400/50 text-ouro-200">{icone}</span>
      <h2 className="font-display text-2xl text-creme-50">{titulo}</h2>
      <p className="flex-1 text-sm text-creme-300">{texto}</p>
      <div>{acao}</div>
    </div>
  );
}

type Conclusao = { xp: number; completou: number } | null;

function ModuloEmAndamento({ indice, aoSair, aoAbrir }: { indice: number; aoSair: () => void; aoAbrir: (i: number) => void }) {
  const modulo = MODULOS_TUTORIAL[indice]!;
  const etapas = CONTEUDO[modulo.id];
  const { chaves } = useProgressoLocal();
  const [passo, setPasso] = useState(0);
  const [feitas, setFeitas] = useState<ReadonlySet<number>>(() => new Set());
  const [conclusao, setConclusao] = useState<Conclusao>(null);
  const [salvando, setSalvando] = useState(false);
  const etapa = etapas[passo]!;
  const ultima = passo === etapas.length - 1;

  const concluirEtapa = useCallback(() => {
    setFeitas((f) => (f.has(passo) ? f : new Set(f).add(passo)));
  }, [passo]);

  const concluirModulo = async () => {
    setSalvando(true);
    const ganho = await registrarEvento("tutorial_modulo", `tutorial:${modulo.id}`);
    const feitosAgora = new Set([...chaves, `tutorial:${modulo.id}`]);
    let completou = 0;
    if (IDS_MODULOS_TUTORIAL.every((id) => feitosAgora.has(`tutorial:${id}`))) {
      completou = (await registrarEvento("tutorial_completo", "tutorial:completo")).xp;
    }
    setSalvando(false);
    setConclusao({ xp: ganho.xp, completou });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (conclusao) {
    const proximo = indice + 1 < MODULOS_TUTORIAL.length ? MODULOS_TUTORIAL[indice + 1]! : null;
    return (
      <section className="animar-aviso mx-auto max-w-2xl rounded-(--radius-painel) border border-ouro-400/40 bg-superficie-1/90 p-6 text-center sm:p-10">
        <p className="rotulo text-ouro-300">Módulo {modulo.numero} concluído</p>
        <h2 className="mt-2 font-display text-4xl text-creme-50">{modulo.titulo}</h2>
        <p className="mt-4 text-lg text-creme-100">
          {conclusao.xp > 0 ? (
            <>
              <strong className="font-mono text-ouro-200">+{conclusao.xp} XP</strong> neste aparelho
            </>
          ) : (
            "Você já tinha concluído este módulo: o XP só conta na primeira vez."
          )}
        </p>
        {conclusao.completou > 0 && (
          <p className="mt-2 text-creme-100">
            E você terminou o tutorial inteiro: <strong className="font-mono text-ouro-200">+{conclusao.completou} XP</strong> de bônus!
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {proximo ? (
            <button type="button" className={classesBotao("primario", "lg")} onClick={() => aoAbrir(indice + 1)}>
              Próximo: {proximo.titulo}
            </button>
          ) : (
            <Link href="/treino" className={classesBotao("primario", "lg")}>
              Praticar no treino
            </Link>
          )}
          <button type="button" className={classesBotao("secundario", "lg")} onClick={aoSair}>
            Voltar aos módulos
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-10">
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <button type="button" onClick={aoSair} className="rotulo inline-flex items-center gap-1 text-creme-300 hover:text-creme-50">
          <ChevronLeft className="size-4" aria-hidden /> Todos os módulos
        </button>
        <div>
          <p className="rotulo text-ouro-300">Módulo {modulo.numero} de {MODULOS_TUTORIAL.length}</p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-creme-50">{modulo.titulo}</h2>
        </div>
        <ol className="space-y-1" aria-label="Etapas do módulo">
          {etapas.map((e, i) => (
            <li key={e.titulo}>
              <button
                type="button"
                disabled={i > passo && !feitas.has(i - 1)}
                onClick={() => setPasso(i)}
                aria-current={i === passo ? "step" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-(--radius-controle) px-2.5 py-1.5 text-left text-sm transition-colors disabled:opacity-40 ${
                  i === passo ? "bg-white/[0.06] text-creme-50" : "text-creme-300 hover:text-creme-50"
                }`}
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[0.65rem] ${
                    feitas.has(i) ? "border-sucesso bg-sucesso/30 text-creme-50" : i === passo ? "border-ouro-300 text-ouro-200" : "border-borda"
                  }`}
                >
                  {feitas.has(i) ? <Check className="size-3" aria-hidden /> : i + 1}
                </span>
                {e.titulo}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <section aria-labelledby="titulo-etapa" className="min-w-0 rounded-(--radius-painel) border border-borda bg-superficie-1/80 p-5 sm:p-7">
        <p id="titulo-etapa" className="rotulo text-creme-500">
          Etapa {passo + 1} de {etapas.length} · {etapa.titulo}
        </p>
        <div key={passo} className="animar-aviso mt-4">
          {etapa.render({ aoConcluir: concluirEtapa, concluido: feitas.has(passo) })}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-borda pt-5">
          <button
            type="button"
            disabled={passo === 0}
            onClick={() => setPasso((p) => p - 1)}
            className={classesBotao("secundario", "md")}
          >
            <ChevronLeft className="size-4" aria-hidden /> Anterior
          </button>
          {!feitas.has(passo) && <p className="text-sm text-creme-500">Conclua esta etapa para seguir.</p>}
          {ultima ? (
            <button type="button" disabled={!feitas.has(passo) || salvando} onClick={() => void concluirModulo()} className={classesBotao("primario", "md")}>
              {salvando ? "Salvando…" : "Concluir módulo"} <Check className="size-4" aria-hidden />
            </button>
          ) : (
            <button type="button" disabled={!feitas.has(passo)} onClick={() => setPasso((p) => p + 1)} className={classesBotao("primario", "md")}>
              Continuar <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
