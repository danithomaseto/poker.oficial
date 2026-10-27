/**
 * Aleatoriedade do treino com o gerador criptográfico do navegador (nunca Math.random para
 * embaralhar). Os bots também recebem a sua fonte de aleatoriedade daqui.
 */
const buffer = new Uint32Array(1);

/** Inteiro uniforme em [0, n), sem viés (rejeição do resto). */
export function inteiroAleatorio(n: number): number {
  if (n <= 0) throw new RangeError("n precisa ser positivo");
  const limite = Math.floor(0x100000000 / n) * n;
  let valor: number;
  do {
    crypto.getRandomValues(buffer);
    valor = buffer[0]!;
  } while (valor >= limite);
  return valor % n;
}

/** Número em [0, 1). */
export function aleatorio01(): number {
  crypto.getRandomValues(buffer);
  return buffer[0]! / 0x100000000;
}
