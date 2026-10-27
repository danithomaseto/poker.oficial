"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APELIDOS_BOTS, registrarMao, type NivelBot, type Perfis } from "@poker/bots";
import {
  aplicarAcao,
  baralhoOrdenado,
  embaralhar,
  ErroAcao,
  iniciarMao,
  obterAcoesValidas,
  projetarParaJogador,
  proximoBotao,
  type Acao,
  type EstadoMao,
} from "@poker/engine";
import { paletaDemo, type AparenciaDemo } from "../ilustracoes/avatar";
import { aleatorio01, inteiroAleatorio } from "./aleatorio";
import { pedirDecisao } from "./executar-bot";
import { nivelDoBot, type ConfigTreino } from "./mesas";
import { usePreferencias } from "@/lib/preferencias";
import { linhasDaMao, type LinhaLog } from "./textos";

/**
 * Controlador da mesa de treino: roda o motor e os bots inteiramente no navegador.
 * Nada daqui toca em conta online: fichas e resultados do treino ficam só nesta aba.
 */

export interface Lugar {
  id: string;
  nome: string;
  tipo: "voce" | "bot";
  nivel?: NivelBot;
  aparencia: AparenciaDemo;
  fichas: number;
  assento: number;
}

export interface LinhaHistorico {
  numero: number;
  linhas: LinhaLog[];
  resumo: string;
}

export interface Estatisticas {
  maos: number;
  ganhas: number;
  maiorPote: number;
  recompras: number;
}

export type Velocidade = "normal" | "rapida";

const ID_VOCE = "voce";

function sortear<T>(lista: readonly T[]): T {
  return lista[inteiroAleatorio(lista.length)]!;
}

function aparenciaAleatoria(): AparenciaDemo {
  return {
    pele: sortear(paletaDemo.peles),
    cabelo: { estilo: sortear(paletaDemo.estilos), cor: sortear(paletaDemo.cabelos) },
    roupa: sortear(paletaDemo.roupas),
    acessorio: sortear(paletaDemo.acessorios),
    fundo: sortear(paletaDemo.fundos),
  };
}

function novoBot(assento: number, nivel: NivelBot, fichas: number, nomesEmUso: Set<string>): Lugar {
  const livres = APELIDOS_BOTS.filter((n) => !nomesEmUso.has(n));
  const nome = livres.length ? sortear(livres) : `Bot ${assento}`;
  return {
    id: `bot-${assento}-${inteiroAleatorio(1_000_000)}`,
    nome,
    tipo: "bot",
    nivel,
    aparencia: aparenciaAleatoria(),
    fichas,
    assento,
  };
}

function montarLugares(
  config: ConfigTreino,
  voce: { nome: string; aparencia: AparenciaDemo },
): Lugar[] {
  const lugares: Lugar[] = [
    {
      id: ID_VOCE,
      nome: voce.nome,
      tipo: "voce",
      aparencia: voce.aparencia,
      fichas: config.fichasIniciais,
      assento: 0,
    },
  ];
  const nomes = new Set<string>();
  for (let i = 1; i <= config.bots; i++) {
    const bot = novoBot(i, nivelDoBot(config.nivel, i - 1), config.fichasIniciais, nomes);
    nomes.add(bot.nome);
    lugares.push(bot);
  }
  return lugares;
}

const ATRASO_POR_NIVEL: Record<NivelBot, number> = {
  facil: 650,
  medio: 850,
  dificil: 1050,
  extremo: 1250,
};

