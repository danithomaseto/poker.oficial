/**
 * `structuredClone` existe em todos os ambientes do projeto (navegador, Web Worker e Node 17+),
 * mas não está na lib ES2022 pura que o motor usa para não depender de DOM nem de Node.
 */
declare function structuredClone<T>(valor: T): T;
