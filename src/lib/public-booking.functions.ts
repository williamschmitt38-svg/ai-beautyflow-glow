import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPublicSalao = createServerFn({ method: "GET" })
  .inputValidator((v) => z.object({ slug: z.string().min(1).max(120) }).parse(v))
  .handler(async ({ data }) => {
    const { data: salao, error } = await supabaseAdmin
      .from("salao")
      .select("id, nome_salao, nome_fantasia, slug, cor_primaria, logo_url, telefone, whatsapp, endereco")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!salao) return null;

    const [{ data: servicos }, { data: profissionais }, { data: pacotes }] = await Promise.all([
      supabaseAdmin.from("servico").select("id, nome, categoria, duracao_minutos, valor").eq("company_id", salao.id).eq("ativo", true).order("nome"),
      supabaseAdmin.from("profissional").select("id, nome, especialidade, hora_inicio, hora_fim").eq("company_id", salao.id).eq("ativo", true).order("nome"),
      supabaseAdmin.from("pacote").select("id, nome, descricao, total_sessoes, valor, validade_dias").eq("company_id", salao.id).eq("ativo", true).order("valor"),
    ]);
    return { salao, servicos: servicos ?? [], profissionais: profissionais ?? [], pacotes: pacotes ?? [] };
  });

export const getAvailableSlots = createServerFn({ method: "GET" })
  .inputValidator((v) => z.object({
    slug: z.string().min(1).max(120),
    profissional_id: z.string().uuid(),
    servico_id: z.string().uuid(),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).parse(v))
  .handler(async ({ data }) => {
    const { data: salao } = await supabaseAdmin.from("salao").select("id").eq("slug", data.slug).maybeSingle();
    if (!salao) throw new Error("Salão não encontrado");
    const [{ data: prof }, { data: servico }] = await Promise.all([
      supabaseAdmin.from("profissional").select("hora_inicio, hora_fim, dias_atendimento").eq("id", data.profissional_id).eq("company_id", salao.id).maybeSingle(),
      supabaseAdmin.from("servico").select("duracao_minutos").eq("id", data.servico_id).eq("company_id", salao.id).maybeSingle(),
    ]);
    if (!prof || !servico) throw new Error("Profissional ou serviço inválido");

    // Day-of-week check (dias_atendimento jsonb: array of 0-6 or named days)
    const dow = new Date(data.data + "T00:00:00").getDay();
    const dias = prof.dias_atendimento as any;
    if (Array.isArray(dias) && dias.length > 0) {
      const map: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
      const ok = dias.some((d: any) => (typeof d === "number" ? d === dow : map[String(d).toLowerCase().slice(0, 3)] === dow));
      if (!ok) return { slots: [] as string[] };
    }

    const [hi, mi] = String(prof.hora_inicio ?? "09:00").split(":").map(Number);
    const [hf, mf] = String(prof.hora_fim ?? "18:00").split(":").map(Number);
    const inicio = hi * 60 + mi;
    const fim = hf * 60 + mf;
    const dur = servico.duracao_minutos ?? 60;
    const step = 30;

    const { data: ags } = await supabaseAdmin
      .from("agendamento")
      .select("hora, duracao_minutos, status")
      .eq("company_id", salao.id)
      .eq("profissional_id", data.profissional_id)
      .eq("data", data.data)
      .in("status", ["agendado", "confirmado", "chegou"]);
    const ocupados = (ags ?? []).map((a) => {
      const [h, m] = String(a.hora).split(":").map(Number);
      const ini = h * 60 + m;
      return { ini, fim: ini + (a.duracao_minutos ?? 60) };
    });

    const slots: string[] = [];
    const now = new Date();
    const isToday = data.data === now.toISOString().slice(0, 10);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let t = inicio; t + dur <= fim; t += step) {
      if (isToday && t <= nowMin) continue;
      const conflito = ocupados.some((o) => t < o.fim && o.ini < t + dur);
      if (!conflito) slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
    }
    return { slots };
  });

const agendamentoSchema = z.object({
  slug: z.string().min(1).max(120),
  servico_id: z.string().uuid(),
  profissional_id: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  cliente_nome: z.string().min(2).max(120),
  cliente_telefone: z.string().min(8).max(20),
  cliente_email: z.string().email().optional().or(z.literal("")),
});