export function useMesaTreino(
  config: ConfigTreino,
  voce: { nome: string; aparencia: AparenciaDemo },
) {
  const [lugares, setLugares] = useState<Lugar[]>(() => montarLugares(config, voce));
  const [mao, setMao] = useState<EstadoMao | null>(null);
  const [cartasVisiveis, setCartasVisiveis] = useState(0);
  const [pensando, setPensando] = useState<number | null>(null);
  const [pausado, setPausado] = useState(false);
  const [preferencias] = usePreferencias();
  const [velocidadeEscolhida, setVelocidadeEscolhida] = useState<Velocidade | null>(null);
  const velocidade = velocidadeEscolhida ?? preferencias.velocidadeBots;
  const [avisos, setAvisos] = useState<string[]>([]);
  const [historico, setHistorico] = useState<LinhaHistorico[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    maos: 0,
    ganhas: 0,
    maiorPote: 0,
    recompras: 0,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [aguardandoProxima, setAguardandoProxima] = useState(false);

  const perfis = useRef<Perfis>({});
  const botaoAssento = useRef<number | null>(null);
  const numeroMao = useRef(0);
  const finalizada = useRef(0);
  const lugaresRef = useRef(lugares);
  useEffect(() => {
    lugaresRef.current = lugares;
  }, [lugares]);

  const fator = velocidade === "rapida" ? 0.35 : 1;
  const voceSemFichas =
    lugares.find((l) => l.id === ID_VOCE)!.fichas <= 0 && (!mao || mao.fase === "encerrada");

  const bigBlindAtual = useCallback(
    (numero: number) =>
      config.subirBlindsACada > 0
        ? config.bigBlind * 2 ** Math.floor((numero - 1) / config.subirBlindsACada)
        : config.bigBlind,
    [config.bigBlind, config.subirBlindsACada],
  );

  const comecarMao = useCallback(() => {
    // Bots que quebraram saem da mesa e outro senta no lugar.
    const novosAvisos: string[] = [];
    const nomes = new Set(lugaresRef.current.map((l) => l.nome));
    const atualizados = lugaresRef.current.map((l) => {
      if (l.tipo !== "bot" || l.fichas > 0) return l;
      const substituto = novoBot(l.assento, l.nivel!, config.fichasIniciais, nomes);
      nomes.add(substituto.nome);
      novosAvisos.push(`${l.nome} quebrou e levantou. ${substituto.nome} sentou no lugar.`);
      return substituto;
    });
    lugaresRef.current = atualizados;
    setLugares(atualizados);
    if (novosAvisos.length) setAvisos((a) => [...novosAvisos, ...a].slice(0, 4));

    const participantes = atualizados
      .filter((l) => l.fichas > 0)
      .sort((a, b) => a.assento - b.assento);
    if (participantes.length < 2 || !participantes.some((l) => l.id === ID_VOCE)) return;

    numeroMao.current += 1;
    const indiceBotao = proximoBotao(
      participantes.map((l) => l.assento),
      botaoAssento.current,
    );
    botaoAssento.current = participantes[indiceBotao]!.assento;
    const bb = bigBlindAtual(numeroMao.current);

    const { estado } = iniciarMao({
      config: { smallBlind: Math.max(1, Math.floor(bb / 2)), bigBlind: bb, ante: 0 },
      numero: numeroMao.current,
      botao: indiceBotao,
      jogadores: participantes.map((l) => ({
        id: l.id,
        nome: l.nome,
        assento: l.assento,
        fichas: l.fichas,
      })),
      baralho: embaralhar(baralhoOrdenado(), inteiroAleatorio),
    });
    setCartasVisiveis(0);
    setAguardandoProxima(false);
    setMao(estado);
  }, [bigBlindAtual, config.fichasIniciais]);

  // Primeira mão ao sentar.
  useEffect(() => {
    const id = window.setTimeout(comecarMao, 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao montar
  }, []);

  // Revela o board aos poucos (flop, turn, river), inclusive quando todos foram all-in.
  useEffect(() => {
    if (!mao || cartasVisiveis >= mao.board.length) return;
    const alvo = cartasVisiveis < 3 ? 3 : cartasVisiveis + 1;
    const id = window.setTimeout(
      () => setCartasVisiveis(Math.min(alvo, mao.board.length)),
      (cartasVisiveis === 0 ? 450 : 900) * fator,
    );
    return () => window.clearTimeout(id);
  }, [mao, cartasVisiveis, fator]);

  const boardRevelado = !!mao && cartasVisiveis >= mao.board.length;

  // Vez de um bot: espera um pouco (parece que está pensando) e decide no worker.
  useEffect(() => {
    if (!mao || mao.vez === null || pausado || !boardRevelado) return;
    const indice = mao.vez;
    const jogador = mao.jogadores[indice]!;
    const lugar = lugaresRef.current.find((l) => l.id === jogador.id);
    if (!lugar || lugar.tipo !== "bot") return;

    let cancelado = false;
    setPensando(indice);
    const atraso = (ATRASO_POR_NIVEL[lugar.nivel!] + aleatorio01() * 500) * fator;
    const id = window.setTimeout(async () => {
      const acao = await pedirDecisao({
        visao: projetarParaJogador(mao, indice),
        acoes: obterAcoesValidas(mao, indice),
        nivel: lugar.nivel!,
        perfis: perfis.current,
      });
      if (cancelado) return;
      setPensando(null);
      setMao((atual) => (atual === mao ? aplicarAcao(mao, indice, acao).estado : atual));
    }, atraso);
    return () => {
      cancelado = true;
      window.clearTimeout(id);
      setPensando(null);
    };
  }, [mao, pausado, boardRevelado, fator]);

  // Fim da mão: acerta as fichas, estatísticas, histórico e agenda a próxima.
  useEffect(() => {
    if (!mao || mao.fase !== "encerrada" || !boardRevelado || finalizada.current === mao.numero)
      return;
    finalizada.current = mao.numero;
    const resultado = mao.resultado!;
    perfis.current = registrarMao(perfis.current, mao);

    setLugares((atual) =>
      atual.map((l) => {
        const j = mao.jogadores.find((x) => x.id === l.id);
        return j ? { ...l, fichas: j.fichas } : l;
      }),
    );

    const indiceVoce = mao.jogadores.findIndex((j) => j.id === ID_VOCE);
    const ganhouVoce = indiceVoce >= 0 ? resultado.ganhos[indiceVoce]! : 0;
    const voceApostou = indiceVoce >= 0 ? mao.jogadores[indiceVoce]!.totalApostado : 0;
    setEstatisticas((s) => ({
      ...s,
      maos: s.maos + 1,
      ganhas: s.ganhas + (ganhouVoce > voceApostou ? 1 : 0),
      maiorPote: Math.max(s.maiorPote, ganhouVoce),
    }));

    const nome = (i: number) => mao.jogadores[i]!.nome;
    const resumo = resultado.potes
      .map((p) => {
        const mostrada = resultado.maos.find((m) => m.indice === p.ganhadores[0]);
        const quem = p.ganhadores.map(nome).join(" e ");
        return `${quem} ${p.ganhadores.length > 1 ? "dividiram" : "levou"} ${p.valor.toLocaleString("pt-BR")}${
          mostrada ? ` com ${mostrada.descricao.toLowerCase()}` : ""
        }`;
      })
      .join(" · ");
    setHistorico((h) =>
      [{ numero: mao.numero, resumo, linhas: linhasDaMao(mao, mao.board.length, "Você") }, ...h].slice(0, 25),
    );

    setAguardandoProxima(true);
  }, [mao, boardRevelado]);

  // Próxima mão automática depois de alguns segundos (se não estiver pausado).
  useEffect(() => {
    if (!aguardandoProxima || pausado || voceSemFichas || !preferencias.avancoAutomatico) return;
    const id = window.setTimeout(comecarMao, 4200 * fator);
    return () => window.clearTimeout(id);
  }, [aguardandoProxima, pausado, voceSemFichas, comecarMao, fator, preferencias.avancoAutomatico]);

  const indiceVoce = mao ? mao.jogadores.findIndex((j) => j.id === ID_VOCE) : -1;
  const visao = useMemo(
    () => (mao ? projetarParaJogador(mao, indiceVoce >= 0 ? indiceVoce : "espectador") : null),
    [mao, indiceVoce],
  );
  const suaVez = !!mao && mao.vez !== null && mao.vez === indiceVoce && boardRevelado && !pausado;
  const acoesValidas = useMemo(
    () => (mao && suaVez ? obterAcoesValidas(mao, indiceVoce) : null),
    [mao, suaVez, indiceVoce],
  );

  const agir = useCallback(
    (acao: Acao) => {
      if (!mao || !suaVez) return;
      try {
        setErro(null);
        setMao(aplicarAcao(mao, indiceVoce, acao).estado);
      } catch (e) {
        setErro(e instanceof ErroAcao ? e.message : "Não deu para fazer essa jogada.");
      }
    },
    [mao, suaVez, indiceVoce],
  );

  const recomprar = useCallback(() => {
    setLugares((atual) =>
      atual.map((l) => (l.id === ID_VOCE ? { ...l, fichas: config.fichasIniciais } : l)),
    );
    lugaresRef.current = lugaresRef.current.map((l) =>
      l.id === ID_VOCE ? { ...l, fichas: config.fichasIniciais } : l,
    );
    setEstatisticas((s) => ({ ...s, recompras: s.recompras + 1 }));
    comecarMao();
  }, [comecarMao, config.fichasIniciais]);

  return {
    lugares,
    mao,
    visao,
    cartasVisiveis,
    indiceVoce,
    suaVez,
    acoesValidas,
    pensando,
    pausado,
    velocidade,
    avisos,
    historico,
    estatisticas,
    erro,
    aguardandoProxima,
    voceSemFichas,
    bigBlind: mao?.config.bigBlind ?? config.bigBlind,
    agir,
    proximaMao: comecarMao,
    recomprar,
    alternarPausa: () => setPausado((p) => !p),
    alternarVelocidade: () => setVelocidadeEscolhida(velocidade === "normal" ? "rapida" : "normal"),
    avancoAutomatico: preferencias.avancoAutomatico,
  };
}

export type MesaTreino = ReturnType<typeof useMesaTreino>;
