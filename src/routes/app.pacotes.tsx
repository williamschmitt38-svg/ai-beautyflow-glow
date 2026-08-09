import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Package, Calendar, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/pacotes")({ component: Pacotes });

const schema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  total_sessoes: z.coerce.number().int().positive(),
  valor: z.coerce.number().nonnegative(),
  validade_dias: z.coerce.number().int().positive(),
  servicos_incluidos: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Pacotes() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["pacotes", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("pacote").select("*").eq("company_id", salaoId!).order("nome");
      if (error) throw error; return data;
    },
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const payload = {
        ...v, company_id: salaoId!,
        servicos_incluidos: v.servicos_incluidos ? v.servicos_incluidos.split(",").map((s) => s.trim()).filter(Boolean) : null,
      };
      const res = editing
        ? await supabase.from("pacote").update(payload).eq("id", editing.id)
        : await supabase.from("pacote").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Pacote salvo"); qc.invalidateQueries({ queryKey: ["pacotes"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("pacote").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["pacotes"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Pacotes" description="Pacotes promocionais para venda"
        action={<NewButton label="Novo pacote" onClick={() => { setEditing(null); setOpen(true); }} />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p: any) => (
          <Card key={p.id} className="group transition hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
              </div>
              <h3 className="mt-3 font-semibold">{p.nome}</h3>
              {p.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.descricao}</p>}
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-primary" /> {p.total_sessoes} sessões</div>
                <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-primary" /> Validade {p.validade_dias} dias</div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t pt-4">
                <span className="text-2xl font-bold text-primary">R$ {Number(p.valor).toFixed(2)}</span>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing({ ...p, servicos_incluidos: (p.servicos_incluidos ?? []).join(", ") }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(`Remover ${p.nome}?`) && del.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(data?.length ?? 0) === 0 && (
          <Card className="col-span-full"><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum pacote cadastrado</CardContent></Card>
        )}
      </div>
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar pacote" : "Novo pacote"}>
        <PacForm initial={editing} onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function PacForm({ initial, onSubmit, loading }: { initial: any; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { total_sessoes: 10, valor: 0, validade_dias: 90 },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Nome *</Label><Input {...register("nome")} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea {...register("descricao")} /></div>
      <div className="space-y-2"><Label>Serviços incluídos (separados por vírgula)</Label><Input {...register("servicos_incluidos")} /></div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2"><Label>Sessões</Label><Input type="number" {...register("total_sessoes")} /></div>
        <div className="space-y-2"><Label>Valor</Label><Input type="number" step="0.01" {...register("valor")} /></div>
        <div className="space-y-2"><Label>Validade (dias)</Label><Input type="number" {...register("validade_dias")} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
