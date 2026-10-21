"use client";

import { useEffect } from "react";

/**
 * Liga os efeitos de página que dependem do navegador, sem re-renderizar nada:
 *
 * - `[data-revelar]`: recebe `data-visivel` quando entra na tela (CSS faz a animação).
 * - `:root`: recebe `--rolagem` (0 a 1), `--ponteiro-x`/`--ponteiro-y` (-1 a 1) e
 *   `data-rolou` quando a página saiu do topo.
 *
 * Os componentes de seção continuam sendo Server Components: só marcam atributos.
 */
export function EfeitosGlobais() {
  useEffect(() => {
    const raiz = document.documentElement;
    let quadroPendente = 0;
    let ultimoPonteiro: PointerEvent | null = null;

    // Revelar ao rolar
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            (entrada.target as HTMLElement).dataset.visivel = "true";
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const observarNovos = () => {
      document.querySelectorAll<HTMLElement>("[data-revelar]:not([data-visivel])").forEach((el) => {
        observador.observe(el);
      });
    };
    observarNovos();

    // Navegações no cliente montam conteúdo novo: observar o que aparecer depois.
    const mutacoes = new MutationObserver(observarNovos);
    mutacoes.observe(document.body, { childList: true, subtree: true });

    // Rolagem e ponteiro, agrupados em um quadro de animação
    const atualizar = () => {
      quadroPendente = 0;
      const maximo = raiz.scrollHeight - window.innerHeight;
      raiz.style.setProperty("--rolagem", maximo > 0 ? (window.scrollY / maximo).toFixed(4) : "0");
      raiz.dataset.rolou = String(window.scrollY > 12);

      const ponteiro = ultimoPonteiro;
      if (ponteiro) {
        raiz.style.setProperty(
          "--ponteiro-x",
          ((ponteiro.clientX / window.innerWidth) * 2 - 1).toFixed(3),
        );
        raiz.style.setProperty(
          "--ponteiro-y",
          ((ponteiro.clientY / window.innerHeight) * 2 - 1).toFixed(3),
        );
      }
    };

    const agendar = () => {
      if (!quadroPendente) quadroPendente = requestAnimationFrame(atualizar);
    };
    const aoMoverPonteiro = (evento: PointerEvent) => {
      if (evento.pointerType !== "mouse") return;
      ultimoPonteiro = evento;
      agendar();
    };

    atualizar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    window.addEventListener("pointermove", aoMoverPonteiro, { passive: true });

    return () => {
      observador.disconnect();
      mutacoes.disconnect();
      cancelAnimationFrame(quadroPendente);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      window.removeEventListener("pointermove", aoMoverPonteiro);
    };
  }, []);

  return null;
}
