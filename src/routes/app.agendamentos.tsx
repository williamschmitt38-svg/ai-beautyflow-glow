import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/agendamentos")({ component: Agendamentos });

const STATUSES = ["agendado", "confirmado", "chegou", "concluido", "cancelado"] as const;
const PAGAMENTOS = ["Pix", "Cartao", "Dinheiro", "Transferencia", "Pacote"] as const;

const schema = z.object({
  cliente_id: z.string().uuid().optional(),
  cliente_nome: z.string().min(1),
  servico_id: z.string().uuid().optional(),
  servico_nome: z.string().min(1),
  profissional_id: z.string().uuid().optional(),
  profissional_nome: z.string().optional(),
  data: z.string(),
  hora: z.string(),
  duracao_minutos: z.coerce.number().int().positive(),
  valor: z.coerce.number().nonnegative().optional(),
  status: z.enum(STATUSES),
  forma_pagamento: z.enum(PAGAMENTOS).optional(),
  observacoes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const statusColor: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-emerald-100 text-emerald-800",
  chegou: "bg-amber-100 text-amber-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

function Agendamentos() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [dia, setDia] = useState(format(new Date(), "yyyy-MM-dd"));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["agendamentos", salaoId, dia], enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("agendamento").select("*")
        .eq("company_id", salaoId!).eq("data", dia).order("hora");
      if (error) throw error; return data;
    },
  });

  const { data: clientes } = useQuery({
    queryKey: ["clientes-list", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("cliente").select("id, nome").eq("company_id", salaoId!).eq("ativo", true)).data ?? [],
  });
  const { data: servicos } = useQuery({
    queryKey: ["servicos-list", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("servico").select("*").eq("company_id", salaoId!).eq("ativo", true)).data ?? [],
  });
  const { data: profs } = useQuery({
    queryKey: ["profs-list", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("profissional").select("id, nome").eq("company_id", salaoId!).eq("ativo", true)).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const payload = { ...v, company_id: salaoId! } as any;
      const res = editing
        ? await supabase.from("agendamento").update(payload).eq("id", editing.id)
        : await supabase.from("agendamento").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Agendamento salvo"); qc.invalidateQueries({ queryKey: ["agendamentos"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("agendamento").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["agendamentos"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Agendamentos" description="Agenda diária"
        action={<NewButton label="Novo agendamento" onClick={() => { setEditing(null); setOpen(true); }} />} />
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setDia(format(subDays(parseISO(dia), 1), "yyyy-MM-dd"))}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-3">
            <Input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="w-44" />
            <span className="text-sm text-muted-foreground">{format(parseISO(dia), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => setDia(format(addDays(parseISO(dia), 1), "yyyy-MM-dd"))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </Card>
      <div className="space-y-2">
        {(data ?? []).length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">Sem agendamentos para este dia</Card>
        )}
        {(data ?? []).map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold tabular-nums w-16">{a.hora}</div>
                <div>
                  <div className="font-medium">{a.cliente_nome}</div>
                  <div className="text-sm text-muted-foreground">{a.servico_nome} {a.profissional_nome && `· ${a.profissional_nome}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor[a.status]}>{a.status}</Badge>
                {a.valor != null && <span className="text-sm">R$ {Number(a.valor).toFixed(2)}</span>}
                <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar agendamento" : "Novo agendamento"}>
        <AgForm initial={editing} dia={dia} clientes={clientes ?? []} servicos={servicos ?? []} profs={profs ?? []}
          onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function AgForm({ initial, dia, clientes, servicos, profs, onSubmit, loading }:
  { initial: any; dia: string; clientes: any[]; servicos: any[]; profs: any[]; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { data: dia, hora: "10:00", duracao_minutos: 60, status: "agendado" },
  });
  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Cliente *</Label>
        <Select value={watch("cliente_id") ?? ""} onValueChange={(v) => {
          setValue("cliente_id", v);
          const c = clientes.find((x) => x.id === v); if (c) setValue("cliente_nome", c.nome);
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="ou digite o nome" {...register("cliente_nome")} />
        {errors.cliente_nome && <p className="text-xs text-destructive">{errors.cliente_nome.message}</p>}
      </div>
      <div className="space-y-2"><Label>Serviço *</Label>
        <Select value={watch("servico_id") ?? ""} onValueChange={(v) => {
          setValue("servico_id", v);
          const s = servicos.find((x) => x.id === v);
          if (s) { setValue("servico_nome", s.nome); setValue("duracao_minutos", s.duracao_minutos); setValue("valor", Number(s.valor)); }
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{servicos.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome} ({s.duracao_minutos}min · R$ {Number(s.valor).toFixed(2)})</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="ou digite o nome" {...register("servico_nome")} />
      </div>
      <div className="space-y-2"><Label>Profissional</Label>
        <Select value={watch("profissional_id") ?? ""} onValueChange={(v) => {
          setValue("profissional_id", v);
          const p = profs.find((x) => x.id === v); if (p) setValue("profissional_nome", p.nome);
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{profs.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2"><Label>Data</Label><Input type="date" {...register("data")} /></div>
        <div className="space-y-2"><Label>Hora</Label><Input type="time" {...register("hora")} /></div>
        <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" {...register("duracao_minutos")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Valor</Label><Input type="number" step="0.01" {...register("valor")} /></div>
        <div className="space-y-2"><Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2"><Label>Forma de pagamento</Label>
        <Select value={watch("forma_pagamento") ?? ""} onValueChange={(v) => setValue("forma_pagamento", v as any)}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>{PAGAMENTOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Observações</Label><Textarea {...register("observacoes")} /></div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
