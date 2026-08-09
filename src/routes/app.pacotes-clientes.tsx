import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/pacotes-clientes")({ component: PacotesClientes });

const schema = z.object({
  pacote_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  valor_pago: z.coerce.number().nonnegative().optional(),
  data_inicio: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function PacotesClientes() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["pacote_cliente", salaoId], enabled: !!salaoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("pacote_cliente").select("*").eq("company_id", salaoId!).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const { data: pacotes } = useQuery({
    queryKey: ["pacotes-list", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("pacote").select("*").eq("company_id", salaoId!).eq("ativo", true)).data ?? [],
  });
  const { data: clientes } = useQuery({
    queryKey: ["clientes-list", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("cliente").select("id, nome").eq("company_id", salaoId!).eq("ativo", true).order("nome")).data ?? [],
  });

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const pac = pacotes?.find((p) => p.id === v.pacote_id)!;
      const cli = clientes?.find((c) => c.id === v.cliente_id)!;
      const inicio = v.data_inicio || format(new Date(), "yyyy-MM-dd");
      const payload = {
        company_id: salaoId!,
        pacote_id: v.pacote_id,
        pacote_nome: pac.nome,
        cliente_id: v.cliente_id,
        cliente_nome: cli.nome,
        total_sessoes: pac.total_sessoes,
        valor_pago: v.valor_pago ?? pac.valor,
        data_inicio: inicio,
        data_validade: format(addDays(new Date(inicio), pac.validade_dias), "yyyy-MM-dd"),
      };
      const { error } = await supabase.from("pacote_cliente").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Pacote vendido"); qc.invalidateQueries({ queryKey: ["pacote_cliente"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("pacote_cliente").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["pacote_cliente"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Pacotes Clientes" description="Pacotes vendidos"
        action={<NewButton label="Vender pacote" onClick={() => setOpen(true)} />} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Pacote</TableHead><TableHead>Sessões</TableHead><TableHead>Validade</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {(data ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.cliente_nome}</TableCell>
                <TableCell>{p.pacote_nome}</TableCell>
                <TableCell>{p.sessoes_usadas}/{p.total_sessoes}</TableCell>
                <TableCell>{p.data_validade}</TableCell>
                <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum pacote vendido</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
      <FormDialog open={open} onOpenChange={setOpen} title="Vender pacote">
        <PCForm pacotes={pacotes ?? []} clientes={clientes ?? []} onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function PCForm({ pacotes, clientes, onSubmit, loading }: { pacotes: any[]; clientes: any[]; onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Cliente *</Label>
        <Select value={watch("cliente_id") ?? ""} onValueChange={(v) => setValue("cliente_id", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
        </Select>
        {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
      </div>
      <div className="space-y-2"><Label>Pacote *</Label>
        <Select value={watch("pacote_id") ?? ""} onValueChange={(v) => setValue("pacote_id", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>{pacotes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome} — R$ {Number(p.valor).toFixed(2)}</SelectItem>)}</SelectContent>
        </Select>
        {errors.pacote_id && <p className="text-xs text-destructive">{errors.pacote_id.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Valor pago</Label><Input type="number" step="0.01" {...register("valor_pago")} /></div>
        <div className="space-y-2"><Label>Data de início</Label><Input type="date" {...register("data_inicio")} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>Salvar</Button>
    </form>
  );
}
