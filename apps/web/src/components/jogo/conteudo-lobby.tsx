import Link from "next/link";
import { Carteirinha } from "../carteirinha";
import type { AparenciaDemo } from "../ilustracoes/avatar";
import { ListaMesas } from "./lista-mesas";

export interface DadosLobby {
  nome: string;
  numeroSocio: number;
  aparencia: AparenciaDemo;
  desde: string;
  moedas: number;
  dono: boolean;
}

/**
 * Lobby: quem você é à esquerda, onde jogar à direita. Só mostra mesas que existem de verdade
 * (as de treino); as mesas online aparecem como "em breve" até o servidor de jogo existir.
 */
export function ConteudoLobby({ dados }: { dados: DadosLobby }) {
  return (
    <div className="conteiner grid gap-10 py-10 sm:py-12 xl:grid-cols-[24rem_minmax(0,1fr)] xl:gap-14">
      <aside aria-label="Sua carteirinha" className="xl:sticky xl:top-24 xl:h-fit">
        <h1 className="font-display text-4xl leading-[1.05] font-medium text-creme-50 [font-variation-settings:'SOFT'_30,'WONK'_1]">
          E aí, <span className="text-ouro-300 italic">{dados.nome}</span>.
        </h1>
        <div className="mt-6">
          <Carteirinha
            nome={dados.nome}
            numero={dados.numeroSocio}
            aparencia={dados.aparencia}
            desde={dados.desde}
            moedas={dados.moedas}
            selo={dados.dono ? { texto: "Dono", tom: "ouro" } : null}
            compacta
          />
        </div>
        <nav aria-label="Atalhos" className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/jogo/personagem" className="rotulo text-creme-300 hover:text-creme-50">
            Editar carteirinha
          </Link>
          <Link href="/jogo/preferencias" className="rotulo text-creme-300 hover:text-creme-50">
            Preferências
          </Link>
          {dados.dono && (
            <Link href="/admin" className="rotulo text-ouro-300 hover:text-ouro-200">
              Painel do dono
            </Link>
          )}
        </nav>
      </aside>

      <div className="min-w-0 space-y-12">
        <section aria-labelledby="titulo-mesas-treino">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="rotulo text-ouro-300">Disponível agora</p>
              <h2 id="titulo-mesas-treino" className="mt-1 font-display text-3xl text-creme-50">
                Treino contra bots
              </h2>
            </div>
            <Link href="/treino#montar" className="rotulo text-creme-300 underline-offset-4 hover:text-creme-50 hover:underline">
              Montar uma mesa →
            </Link>
          </div>
          <div className="mt-5">
            <ListaMesas />
          </div>
        </section>

        <section aria-labelledby="titulo-mesas-online">
          <p className="rotulo text-creme-500">Próxima etapa</p>
          <h2 id="titulo-mesas-online" className="mt-1 font-display text-3xl text-creme-50">
            Mesas online com a galera
          </h2>
          <div className="mt-5 rounded-(--radius-painel) border border-dashed border-borda-forte px-5 py-8 text-center sm:px-8">
            <p className="font-display text-xl text-creme-100">Ainda não há mesas online.</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-creme-300">
              Elas dependem do servidor de jogo, que é a próxima etapa do projeto. Quando abrir, as mesas da turma
              aparecem aqui com lugares livres, blinds e quem está jogando.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
