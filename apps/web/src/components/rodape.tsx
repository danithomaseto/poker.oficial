import Link from "next/link";
import { rotas } from "@/config/site";
import { Marca } from "./marca";

export function Rodape() {
  return (
    <footer className="relative bg-mesa-900">
      <div className="friso" aria-hidden />
      <div className="conteiner grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-md">
          <Marca />
          <p className="mt-5 leading-relaxed text-creme-300">
            Uma mesa fechada de Texas Hold&apos;em pra jogar com a turma de sempre, direto no
            navegador. A resenha por voz continua no Discord.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <h2 className="rotulo text-ouro-300">Nesta página</h2>
          <ul className="mt-4 space-y-2.5 text-creme-300">
            <li>
              <Link className="transition-colors hover:text-creme-50" href="/#como-entrar">
                Como entrar
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-creme-50" href="/#cardapio">
                Cardápio da casa
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-creme-50" href="/#regras">
                Regras da casa
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Acesso">
          <h2 className="rotulo text-ouro-300">Acesso</h2>
          <ul className="mt-4 space-y-2.5 text-creme-300">
            <li>
              <Link
                className="transition-colors hover:text-creme-50"
                href={rotas.entrar}
                transitionTypes={["nav-forward"]}
              >
                Entrar
              </Link>
            </li>
            <li>
              <Link
                className="transition-colors hover:text-creme-50"
                href={rotas.resgatarConvite}
                transitionTypes={["nav-forward"]}
              >
                Resgatar convite
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-ouro-400/20">
        <p className="conteiner rotulo flex flex-col gap-2 py-6 text-creme-500 sm:flex-row sm:justify-between">
          <span>Fichas, prêmios e moedas sem valor real</span>
          <span>Feito pela turma, pra turma</span>
        </p>
      </div>
    </footer>
  );
}
