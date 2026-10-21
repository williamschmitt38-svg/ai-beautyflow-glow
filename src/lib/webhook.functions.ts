import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const testSalonWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ salaoId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: salao } = await context.supabase.from("salao").select("plano, webhook_url, nome_salao").eq("id", data.salaoId).maybeSingle();
    if (!salao) throw new Error("Salão não encontrado.");
    if (salao.plano !== "enterprise") throw new Error("Integrações são exclusivas do plano Enterprise.");
    if (!salao.webhook_url) throw new Error("Salve uma URL de webhook primeiro.");
    const { dispatchSalonWebhook } = await import("./webhook.server");
    return dispatchSalonWebhook(salao.webhook_url, "teste", {
      salao: salao.nome_salao, cliente_nome: "Cliente Exemplo", servico_nome: "Limpeza de pele",
      data: new Date().toISOString().slice(0, 10), hora: "10:00", valor: 150,
    });
  });
