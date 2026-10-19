import { describe, it, expect } from "vitest";
import { resolverJanela, SEMANA_PADRAO } from "./agenda";

const semana = { ...SEMANA_PADRAO, "0": { aberto: false, inicio: "09:00", fim: "18:00" } };
const prof = { usa_horario_salao: true, hora_inicio: "10:00", hora_fim: "16:00", dias_atendimento: [2, 4] };

describe("resolverJanela", () => {
  it("salão fechado no domingo", () => {
    expect(resolverJanela({ data: "2026-10-18", semanaSalao: semana, prof, bloqueios: [] }).aberto).toBe(false);
  });
  it("feriado do salão bloqueia todos", () => {
    expect(resolverJanela({ data: "2026-10-20", semanaSalao: semana, prof, bloqueios: [{ profissional_id: null, motivo: "Feriado" }] }).aberto).toBe(false);
  });
  it("folga da profissional bloqueia", () => {
    expect(resolverJanela({ data: "2026-10-20", semanaSalao: semana, prof, bloqueios: [{ profissional_id: "x", motivo: null }] }).aberto).toBe(false);
  });
  it("horário próprio respeita dias da profissional", () => {
    const p = { ...prof, usa_horario_salao: false };
    expect(resolverJanela({ data: "2026-10-19", semanaSalao: semana, prof: p, bloqueios: [] }).aberto).toBe(false); // segunda
    expect(resolverJanela({ data: "2026-10-20", semanaSalao: semana, prof: p, bloqueios: [] })).toEqual({ aberto: true, inicio: 600, fim: 960 });
  });
  it("horário padrão usa expediente do salão", () => {
    expect(resolverJanela({ data: "2026-10-20", semanaSalao: semana, prof, bloqueios: [] })).toEqual({ aberto: true, inicio: 540, fim: 1080 });
  });
});
