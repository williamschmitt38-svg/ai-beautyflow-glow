import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertSuperAdmin(supabase: any) {
  const { data, error } = await supabase.rpc("is_super_admin");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: apenas super admin");
}

async function writeAudit(params: {
  action: string;
  super_admin_id: string;
  super_admin_email?: string | null;
  target_salao_id?: string | null;
  details?: Record<string, any>;
}) {
  await supabaseAdmin.from("audit_log").insert({
    action: params.action,
    super_admin_id: params.super_admin_id,
    super_admin_email: params.super_admin_email ?? null,
    target_salao_id: params.target_salao_id ?? null,
    details: params.details ?? {},
  });
}

// Master: update salao billing status (suspend / reactivate / cancel) with audit log
export const masterUpdateSalaoStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      salao_id: z.string().uuid(),
      action: z.enum(["suspender", "reativar", "cancelar"]),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const novoStatus = data.action === "suspender" ? "suspenso" : data.action === "reativar" ? "ativo" : "cancelado";

    const { data: before } = await supabaseAdmin.from("salao").select("status_cobranca, nome_salao").eq("id", data.salao_id).maybeSingle();
    const { error } = await supabaseAdmin.from("salao").update({ status_cobranca: novoStatus }).eq("id", data.salao_id);
    if (error) throw new Error(error.message);

    await writeAudit({
      action: `master.${data.action}`,
      super_admin_id: context.userId,
      super_admin_email: context.claims?.email ?? null,
      target_salao_id: data.salao_id,
      details: { from: before?.status_cobranca, to: novoStatus, nome_salao: before?.nome_salao },
    });

    return { ok: true, status_cobranca: novoStatus };
  });

// Generate a magic-link for the salao admin so the super_admin can "log in as"
export const loginAsSalao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ salao_id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase);
    const { data: salao, error } = await supabaseAdmin
      .from("salao").select("admin_email, nome_salao").eq("id", data.salao_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!salao) throw new Error("Salão não encontrado");

    const { data: link, error: el } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: salao.admin_email,
    });
    if (el) throw new Error(el.message);

    await writeAudit({
      action: "master.login_as",
      super_admin_id: context.userId,
      super_admin_email: context.claims?.email ?? null,
      target_salao_id: data.salao_id,
      details: { nome_salao: salao.nome_salao, target_email: salao.admin_email },
    });

    return { ok: true, action_link: link.properties?.action_link ?? null, email: salao.admin_email, nome_salao: salao.nome_salao };
  });

// Invite a team member by email (sends an auth invite + records salao_user row)
export const inviteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({
      salao_id: z.string().uuid(),
      email: z.string().email(),
      nome: z.string().max(120).optional(),
      role: z.enum(["admin", "financeiro", "profissional", "recepcao"]),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { data: access } = await context.supabase.rpc("has_salao_access", { _salao_id: data.salao_id });
    if (!access) throw new Error("Sem acesso a este salão");

    let userId: string | null = null;
    const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email);
    if (invite.error) {
      const list = await supabaseAdmin.auth.admin.listUsers();
      const found = list.data.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (!found) throw new Error(invite.error.message);
      userId = found.id;
    } else {
      userId = invite.data.user?.id ?? null;
    }
    if (!userId) throw new Error("Não foi possível criar/encontrar o usuário");

    const { error: ei } = await supabaseAdmin.from("salao_user").upsert({
      salao_id: data.salao_id,
      user_id: userId,
      email: data.email,
      nome: data.nome ?? null,
      role: data.role,
      ativo: true,
    }, { onConflict: "salao_id,user_id" } as any);
    if (ei) throw new Error(ei.message);

    return { ok: true, action_link: (invite.data as any)?.properties?.action_link ?? null };
  });
