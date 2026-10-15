import { pageHead } from "@/lib/page-head";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2, Lock, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/clientes")({ head: () => pageHead("Clientes", "Clientes: gestão de salões de beleza no GlowVitta."), component: Clientes });

const schema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  data_nascimento: z.string().optional(),
  observacoes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Clientes() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["clientes", salaoId],
    enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("cliente").select("*")
        .eq("company_id", salaoId!).order("nome");
      if (error) throw error;
      return data;
    },
  });

  const [detail, setDetail] = useState<any>(null);
  const { data: plano } = useQuery({
    queryKey: ["salao-plano", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("salao").select("plano").eq("id", salaoId!).single();
      if (error) throw error;
      return data.plano;
    },
  });
  const unlocked = plano === "pro" || plano === "enterprise";
  const { data: gastos } = useQuery({
    queryKey: ["cliente-gastos", salaoId], enabled: !!salaoId && unlocked,
    queryFn: async () => {
      const { data, error } = await supabase.from("agendamento")
        .select("cliente_id, valor, servico:servico_id(servico_categoria(nome))")
        .eq("company_id", salaoId!).in("status", ["confirmado", "concluido"]).not("cliente_id", "is", null);
      if (error) throw error;
      const map: Record<string, { total: number; vezes: number; cats: Record<string, number> }> = {};
      for (const a of data as any[]) {
        const m = (map[a.cliente_id] ??= { total: 0, vezes: 0, cats: {} });
        const v = Number(a.valor ?? 0);
        m.total += v; m.vezes += 1;
        const cat = a.servico?.servico_categoria?.nome ?? "Sem categoria";
        m.cats[cat] = (m.cats[cat] ?? 0) + v;
      }
      return map;
    },
  });
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const payload = {
        ...v,
        email: v.email || null,
        data_nascimento: v.data_nascimento || null,
        company_id: salaoId!,
      };
      if (editing) {
        const { error } = await supabase.from("cliente").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cliente").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Cliente salvo");
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setOpen(false); setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cliente").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["clientes"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro de clientes"
        action={<NewButton label="Novo cliente" onClick={() => { setEditing(null); setOpen(true); }} />}
      />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead><TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead><TableHead>LTV</TableHead><TableHead className="w-40"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.telefone}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="whitespace-nowrap font-semibold">
                  {unlocked ? brl(gastos?.[c.id]?.total ?? 0) : <Lock className="h-4 w-4 text-muted-foreground" aria-label="Disponível nos planos Pro e Enterprise" />}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" aria-label="Ver detalhes" onClick={() => setDetail(c)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(`Remover ${c.nome}?`) && del.mutate(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detail?.nome}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm text-muted-foreground">
              {detail.telefone && <p>Telefone: {detail.telefone}</p>}
              {detail.email && <p>Email: {detail.email}</p>}
              {detail.observacoes && <p>Observações: {detail.observacoes}</p>}
            </div>
          )}
          <h3 className="mt-2 font-semibold">Histórico de Gastos</h3>
          {unlocked ? (() => {
            const g = gastos?.[detail?.id] ?? { total: 0, vezes: 0, cats: {} };
            const cats = Object.entries(g.cats).sort((a, b) => b[1] - a[1]);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Total Gasto</p><p className="text-xl font-bold">{brl(g.total)}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Frequência</p><p className="text-xl font-bold">{g.vezes} {g.vezes === 1 ? "visita" : "visitas"}</p></Card>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Gasto por Categoria</p>
                  {cats.length === 0 && <p className="text-sm text-muted-foreground">Nenhum agendamento confirmado ou concluído.</p>}
                  {cats.map(([nome, v]) => (
                    <div key={nome} className="space-y-1">
                      <div className="flex justify-between text-sm"><span>{nome}</span><span className="font-medium">{brl(v)}</span></div>
                      <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${g.total ? (v / g.total) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Considera apenas agendamentos confirmados ou concluídos.</p>
              </div>
            );
          })() : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm">O Histórico de Gastos e o LTV estão disponíveis nos planos Pro e Enterprise.</p>
              <Button asChild><Link to="/app/configuracoes" search={{ tab: "cobranca" } as any}>Fazer upgrade</Link></Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <FormDialog open={open} onOpenChange={setOpen} title={editing ? "Editar cliente" : "Novo cliente"}>
        <ClienteForm initial={editing} onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function ClienteForm({ initial, onSubmit, loading }: { initial: any; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? {},
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Nome *</Label><Input {...register("nome")} />{errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Telefone</Label><Input {...register("telefone")} /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
      </div>
      <div className="space-y-2"><Label>Data de nascimento</Label><Input type="date" {...register("data_nascimento")} /></div>
      <div className="space-y-2"><Label>Observações</Label><Textarea {...register("observacoes")} /></div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
