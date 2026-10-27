"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Notificações curtas (toasts) do app: sucesso, erro e informação, sempre no mesmo lugar
 * e anunciadas para leitores de tela.
 */
type Tipo = "sucesso" | "erro" | "info";
interface Aviso {
  id: number;
  tipo: Tipo;
  texto: string;
}

const Contexto = createContext<(tipo: Tipo, texto: string) => void>(() => {});

export function useAvisar() {
  return useContext(Contexto);
}

let proximoId = 0;

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const avisar = useCallback((tipo: Tipo, texto: string) => {
    const id = proximoId++;
    setAvisos((lista) => [...lista.slice(-3), { id, tipo, texto }]);
    window.setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), tipo === "erro" ? 6000 : 3800);
  }, []);

  const valor = useMemo(() => avisar, [avisar]);
  const estilos: Record<Tipo, string> = {
    sucesso: "border-l-sucesso",
    erro: "border-l-perigo",
    info: "border-l-ouro-300",
  };

  return (
    <Contexto value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(92vw,24rem)] flex-col gap-2"
      >
        {avisos.map((a) => (
          <p
            key={a.id}
            role={a.tipo === "erro" ? "alert" : "status"}
            className={`animar-aviso pointer-events-auto rounded-(--radius-cartao) border border-l-4 border-borda bg-superficie-3/95 px-4 py-3 text-sm text-creme-50 shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur ${estilos[a.tipo]}`}
          >
            {a.texto}
          </p>
        ))}
      </div>
    </Contexto>
  );
}
