import { atraso } from "../animacao";
import { FichaGirando } from "../ilustracoes/ficha-girando";
import { CabecalhoSecao } from "./cabecalho-secao";

const regras = [
  {
    titulo: "Ficha não vale dinheiro.",
    texto:
      "Nem aqui, nem fora daqui. Não se compra, não se saca, não se passa pra ninguém. Não existe pagamento no jogo.",
  },
  {
    titulo: "Quem embaralha é o servidor.",
    texto:
      "Com gerador criptográfico, longe do navegador de qualquer um. Nem o seu, nem o do dono da mesa.",
  },
  {
    titulo: "Cada um vê só as suas cartas.",
    texto:
      "A carta fechada dos outros nunca chega no seu navegador. Nem escondida no código da página.",
  },
  {
    titulo: "O servidor confere toda jogada.",
    texto:
      "Seu navegador só pede: “quero apostar 200”. Quem decide se pode é a mesa, não o cliente.",
  },
  {
    titulo: "Plateia não vê carta fechada.",
    texto: "Quem só está assistindo recebe a mesa pública e mais nada.",
  },
  {
    titulo: "Treino é treino.",
    texto: "O que acontece contra os bots fica nos bots. Não entra na conta online.",
  },
];

const romanos = ["I", "II", "III", "IV", "V", "VI"];

export function RegrasDaCasa() {
  return (
    <section
      id="regras"
      aria-labelledby="titulo-regras"
      className="textura-feltro relative bg-mesa-850 py-24 sm:py-32"
    >
      <div className="conteiner relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <CabecalhoSecao
            id="titulo-regras"
            numero="05"
            rotulo="Jogo limpo"
            titulo={
              <>
                Regras da casa. <span className="text-ouro-300 italic">Valem pra todo mundo.</span>
              </>
            }
            descricao="Entre amigos a zoeira é garantida, mas a mesa tem que ser justa. Isso aqui não muda com o tempo."
          />
          <div data-revelar="zoom" className="hidden lg:block">
            <FichaGirando className="size-44 2xl:size-56" />
          </div>
        </div>

        {/* Quadro emoldurado, como as regras penduradas na parede do clube */}
        <div
          data-revelar
          style={atraso(150)}
          className="mt-14 rounded-[6px] border-[12px] border-[#4e3220] bg-mesa-900 p-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <ol className="grid gap-px border border-ouro-400/35 bg-ouro-400/25 sm:grid-cols-2 xl:grid-cols-3">
            {regras.map((regra, i) => (
              <li key={regra.titulo} className="flex gap-5 bg-mesa-900 p-6 sm:p-8 2xl:p-10">
                <span
                  aria-hidden
                  className="w-10 shrink-0 font-display text-3xl leading-none text-ouro-400 italic"
                >
                  {romanos[i]}
                </span>
                <div>
                  <h3 className="font-display text-2xl leading-tight font-medium text-creme-50">
                    {regra.titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-creme-100/75">{regra.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
