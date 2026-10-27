"use client";

import { useActionState, useState } from "react";
import { salvarAparencia } from "@/app/(app)/jogo/acoes";
import { classesBotao } from "../botao";
import { Carteirinha } from "../carteirinha";
import { paletaDemo, type AparenciaDemo } from "../ilustracoes/avatar";
import { GrupoCores, GrupoOpcoes, nomesAcessorio, nomesEstilo } from "../secoes/personagem-demo";

function sortear<T>(lista: readonly T[]): T {
  return lista[Math.floor(Math.random() * lista.length)]!;
}

/** Editor da carteirinha: só visual (a aparência não muda nada no jogo). */
export function EditorPersonagem({
  nome,
  numero,
  desde,
  inicial,
}: {
  nome: string;
  numero: number;
  desde: string;
  inicial: AparenciaDemo;
}) {
  const [aparencia, setAparencia] = useState(inicial);
  const [versao, setVersao] = useState(0);
  const [resultado, acao, salvando] = useActionState(salvarAparencia, null);

  const escolher = (parcial: Partial<AparenciaDemo>) => {
    setAparencia((a) => ({ ...a, ...parcial }));
    setVersao((v) => v + 1);
  };
  const aleatorio = () =>
    escolher({
      pele: sortear(paletaDemo.peles),
      roupa: sortear(paletaDemo.roupas),
      fundo: sortear(paletaDemo.fundos),
      acessorio: sortear(paletaDemo.acessorios),
      cabelo: { estilo: sortear(paletaDemo.estilos), cor: sortear(paletaDemo.cabelos) },
    });

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-center">
      <Carteirinha
        className="mx-auto max-w-[34rem]"
        inclinada
        nome={nome}
        numero={numero}
        aparencia={aparencia}
        desde={desde}
        chaveAnimacao={versao}
      />
      <form action={acao} className="space-y-5">
        <input type="hidden" name="aparencia" value={JSON.stringify(aparencia)} />
        <GrupoCores
          rotulo="Pele"
          cores={paletaDemo.peles}
          atual={aparencia.pele}
          aoEscolher={(pele) => escolher({ pele })}
        />
        <GrupoCores
          rotulo="Roupa"
          cores={paletaDemo.roupas}
          atual={aparencia.roupa}
          aoEscolher={(roupa) => escolher({ roupa })}
        />
        <GrupoCores
          rotulo="Fundo"
          cores={paletaDemo.fundos}
          atual={aparencia.fundo}
          aoEscolher={(fundo) => escolher({ fundo })}
        />
        <GrupoCores
          rotulo="Cor do cabelo"
          cores={paletaDemo.cabelos}
          atual={aparencia.cabelo.cor}
          aoEscolher={(cor) => escolher({ cabelo: { ...aparencia.cabelo, cor } })}
        />
        <GrupoOpcoes
          rotulo="Cabelo"
          opcoes={paletaDemo.estilos}
          nomes={nomesEstilo}
          atual={aparencia.cabelo.estilo}
          aoEscolher={(estilo) => escolher({ cabelo: { ...aparencia.cabelo, estilo } })}
        />
        <GrupoOpcoes
          rotulo="Acessório"
          opcoes={paletaDemo.acessorios}
          nomes={nomesAcessorio}
          atual={aparencia.acessorio}
          aoEscolher={(acessorio) => escolher({ acessorio })}
        />
        {resultado?.erro && <p className="text-sm text-[#f39a96]">{resultado.erro}</p>}
        <div className="flex flex-wrap items-center gap-3 border-t border-ouro-400/25 pt-5">
          <button type="submit" disabled={salvando} className={classesBotao("primario", "lg")}>
            {salvando ? "Salvando…" : "Salvar e ir para o lobby"}
          </button>
          <button type="button" onClick={aleatorio} className={classesBotao("secundario", "lg")}>
            Sortear visual 🎲
          </button>
        </div>
      </form>
    </div>
  );
}
