import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/clientes")({ component: Clientes });

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
              <TableHead>Email</TableHead><TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.telefone}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="text-right">
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
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
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
