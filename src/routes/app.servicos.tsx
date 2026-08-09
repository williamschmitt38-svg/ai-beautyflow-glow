import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Clock, DollarSign, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/servicos")({ component: Servicos });

const CATS = ["Cabelo", "Unhas", "Estetica", "Maquiagem", "Massagem"] as const;
const schema = z.object({
  nome: z.string().min(2),
  categoria: z.enum(CATS).optional(),
  duracao_minutos: z.coerce.number().int().positive(),
  valor: z.coerce.number().nonnegative(),
  descricao: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Servicos() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["servicos", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("servico").select("*").eq("company_id", salaoId!).order("nome");
      if (error) throw error; return data;
    },
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const payload = { ...v, company_id: salaoId!, categoria: v.categoria || null };
      const res = editing
        ? await supabase.from("servico").update(payload).eq("id", editing.id)
        : await supabase.from("servico").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Serviço salvo"); qc.invalidateQueries({ queryKey: ["servicos"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("servico").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["servicos"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const tabs = ["Todos", ...CATS] as const;
  const filtered = (cat: string) => (data ?? []).filter((s) => cat === "Todos" ? true : (s.categoria ?? "—") === cat);

  return (
    <div>
      <PageHeader title="Serviços" description="Catálogo de serviços do salão"
        action={<NewButton label="Novo serviço" onClick={() => { setEditing(null); setOpen(true); }} />} />

      <Tabs defaultValue="Todos">
        <TabsList className="mb-4">
          {tabs.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t} value={t} className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered(t).map((s: any) => (
                <Card key={s.id} className="group transition hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      {s.categoria && <Badge variant="secondary">{s.categoria}</Badge>}
                    </div>
                    <h3 className="mt-3 font-semibold">{s.nome}</h3>
                    {s.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.descricao}</p>}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {s.duracao_minutos} min</span>
                      <span className="flex items-center gap-1 font-semibold text-primary"><DollarSign className="h-3 w-3" /> R$ {Number(s.valor).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(s); setOpen(true); }}>
                        <Pencil className="mr-2 h-3 w-3" /> Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => confirm(`Remover ${s.nome}?`) && del.mutate(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered(t).length === 0 && (
                <Card className="col-span-full"><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum serviço nesta categoria</CardContent></Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar serviço" : "Novo serviço"}>
        <ServicoForm initial={editing} onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function ServicoForm({ initial, onSubmit, loading }: { initial: any; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { duracao_minutos: 60, valor: 0 },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Nome *</Label><Input {...register("nome")} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
      <div className="space-y-2"><Label>Categoria</Label>
        <Select value={watch("categoria") ?? ""} onValueChange={(v) => setValue("categoria", v as any)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" {...register("duracao_minutos")} /></div>
        <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" {...register("valor")} /></div>
      </div>
      <div className="space-y-2"><Label>Descrição</Label><Textarea {...register("descricao")} /></div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
