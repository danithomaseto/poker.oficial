import type { CSSProperties } from "react";

/** Ficha de poker em 3D: duas faces e uma borda feita de discos empilhados. */
export function FichaGirando({ className }: { className?: string }) {
  const camadas = Array.from({ length: 13 }, (_, i) => i - 6);
  return (
    <div aria-hidden className={`relative perspective-[900px] ${className ?? ""}`}>
      <div className="absolute inset-x-[12%] -bottom-[10%] h-[14%] rounded-[50%] bg-black/55 blur-xl" />
      <div className="animar-girar-ficha relative size-full transform-3d">
        {camadas.map((z) => (
          <span
            key={z}
            className="absolute inset-0 rounded-full bg-[#7e2623]"
            style={{ transform: `translateZ(${z}px)` } as CSSProperties}
          />
        ))}
        {[7, -7].map((z) => (
          <span
            key={z}
            className="absolute inset-0 grid place-items-center rounded-full bg-[repeating-conic-gradient(#f6efdc_0_11deg,#b5332f_11deg_45deg)] shadow-[inset_0_0_0_4px_rgba(0,0,0,0.15)] backface-hidden"
            style={{ transform: `translateZ(${z}px) ${z < 0 ? "rotateY(180deg)" : ""}` }}
          >
            <span className="grid size-[74%] place-items-center rounded-full border-4 border-dashed border-creme-50/80 bg-naipe-vermelho shadow-[inset_0_6px_20px_rgba(0,0,0,0.35)]">
              <span className="flex flex-col items-center leading-none text-creme-50">
                <span className="font-display text-[clamp(2.5rem,5vw,4.5rem)]">♠</span>
                <span className="rotulo mt-1">R$ 0</span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