export const createPublicAgendamento = createServerFn({ method: "POST" })
  .inputValidator((v) => agendamentoSchema.parse(v))
  .handler(async ({ data }) => {
    const { data: salao, error: e1 } = await supabaseAdmin.from("salao").select("id").eq("slug", data.slug).maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!salao) throw new Error("Salão não encontrado");

    const [{ data: servico }, { data: prof }] = await Promise.all([
      supabaseAdmin.from("servico").select("id, nome, valor, duracao_minutos").eq("id", data.servico_id).eq("company_id", salao.id).maybeSingle(),
      supabaseAdmin.from("profissional").select("id, nome").eq("id", data.profissional_id).eq("company_id", salao.id).maybeSingle(),
    ]);
    if (!servico || !prof) throw new Error("Serviço ou profissional inválido");

    // Availability check: overlapping appointment with same professional, same date, not cancelled
    const [hh, mm] = data.hora.split(":").map(Number);
    const novoInicio = hh * 60 + mm;
    const novoFim = novoInicio + (servico.duracao_minutos ?? 60);
    const { data: conflitos } = await supabaseAdmin
      .from("agendamento")
      .select("hora, duracao_minutos, status")
      .eq("company_id", salao.id)
      .eq("profissional_id", prof.id)
      .eq("data", data.data)
      .in("status", ["agendado", "confirmado", "chegou"]);
    for (const c of conflitos ?? []) {
      const [ch, cm] = String(c.hora).split(":").map(Number);
      const cIni = ch * 60 + cm;
      const cFim = cIni + (c.duracao_minutos ?? 60);
      if (novoInicio < cFim && cIni < novoFim) {
        throw new Error("Horário indisponível — já existe um agendamento neste intervalo.");
      }
    }

    // Upsert cliente by telefone
    const { data: clienteExistente } = await supabaseAdmin.from("cliente").select("id").eq("company_id", salao.id).eq("telefone", data.cliente_telefone).maybeSingle();
    let cliente_id = clienteExistente?.id ?? null;
    if (!cliente_id) {
      const { data: novo, error: ec } = await supabaseAdmin.from("cliente").insert({
        company_id: salao.id, nome: data.cliente_nome, telefone: data.cliente_telefone, email: data.cliente_email || null, ativo: true,
      }).select("id").single();
      if (ec) throw new Error(ec.message);
      cliente_id = novo.id;
    }

    const { data: ag, error: ea } = await supabaseAdmin.from("agendamento").insert({
      company_id: salao.id,
      cliente_id,
      cliente_nome: data.cliente_nome,
      servico_id: servico.id, servico_nome: servico.nome,
      profissional_id: prof.id, profissional_nome: prof.nome,
      data: data.data, hora: data.hora,
      duracao_minutos: servico.duracao_minutos,
      valor: servico.valor,
      status: "agendado",
    }).select("id, data, hora").single();
    if (ea) throw new Error(ea.message);
    return { ok: true, agendamento: ag };
  });

const comprarSchema = z.object({
  slug: z.string().min(1).max(120),
  pacote_id: z.string().uuid(),
  cliente_nome: z.string().min(2).max(120),
  cliente_telefone: z.string().min(8).max(20),
  cliente_email: z.string().email().optional().or(z.literal("")),
});

export const comprarPacote = createServerFn({ method: "POST" })
  .inputValidator((v) => comprarSchema.parse(v))
  .handler(async ({ data }) => {
    const { data: salao } = await supabaseAdmin.from("salao").select("id").eq("slug", data.slug).maybeSingle();
    if (!salao) throw new Error("Salão não encontrado");

    const { data: pacote } = await supabaseAdmin.from("pacote").select("id, nome, total_sessoes, valor, validade_dias").eq("id", data.pacote_id).eq("company_id", salao.id).maybeSingle();
    if (!pacote) throw new Error("Pacote inválido");

    const { data: clienteExistente } = await supabaseAdmin.from("cliente").select("id").eq("company_id", salao.id).eq("telefone", data.cliente_telefone).maybeSingle();
    let cliente_id = clienteExistente?.id ?? null;
    if (!cliente_id) {
      const { data: novo, error: ec } = await supabaseAdmin.from("cliente").insert({
        company_id: salao.id, nome: data.cliente_nome, telefone: data.cliente_telefone, email: data.cliente_email || null, ativo: true,
      }).select("id").single();
      if (ec) throw new Error(ec.message);
      cliente_id = novo.id;
    }

    const dataInicio = new Date().toISOString().slice(0, 10);
    const validade = new Date(Date.now() + pacote.validade_dias * 86400000).toISOString().slice(0, 10);

    const { data: pc, error: ep } = await supabaseAdmin.from("pacote_cliente").insert({
      company_id: salao.id, cliente_id, cliente_nome: data.cliente_nome,
      pacote_id: pacote.id, pacote_nome: pacote.nome,
      total_sessoes: pacote.total_sessoes, sessoes_usadas: 0,
      valor_pago: pacote.valor, data_inicio: dataInicio, data_validade: validade,
      status: "ativo",
    }).select("id").single();
    if (ep) throw new Error(ep.message);
    return { ok: true, id: pc.id };
  });
