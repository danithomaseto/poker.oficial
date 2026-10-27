import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { BotaoConfirmar } from "@/components/admin/botao-confirmar";
import { GerarConvite } from "@/components/admin/gerar-convite";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { Carteirinha } from "@/components/carteirinha";
import { CabecalhoJogo, LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { JOGADOR_PADRAO } from "@/components/treino/jogador-padrao";
import { site } from "@/config/site";
import { exigirDono } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { aparenciaSchema } from "@/lib/validacao/aparencia";
import { alterarAcesso, revogarConvite } from "./acoes";

export const metadata: Metadata = { title: "Painel do dono" };

const jogadorSchema = z.object({
  id: z.string(),
  numero_socio: z.number(),
  nome: z.string(),
  aparencia: z.unknown(),
  papel: z.enum(["dono", "jogador"]),
  status: z.enum(["ativo", "revogado"]),
  criado_em: z.string(),
  moedas: z.coerce.number(),
});

const conviteSchema = z.object({
  id: z.string(),
  dica: z.string(),
  observacao: z.string().nullable(),
  criado_em: z.string(),
  usado_em: z.string().nullable(),
  revogado_em: z.string().nullable(),
  usado_por_nome: z.string().nullable(),
  usado_por_numero: z.coerce.number().nullable(),
});

const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

export default function PaginaAdmin() {
  return (
    <>
      <Suspense fallback={<CabecalhoApp links={LINKS_JOGO} />}>
        <CabecalhoJogo />
      </Suspense>
      <main id="conteudo" className="conteiner flex-1 py-10 sm:py-14">
        <p className="rotulo border-t border-ouro-400/35 pt-3 text-ouro-300">Só o dono vê</p>
        <h1 className="mt-5 font-display text-4xl leading-[1.02] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1] sm:text-6xl">
          Painel do <span className="text-ouro-300 italic">dono</span>.
        </h1>
        <Suspense fallback={<p className="mt-10 text-creme-300">Carregando o painel…</p>}>
          <Painel />
        </Suspense>
      </main>
    </>
  );
}

async function Painel() {
  const dono = await exigirDono();
  const supabase = await criarClienteServidor();
  const [respostaJogadores, respostaConvites] = await Promise.all([
    supabase!.rpc("admin_listar_jogadores"),
    supabase!.rpc("admin_listar_convites"),
  ]);
  const jogadores = z.array(jogadorSchema).catch([]).parse(respostaJogadores.data);
  const convites = z.array(conviteSchema).catch([]).parse(respostaConvites.data);

  const ativos = jogadores.filter((j) => j.status === "ativo").length;
  const banidos = jogadores.length - ativos;
  const disponiveis = convites.filter((c) => !c.usado_em && !c.revogado_em).length;

  return (
    <div className="mt-10 space-y-14">
      <dl className="grid max-w-3xl grid-cols-3 divide-x divide-ouro-400/20 rounded-[8px] border border-ouro-400/25 bg-mesa-900/70">
        {[
          { rotulo: "Jogadores ativos", valor: ativos },
          { rotulo: "Banidos", valor: banidos },
          { rotulo: "Convites livres", valor: disponiveis },
        ].map((item) => (
          <div key={item.rotulo} className="flex flex-col-reverse px-5 py-4">
            <dt className="rotulo text-creme-300">{item.rotulo}</dt>
            <dd className="font-display text-4xl text-creme-50 tabular-nums">{item.valor}</dd>
          </div>
        ))}
      </dl>

      {/* Convites */}
      <section aria-labelledby="titulo-convites">
        <h2 id="titulo-convites" className="font-display text-3xl text-creme-50">
          Convites
        </h2>
        <p className="mt-1 text-creme-100/75">
          Cada código libera a entrada de uma pessoa, uma única vez.
        </p>
        <div className="mt-6 rounded-[8px] border border-ouro-400/25 bg-mesa-900/70 p-5 sm:p-7">
          <GerarConvite urlDoSite={site.url} />
        </div>

        {convites.length > 0 && (
          <div className="textura-papel mt-6 overflow-x-auto rounded-[8px] bg-creme-50 text-tinta">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-tinta">
                  {["Código", "Pra quem", "Criado em", "Situação", ""].map((t) => (
                    <th
                      key={t}
                      scope="col"
                      className="rotulo px-4 py-3 font-medium text-tinta-suave"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-tinta/10">
                {convites.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono tracking-wider">{c.dica}-••••-••••</td>
                    <td className="px-4 py-3">
                      {c.observacao ?? <span className="text-tinta-suave">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{data(c.criado_em)}</td>
                    <td className="px-4 py-3">
                      {c.usado_em ? (
                        <span>
                          Usado por <strong>{c.usado_por_nome ?? "conta removida"}</strong>
                          {c.usado_por_numero !== null && (
                            <span className="font-mono text-xs text-tinta-suave">
                              {" "}
                              (Nº {String(c.usado_por_numero).padStart(4, "0")})
                            </span>
                          )}
                        </span>
                      ) : c.revogado_em ? (
                        <span className="text-tinta-suave">Revogado</span>
                      ) : (
                        <span className="rotulo rounded-[3px] bg-mesa-600 px-2 py-0.5 text-creme-50">
                          Disponível
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!c.usado_em && !c.revogado_em && (
                        <BotaoConfirmar
                          rotulo="Revogar"
                          confirmar="Revogar mesmo"
                          perigoso
                          acao={revogarConvite.bind(null, c.id)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Jogadores */}
      <section aria-labelledby="titulo-jogadores">
        <h2 id="titulo-jogadores" className="font-display text-3xl text-creme-50">
          Jogadores
        </h2>
        <p className="mt-1 text-creme-100/75">
          Só dados do jogo: carteirinha, número de sócio e moedas. Nenhum dado pessoal aparece aqui.
        </p>
        <ul className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {jogadores.map((j) => {
            const aparencia = aparenciaSchema.safeParse(j.aparencia);
            const banido = j.status === "revogado";
            const ehVoce = j.id === dono.id;
            return (
              <li key={j.id} className={banido ? "opacity-75" : undefined}>
                <Carteirinha
                  nome={j.nome}
                  numero={j.numero_socio}
                  aparencia={aparencia.success ? aparencia.data : JOGADOR_PADRAO.aparencia}
                  desde={new Date(j.criado_em).getFullYear().toString()}
                  moedas={j.moedas}
                  selo={
                    j.papel === "dono"
                      ? { texto: "Dono", tom: "ouro" }
                      : banido
                        ? { texto: "Banido", tom: "vermelho" }
                        : null
                  }
                  rodape={
                    <div className="flex min-h-12 items-center justify-between gap-3 border-t border-dashed border-tinta/25 px-5 py-2.5">
                      <span className="rotulo text-tinta-suave">
                        {!aparencia.success
                          ? "Sem carteirinha ainda"
                          : banido
                            ? "Sem acesso"
                            : "Com acesso"}
                      </span>
                      {!ehVoce &&
                        (banido ? (
                          <BotaoConfirmar
                            rotulo="Devolver acesso"
                            confirmar="Desbanir"
                            acao={alterarAcesso.bind(null, j.id, "ativo")}
                          />
                        ) : (
                          <BotaoConfirmar
                            rotulo="Banir"
                            confirmar="Banir agora"
                            perigoso
                            acao={alterarAcesso.bind(null, j.id, "revogado")}
                          />
                        ))}
                    </div>
                  }
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
