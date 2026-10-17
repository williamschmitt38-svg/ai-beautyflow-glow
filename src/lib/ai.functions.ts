import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ask(instructions: string, input: string) {
  const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
  try {
    const res = await generateResponse({ model: "openai/gpt-6-astra", instructions, input });
    const text = (res.output ?? [])
      .flatMap((o: any) => (o.type === "message" ? o.content : []))
      .filter((c: any) => c.type === "output_text")
      .map((c: any) => c.text)
      .join("\n")
      .trim();
    if (!text) throw new Error("A IA não retornou resposta. Tente reformular.");
    return text;
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("AI gateway error", e.code, e.httpStatus);
      if (e.httpStatus === 402) throw new Error("Créditos de IA esgotados. Tente mais tarde.");
      if (e.httpStatus === 429) throw new Error("Muitas solicitações agora. Aguarde um minuto e tente de novo.");
      throw new Error("Não foi possível gerar a resposta agora. Tente novamente.");
    }
    throw e;
  }
}

async function requirePaidPlan(db: any, salaoId: string) {
  const { data } = await db.from("salao").select("plano,nome_salao").eq("id", salaoId).maybeSingle();
  if (!data) throw new Error("Salão não encontrado.");
  if (data.plano !== "pro" && data.plano !== "enterprise") throw new Error("Recurso disponível nos planos Pro e Enterprise.");
  return data as { plano: string; nome_salao: string };
}

export const analyzeFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ salaoId: z.string().uuid(), start: z.string(), end: z.string(), pergunta: z.string().min(3).max(1000) }))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const salao = await requirePaidPlan(db, data.salaoId);
    const [{ data: lanc }, { data: ags }] = await Promise.all([
      db.from("lancamento").select("tipo,categoria,valor,data").eq("company_id", data.salaoId).gte("data", data.start).lte("data", data.end),
      db.from("agendamento").select("servico_nome,valor,data").eq("company_id", data.salaoId).in("status", ["confirmado", "concluido"]).gte("data", data.start).lte("data", data.end),
    ]);
    const custos: Record<string, number> = {};
    for (const l of lanc ?? []) if (l.tipo === "despesa") custos[l.categoria || "Outros"] = (custos[l.categoria || "Outros"] ?? 0) + Number(l.valor);
    const servicos: Record<string, { n: number; total: number }> = {};
    for (const a of ags ?? []) { const s = (servicos[a.servico_nome] ??= { n: 0, total: 0 }); s.n++; s.total += Number(a.valor ?? 0); }
    const receita = Object.values(servicos).reduce((x, s) => x + s.total, 0);
    const custo = Object.values(custos).reduce((x, v) => x + v, 0);
    const resumo = { periodo: `${data.start} a ${data.end}`, receita_atendimentos: receita, custo_total: custo, lucro: receita - custo, custos_por_categoria: custos, servicos, atendimentos: ags?.length ?? 0 };
    const answer = await ask(
      "Você é um consultor financeiro para salões, clínicas de estética e profissionais de bem-estar no Brasil. Responda em português, de forma prática e direta, em markdown simples (títulos curtos e listas). Use apenas os dados fornecidos, valores em R$. Estruture: Diagnóstico, Custos, Retorno, Oportunidades de melhoria (3 a 5 ações concretas). Se faltarem dados, diga o que lançar.",
      `Salão: ${salao.nome_salao}\nDados: ${JSON.stringify(resumo)}\n\nPergunta do dono: ${data.pergunta}`,
    );
    return { answer };
  });

export const generateWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ salaoId: z.string().uuid(), clienteId: z.string().uuid(), oportunidade: z.string().min(2).max(200) }))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const salao = await requirePaidPlan(db, data.salaoId);
    const [{ data: cli }, { data: ags }] = await Promise.all([
      db.from("cliente").select("nome,data_nascimento").eq("id", data.clienteId).eq("company_id", data.salaoId).maybeSingle(),
      db.from("agendamento").select("servico_nome,data,valor,profissional_nome").eq("company_id", data.salaoId).eq("cliente_id", data.clienteId).in("status", ["confirmado", "concluido"]).order("data", { ascending: false }).limit(15),
    ]);
    if (!cli) throw new Error("Cliente não encontrado.");
    const historico = (ags ?? []).map((a) => `${a.data}: ${a.servico_nome}${a.profissional_nome ? ` com ${a.profissional_nome}` : ""}`).join("\n") || "Nenhum atendimento ainda.";
    const message = await ask(
      "Você escreve mensagens de WhatsApp para salões e clínicas de estética no Brasil. Escreva UMA mensagem curta (até 400 caracteres), calorosa, natural, em português, com no máximo 2 emojis, usando o primeiro nome do cliente e citando o histórico quando fizer sentido. Termine com um convite claro para agendar. Responda só com o texto da mensagem, sem aspas.",
      `Salão: ${salao.nome_salao}\nCliente: ${cli.nome}\nOportunidade: ${data.oportunidade}\nHistórico:\n${historico}`,
    );
    return { message };
  });
