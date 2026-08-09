import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inviteTeamMember } from "@/lib/admin.functions";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/equipe")({ component: Equipe });

const schema = z.object({
  email: z.string().email(),
  nome: z.string().optional(),
  role: z.enum(["admin", "financeiro", "profissional", "recepcao"]),
});
type Form = z.infer<typeof schema>;

function Equipe() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const invite = useServerFn(inviteTeamMember);

  const { data } = useQuery({
    queryKey: ["equipe", salaoId],
    enabled: !!salaoId,
    queryFn: async () => (await supabase.from("salao_user").select("*").eq("salao_id", salaoId!).order("created_at")).data ?? [],
  });

  const save = useMutation({
    mutationFn: (v: Form) => invite({ data: { salao_id: salaoId!, ...v } }),
    onSuccess: (r: any) => {
      toast.success("Convite enviado por email.");
      if (r?.action_link) console.log("Invite link:", r.action_link);
      qc.invalidateQueries({ queryKey: ["equipe"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, ativo }: any) => { const { error } = await supabase.from("salao_user").update({ ativo: !ativo }).eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipe"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("salao_user").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["equipe"] }); },
  });

  return (
    <div>
      <PageHeader title="Equipe" description="Membros com acesso a este salão" action={<NewButton label="Convidar" onClick={() => setOpen(true)} />} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nome / Email</TableHead><TableHead>Papel</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {(data ?? []).map((u: any) => (
              <TableRow key={u.id}>
                <TableCell><div className="font-medium">{u.nome ?? "—"}</div><div className="text-xs text-muted-foreground">{u.email}</div></TableCell>
                <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                <TableCell>{u.ativo ? <Badge>Ativo</Badge> : <Badge variant="outline">Inativo</Badge>}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => toggle.mutate({ id: u.id, ativo: u.ativo })}>{u.ativo ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(u.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <FormDialog open={open} onOpenChange={setOpen} title="Convidar membro">
        <EquipeForm onSubmit={(v: Form) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function EquipeForm({ onSubmit, loading }: any) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { role: "recepcao" },
  });
  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
      <div className="space-y-2"><Label>Nome</Label><Input {...register("nome")} /></div>
      <div className="space-y-2"><Label>Papel</Label>
        <Select value={watch("role")} onValueChange={(v) => setValue("role", v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="profissional">Profissional</SelectItem>
            <SelectItem value="recepcao">Recepção</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>Convidar</Button>
    </form>
  );
}
