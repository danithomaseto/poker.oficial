import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BARALHOS, NIVEIS_DE_DESBLOQUEIO, baralhoDoNivel, ehGratuito, podeEquipar } from "./baralhos";
import { NIVEL_MAXIMO, situacaoPorXp, tituloDoNivel, xpParaSubir, xpTotalDoNivel } from "./niveis";
import { IDS_MODULOS_TUTORIAL } from "./tutorial";
import { REGRAS_XP, avaliarEvento, diaSaoPaulo, type EventoXp } from "./xp";

describe("curva de níveis", () => {
  it("tem 30 níveis com XP crescente para subir", () => {
    for (let n = 2; n < NIVEL_MAXIMO; n++) expect(xpParaSubir(n)).toBeGreaterThan(xpParaSubir(n - 1));
    expect(xpParaSubir(NIVEL_MAXIMO)).toBe(0);
  });

  it("o nível é derivado do XP e nunca fica fora de 1..30", () => {
    expect(situacaoPorXp(0).nivel).toBe(1);
    expect(situacaoPorXp(-50).nivel).toBe(1);
    expect(situacaoPorXp(Number.NaN).nivel).toBe(1);
    expect(situacaoPorXp(xpTotalDoNivel(5)).nivel).toBe(5);
    expect(situacaoPorXp(xpTotalDoNivel(5) - 1).nivel).toBe(4);
    expect(situacaoPorXp(10_000_000).nivel).toBe(30);
    expect(situacaoPorXp(10_000_000).maximo).toBe(true);
  });

  it("a fração do nível vai de 0 a 1", () => {
    const s = situacaoPorXp(xpTotalDoNivel(3) + xpParaSubir(3) / 2);
    expect(s.nivel).toBe(3);
    expect(s.fracao).toBeCloseTo(0.5, 1);
  });

  it("o tutorial completo leva ao nível 5 ou 6 (premissa da curva)", () => {
    const tutorial = REGRAS_XP.tutorial_modulo.xp * 10 + REGRAS_XP.tutorial_completo.xp;
    expect([5, 6]).toContain(situacaoPorXp(tutorial).nivel);
  });

  it("todo nível tem título", () => {
    for (let n = 1; n <= NIVEL_MAXIMO; n++) expect(tituloDoNivel(n).length).toBeGreaterThan(2);
  });
});

describe("catálogo de baralhos", () => {
  it("tem pelo menos 10 gratuitos e ids únicos", () => {
    expect(BARALHOS.filter(ehGratuito).length).toBeGreaterThanOrEqual(10);
    expect(new Set(BARALHOS.map((b) => b.id)).size).toBe(BARALHOS.length);
  });

  it("cada nível de desbloqueio tem um baralho exclusivo", () => {
    for (const n of NIVEIS_DE_DESBLOQUEIO) expect(baralhoDoNivel(n)?.nivelMinimo).toBe(n);
  });

  it("bloqueado não pode ser equipado antes do nível", () => {
    expect(podeEquipar("mestres", 29)).toBe(false);
    expect(podeEquipar("mestres", 30)).toBe(true);
    expect(podeEquipar("aurora", 1)).toBe(true);
    expect(podeEquipar("nao-existe", 30)).toBe(false);
  });
});

describe("eventos de XP", () => {
  const ev = (tipo: EventoXp["tipo"], chave: string, ocorridoEm = "2026-10-27T15:00:00Z") => ({ tipo, chave, ocorridoEm });

  it("aceita evento válido com o XP da tabela (o cliente não escolhe o valor)", () => {
    expect(avaliarEvento(ev("tutorial_modulo", "tutorial:mesa"), [])).toEqual({ aceito: true, xp: 60 });
  });

  it("recusa chave repetida (idempotência)", () => {
    const aceitos = [{ ...ev("tutorial_modulo", "tutorial:mesa") }];
    expect(avaliarEvento(ev("tutorial_modulo", "tutorial:mesa"), aceitos)).toEqual({ aceito: false, motivo: "duplicado" });
  });

  it("respeita o teto diário e reinicia no dia seguinte (fuso de São Paulo)", () => {
    const aceitos = Array.from({ length: 3 }, (_, i) => ev("sessao_treino", `sessao:abcdef${i}`));
    expect(avaliarEvento(ev("sessao_treino", "sessao:abcdef9"), aceitos)).toEqual({ aceito: false, motivo: "limite_diario" });
    // 02:00 UTC do dia 28 ainda é dia 27 em São Paulo
    expect(avaliarEvento(ev("sessao_treino", "sessao:abcdefX", "2026-10-28T02:00:00Z"), aceitos).aceito).toBe(false);
    expect(avaliarEvento(ev("sessao_treino", "sessao:abcdefX", "2026-10-28T04:00:00Z"), aceitos).aceito).toBe(true);
    expect(diaSaoPaulo("2026-10-28T02:00:00Z")).toBe("2026-10-27");
  });

  it("recusa tipo e chave inválidos", () => {
    expect(avaliarEvento({ tipo: "xp_infinito", chave: "x", ocorridoEm: "2026-10-27T15:00:00Z" }, [])).toEqual({
      aceito: false,
      motivo: "tipo_invalido",
    });
    expect(avaliarEvento(ev("mao_treino", "mao::1"), [])).toEqual({ aceito: false, motivo: "chave_invalida" });
  });

  it("só os 10 módulos reais do tutorial rendem XP", () => {
    expect(IDS_MODULOS_TUTORIAL).toHaveLength(10);
    for (const id of IDS_MODULOS_TUTORIAL) expect(avaliarEvento(ev("tutorial_modulo", `tutorial:${id}`), []).aceito).toBe(true);
    expect(avaliarEvento(ev("tutorial_modulo", "tutorial:inventado"), [])).toEqual({ aceito: false, motivo: "chave_invalida" });
    expect(avaliarEvento(ev("tutorial_modulo", "tutorial:completo"), [])).toEqual({ aceito: false, motivo: "chave_invalida" });
  });
});

describe("espelho no banco (migração SQL)", () => {
  const pasta = join(__dirname, "../../../supabase/migrations");
  const sql = readdirSync(pasta)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(join(pasta, f), "utf8"))
    .join("\n");

  it("a tabela de níveis do SQL é a mesma curva do código", () => {
    for (let n = 1; n <= NIVEL_MAXIMO; n++) {
      expect(sql).toContain(`(${n}, ${xpTotalDoNivel(n)}, '${tituloDoNivel(n)}')`);
    }
  });

  it("as regras de XP do SQL são as mesmas do código", () => {
    for (const [tipo, regra] of Object.entries(REGRAS_XP)) {
      expect(sql).toContain(`('${tipo}', ${regra.xp}, ${regra.limiteDiario ?? "null"})`);
    }
  });

  it("o SQL aceita exatamente os mesmos módulos do tutorial", () => {
    expect(sql).toContain(`'^tutorial:(${IDS_MODULOS_TUTORIAL.join("|")})$'`);
  });

  it("o catálogo do SQL tem todos os baralhos com o mesmo nível mínimo", () => {
    for (const b of BARALHOS) expect(sql).toContain(`('${b.id}', ${b.nivelMinimo})`);
  });
});
