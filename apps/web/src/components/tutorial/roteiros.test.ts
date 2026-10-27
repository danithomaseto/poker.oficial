import { describe, expect, it } from "vitest";
import { aplicarAcao, obterAcoesValidas } from "@poker/engine";
import { ROTEIROS, acaoDaJogada, iniciarRoteiro } from "./roteiros";
import { IDS_MODULOS_TUTORIAL } from "@poker/progressao";
import { MODULOS_TUTORIAL } from "./modulos";

describe("roteiros do tutorial", () => {
  for (const r of ROTEIROS) {
    it(`"${r.id}" roda no motor real na ordem certa`, () => {
      let estado = iniciarRoteiro(r);
      for (const [i, j] of r.jogadas.entries()) {
        const quem = j.tipo === "bot" ? j.quem : 0;
        expect(estado.vez, `jogada ${i} de "${r.id}"`).toBe(quem);
        if (j.tipo === "voce") {
          // O botão que o tutorial pede existe nesse momento.
          const v = obterAcoesValidas(estado, 0);
          const disponivel = {
            desistir: v.podeDesistir,
            passar: v.podePassar,
            pagar: v.valorParaPagar > 0,
            apostar: !!v.apostar,
            aumentar: !!v.aumentar,
            allin: v.valorAllIn > 0,
          }[j.espera];
          expect(disponivel, `ação "${j.espera}" na jogada ${i}`).toBe(true);
          expect(j.dica.length > 0 || r.vencedores.length === 0).toBe(true);
        }
        estado = aplicarAcao(estado, quem, acaoDaJogada(j)).estado;
      }
      if (r.vencedores.length) {
        expect(estado.fase).toBe("encerrada");
        const ganhadores = estado.resultado!.ganhos.flatMap((g, i) => (g > 0 ? [i] : []));
        expect(ganhadores).toEqual(r.vencedores);
      }
    });
  }

  it("os módulos do tutorial são exatamente os que rendem XP", () => {
    expect(MODULOS_TUTORIAL.map((m) => m.id)).toEqual([...IDS_MODULOS_TUTORIAL]);
  });
});
