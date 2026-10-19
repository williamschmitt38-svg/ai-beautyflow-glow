// Shared schedule rules (browser + server safe).
export type DiaHorario = { aberto: boolean; inicio: string; fim: string };
export type Semana = Record<string, DiaHorario>; // keys "0".."6" (0 = domingo)

export const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const SEMANA_PADRAO: Semana = Object.fromEntries(
  DIAS.map((_, i) => [String(i), { aberto: i >= 1 && i <= 6, inicio: "09:00", fim: i === 6 ? "14:00" : "18:00" }]),
);

export function normalizeSemana(v: unknown): Semana {
  const base = { ...SEMANA_PADRAO };
  if (v && typeof v === "object") {
    for (const k of Object.keys(base)) {
      const d = (v as any)[k];
      if (d && typeof d === "object") base[k] = { aberto: !!d.aberto, inicio: String(d.inicio ?? "09:00"), fim: String(d.fim ?? "18:00") };
    }
  }
  return base;
}

/** Parse dias_atendimento (numbers 0-6 or day names) into a set of weekday numbers; null = all days. */
export function parseDias(dias: unknown): Set<number> | null {
  if (!Array.isArray(dias) || dias.length === 0) return null;
  const map: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, "sáb": 6 };
  const out = new Set<number>();
  for (const d of dias) {
    if (typeof d === "number") out.add(d);
    else { const n = map[String(d).toLowerCase().slice(0, 3)]; if (n !== undefined) out.add(n); }
  }
  return out;
}

const toMin = (s: string) => { const [h, m] = s.split(":").map(Number); return h * 60 + (m || 0); };

export type JanelaResult = { aberto: true; inicio: number; fim: number } | { aberto: false; motivo: string };

/** Resolve the working window for a professional on a given date. */
export function resolverJanela(opts: {
  data: string;
  semanaSalao: unknown;
  prof: { usa_horario_salao?: boolean | null; hora_inicio?: string | null; hora_fim?: string | null; dias_atendimento?: unknown };
  bloqueios: { profissional_id: string | null; motivo: string | null }[];
}): JanelaResult {
  const dow = new Date(opts.data + "T12:00:00Z").getUTCDay();
  const salaoBloq = opts.bloqueios.find((b) => !b.profissional_id);
  if (salaoBloq) return { aberto: false, motivo: `O estabelecimento estará fechado nesta data${salaoBloq.motivo ? ` (${salaoBloq.motivo})` : ""}.` };
  const profBloq = opts.bloqueios.find((b) => b.profissional_id);
  if (profBloq) return { aberto: false, motivo: `Profissional indisponível nesta data${profBloq.motivo ? ` (${profBloq.motivo})` : ""}.` };

  const configurado = opts.semanaSalao != null;
  const semana = normalizeSemana(opts.semanaSalao);
  const dia = semana[String(dow)];
  if (configurado && !dia.aberto) return { aberto: false, motivo: `Fechado ${dow === 0 || dow === 6 ? "aos" : "às"} ${DIAS[dow].toLowerCase()}s.` };

  let inicio: number, fim: number;
  if (opts.prof.usa_horario_salao !== false && configurado) {
    inicio = toMin(dia.inicio); fim = toMin(dia.fim);
  } else {
    const dias = parseDias(opts.prof.dias_atendimento);
    if (dias && !dias.has(dow)) return { aberto: false, motivo: "Profissional não atende neste dia da semana." };
    inicio = toMin(opts.prof.hora_inicio ?? "09:00"); fim = toMin(opts.prof.hora_fim ?? "18:00");
    if (configurado) { inicio = Math.max(inicio, toMin(dia.inicio)); fim = Math.min(fim, toMin(dia.fim)); }
  }
  if (fim <= inicio) return { aberto: false, motivo: "Sem horários neste dia." };
  return { aberto: true, inicio, fim };
}
