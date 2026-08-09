import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Pencil, Trash2, Clock, Mail, Phone, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/profissionais")({ component: Profissionais });

const schema = z.object({
  nome: z.string().min(2),
  especialidade: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  hora_inicio: z.string(),
  hora_fim: z.string(),
});
type Form = z.infer<typeof schema>;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function Profissionais() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data } = useQuery({
    queryKey: ["profissionais", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      const [profs, ags] = await Promise.all([
        supabase.from("profissional").select("*").eq("company_id", salaoId!).order("nome"),
        supabase.from("agendamento").select("profissional_id, valor, status").eq("company_id", salaoId!).gte("data", monthStart).lte("data", monthEnd),
      ]);
      if (profs.error) throw profs.error;
      const kpis: Record<string, { count: number; fat: number }> = {};
      (ags.data ?? []).forEach((a) => {
        if (!a.profissional_id) return;
        const k = kpis[a.profissional_id] ??= { count: 0, fat: 0 };
        if (a.status === "concluido") { k.count++; k.fat += Number(a.valor ?? 0); }
      });
      return (profs.data ?? []).map((p) => ({ ...p, kpi: kpis[p.id] ?? { count: 0, fat: 0 } }));
    },
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const payload = { ...v, company_id: salaoId!, email: v.email || null };
      const res = editing
        ? await supabase.from("profissional").update(payload).eq("id", editing.id)
        : await supabase.from("profissional").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Profissional salvo"); qc.invalidateQueries({ queryKey: ["profissionais"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("profissional").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["profissionais"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Profissionais" description="Equipe do salão com KPIs mensais"
        action={<NewButton label="Novo profissional" onClick={() => { setEditing(null); setOpen(true); }} />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p: any) => (
          <Card key={p.id} className="group transition hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary">{initials(p.nome)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground truncate">{p.especialidade || "—"}</p>
                  <Badge variant={p.ativo ? "default" : "secondary"} className="mt-1 text-[10px]">
                    {p.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {p.hora_inicio} – {p.hora_fim}</div>
                {p.telefone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {p.telefone}</div>}
                {p.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {p.email}</div>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Atendimentos mês</p>
                  <p className="text-lg font-bold">{p.kpi.count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Faturamento</p>
                  <p className="text-lg font-bold flex items-center gap-1"><TrendingUp className="h-3 w-3 text-primary" /> R$ {p.kpi.fat.toFixed(0)}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Pencil className="mr-2 h-3 w-3" /> Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => confirm(`Remover ${p.nome}?`) && del.mutate(p.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(data?.length ?? 0) === 0 && (
          <Card className="col-span-full"><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum profissional cadastrado</CardContent></Card>
        )}
      </div>

      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar profissional" : "Novo profissional"}>
        <ProfForm initial={editing} onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function ProfForm({ initial, onSubmit, loading }: { initial: any; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { hora_inicio: "09:00", hora_fim: "18:00" },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Nome *</Label><Input {...register("nome")} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
      <div className="space-y-2"><Label>Especialidade</Label><Input {...register("especialidade")} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Telefone</Label><Input {...register("telefone")} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Hora início</Label><Input type="time" {...register("hora_inicio")} /></div>
        <div className="space-y-2"><Label>Hora fim</Label><Input type="time" {...register("hora_fim")} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
