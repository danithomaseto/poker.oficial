import { expect, it } from "vitest";
import { avaliar } from "./avaliador";
import { baralhoOrdenado, embaralhar } from "./cartas";

/**
 * Benchmark simples: os bots difíceis rodam milhares de simulações por decisão, então o
 * avaliador precisa passar com folga de 100 mil mãos de 7 cartas por segundo.
 */
it("avalia mais de 100 mil mãos de 7 cartas por segundo", () => {
  const maos = Array.from({ length: 50_000 }, () =>
    embaralhar(baralhoOrdenado(), (n) => Math.floor(Math.random() * n)).slice(0, 7),
  );
  for (const mao of maos.slice(0, 5_000)) avaliar(mao); // aquecimento do JIT
  const inicio = performance.now();
  for (const mao of maos) avaliar(mao);
  const segundos = (performance.now() - inicio) / 1000;
  const porSegundo = Math.round(maos.length / segundos);
  console.info(`avaliador: ${porSegundo.toLocaleString("pt-BR")} mãos/s`);
  expect(porSegundo).toBeGreaterThan(100_000);
});
