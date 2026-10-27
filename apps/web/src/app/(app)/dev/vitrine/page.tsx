import { notFound } from "next/navigation";
import { ConteudoAdmin, type ConviteAdmin, type JogadorAdmin } from "@/components/admin/conteudo-admin";
import { CabecalhoApp } from "@/components/cabecalho-app";
import { ConteudoLobby } from "@/components/jogo/conteudo-lobby";
import { LINKS_JOGO } from "@/components/jogo/cabecalho-jogo";
import { alterarDeMentira, revogarDeMentira } from "./acoes";

/**
 * Vitrine de desenvolvimento: mostra lobby e painel do dono com dados de exemplo, para conferir
 * o visual sem banco. Em produção esta rota não existe (404).
 */
const aparencia = (pele: string, cabelo: string, roupa: string, fundo: string) => ({
  pele,
  roupa,
  fundo,
  acessorio: "nenhum" as const,
  cabelo: { estilo: "curto" as const, cor: cabelo },
});

const jogadores: JogadorAdmin[] = [
  { id: "00000000-0000-4000-8000-000000000001", numero_socio: 1, nome: "Dono da mesa", aparencia: aparencia("#d39a6a", "#1d1410", "#c99a3b", "#145236"), papel: "dono", status: "ativo", criado_em: "2026-10-26T12:00:00Z", moedas: 0 },
  { id: "00000000-0000-4000-8000-000000000002", numero_socio: 2, nome: "Bia", aparencia: aparencia("#7c4a2d", "#1d1410", "#6d4bd8", "#22193a"), papel: "jogador", status: "ativo", criado_em: "2026-10-26T13:00:00Z", moedas: 120 },
  { id: "00000000-0000-4000-8000-000000000003", numero_socio: 3, nome: "Zé do River", aparencia: aparencia("#eab98f", "#e8c27a", "#1f9d74", "#0f3d2a"), papel: "jogador", status: "revogado", criado_em: "2026-10-26T14:00:00Z", moedas: 40 },
  { id: "00000000-0000-4000-8000-000000000004", numero_socio: 4, nome: "Sem Carteirinha", aparencia: null, papel: "jogador", status: "ativo", criado_em: "2026-10-26T15:00:00Z", moedas: 0 },
];

const convites: ConviteAdmin[] = [
  { id: "00000000-0000-4000-8000-0000000000a1", dica: "K7QP", observacao: "Juninho da faculdade", criado_em: "2026-10-26T16:00:00Z", usado_em: null, revogado_em: null, usado_por_nome: null, usado_por_numero: null },
  { id: "00000000-0000-4000-8000-0000000000a2", dica: "M2ZX", observacao: null, criado_em: "2026-10-26T12:30:00Z", usado_em: "2026-10-26T13:00:00Z", revogado_em: null, usado_por_nome: "Bia", usado_por_numero: 2 },
  { id: "00000000-0000-4000-8000-0000000000a3", dica: "W9RT", observacao: "Primo", criado_em: "2026-10-26T12:40:00Z", usado_em: null, revogado_em: "2026-10-26T17:00:00Z", usado_por_nome: null, usado_por_numero: null },
];

export default function Vitrine() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <CabecalhoApp links={[...LINKS_JOGO, { href: "/admin", rotulo: "Admin" }]} usuario={{ nome: "Dono da mesa", aparencia: aparencia("#d39a6a", "#1d1410", "#c99a3b", "#145236"), dono: true }} />
      <main id="conteudo" className="flex-1">
        <p className="conteiner rotulo pt-6 text-creme-500">Vitrine de desenvolvimento · dados de exemplo</p>
        <ConteudoLobby
          dados={{ nome: "Dono da mesa", numeroSocio: 1, aparencia: aparencia("#d39a6a", "#1d1410", "#c99a3b", "#145236"), desde: "2026", moedas: 0, dono: true }}
        />
        <div className="conteiner border-t border-borda py-12">
          <h2 className="font-display text-4xl text-creme-50">Painel do dono</h2>
          <ConteudoAdmin
            jogadores={jogadores}
            convites={convites}
            donoId={jogadores[0]!.id}
            acoes={{ revogarConvite: revogarDeMentira, alterarAcesso: alterarDeMentira }}
          />
        </div>
      </main>
    </>
  );
}
