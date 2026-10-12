import { pageHead } from "@/lib/page-head";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Clock, DollarSign, Scissors, Tags } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { useAuth } from "@/hooks/useAuth";
import { useServiceCategories, type ServiceCategory } from "@/hooks/useServiceCategories";
import { ServiceCategoryManager } from "@/components/ServiceCategoryManager";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/app/servicos")({ head: () => pageHead("Serviços", "Serviços: gestão de salões de beleza no BeautyFlow."), component: Servicos });

const schema = z.object({
  nome: z.string().min(2),
  category_id: z.string().uuid().optional().or(z.literal("")),
  duracao_minutos: z.coerce.number().int().positive(),
  valor: z.coerce.number().nonnegative(),
  descricao: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Servicos() {
  const { salaoId } = useSalao();
  const { user, isSuperAdmin } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useServiceCategories(salaoId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Todos");
  const [editing, setEditing] = useState<any>(null);
  const { data: canManage = false } = useQuery({
    queryKey: ["manage-service-categories", salaoId, user?.id, isSuperAdmin], enabled: !!salaoId && !!user,
    queryFn: async () => {
      if (!salaoId || !user) return false;
      if (isSuperAdmin) return true;
      const { data, error } = await supabase.from("salao_user").select("id").eq("salao_id", salaoId).eq("user_id", user.id).eq("ativo", true).in("role", ["owner", "admin"]).limit(1);
      if (error) throw error;
      return !!data?.length;
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["servicos", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      if (!salaoId) return [];
      const { data, error } = await supabase.from("servico").select("*").eq("company_id", salaoId).order("nome");
      if (error) throw error; return data;
    },
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      if (!salaoId) throw new Error("Selecione um salão.");
      const payload = { ...v, company_id: salaoId, category_id: v.category_id || null };
      const res = editing
        ? await supabase.from("servico").update(payload).eq("id", editing.id)
        : await supabase.from("servico").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => { toast.success("Serviço salvo"); qc.invalidateQueries({ queryKey: ["servicos"] }); qc.invalidateQueries({ queryKey: ["public-salao"] }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("servico").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["servicos"] }); qc.invalidateQueries({ queryKey: ["public-salao"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const populated = categories.filter((category) => data?.some((service) => service.category_id === category.id));
  const tabs = [{ id: "Todos", nome: "Todos" }, ...populated];
  const tab = tabs.some((t) => t.id === activeTab) ? activeTab : "Todos";
  const filtered = (cat: string) => (data ?? []).filter((s) => cat === "Todos" || s.category_id === cat);

  return (
    <div>
      <PageHeader title="Serviços" description="Catálogo de serviços do salão"
        action={<div className="flex flex-wrap justify-end gap-2">
          {canManage && <Button variant="outline" onClick={() => setManageOpen(true)}><Tags className="mr-2 h-4 w-4" /> Gerenciar Categorias</Button>}
          <NewButton label="Novo serviço" onClick={() => { setEditing(null); setOpen(true); }} />
        </div>} />

      {(error || categoriesError) && <p className="mb-4 text-sm text-destructive">Não foi possível carregar o catálogo.</p>}
      {isLoading && <p className="mb-4 text-sm text-muted-foreground">Carregando serviços…</p>}
      <Tabs value={tab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 h-auto max-w-full flex-wrap justify-start">
          {tabs.map((t) => <TabsTrigger key={t.id} value={t.id} className="max-w-full whitespace-normal break-words">{t.nome}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered(t.id).map((s: any) => (
                <Card key={s.id} className="group transition hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Scissors className="h-5 w-5 text-primary" />
                      </div>
                      {categories.find((c) => c.id === s.category_id) && <Badge variant="secondary" className="max-w-[65%] whitespace-normal break-words">{categories.find((c) => c.id === s.category_id)?.nome}</Badge>}
                    </div>
                    <h3 className="mt-3 font-semibold">{s.nome}</h3>
                    {s.descricao && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.descricao}</p>}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {s.duracao_minutos} min</span>
                      <span className="flex items-center gap-1 font-semibold text-primary"><DollarSign className="h-3 w-3" /> R$ {Number(s.valor).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditing(s); setOpen(true); }}>
                        <Pencil className="mr-2 h-3 w-3" /> Editar
                      </Button>
                      <Button size="sm" variant="ghost" aria-label={`Remover ${s.nome}`} disabled={del.isPending} onClick={() => confirm(`Remover ${s.nome}?`) && del.mutate(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!isLoading && !error && filtered(t.id).length === 0 && (
                <Card className="col-span-full"><CardContent className="py-12 text-center text-sm text-muted-foreground">Nenhum serviço nesta categoria</CardContent></Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar serviço" : "Novo serviço"}>
        <ServicoForm initial={editing} categories={categories} onSubmit={(v) => save.mutate(v)} loading={save.isPending || categoriesLoading || !!categoriesError} />
      </FormDialog>
      {salaoId && canManage && <ServiceCategoryManager key={salaoId} salaoId={salaoId} open={manageOpen} onOpenChange={setManageOpen} />}
    </div>
  );
}

function ServicoForm({ initial, categories, onSubmit, loading }: { initial: any; categories: ServiceCategory[]; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { duracao_minutos: 60, valor: 0 },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Nome *</Label><Input {...register("nome")} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
      <div className="space-y-2"><Label>Categoria</Label>
        <Select value={categories.some((c) => c.id === watch("category_id")) ? watch("category_id") : "none"} onValueChange={(v) => setValue("category_id", v === "none" ? "" : v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent><SelectItem value="none">Sem categoria</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
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
