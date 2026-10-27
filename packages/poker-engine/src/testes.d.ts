// Globais usadas só no teste de desempenho (o motor não depende de DOM nem de Node).
declare const performance: { now(): number };
declare const console: { info(...args: unknown[]): void };
