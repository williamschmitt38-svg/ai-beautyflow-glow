import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pause, Play, X, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loginAsSalao, masterUpdateSalaoStatus } from "@/lib/admin.functions";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/master/saloes")({ component: Saloes });

function Saloes() {
  const qc = useQueryClient();
  const loginAs = useServerFn(loginAsSalao);
  const updateStatus = useServerFn(masterUpdateSalaoStatus);
  const { data } = useQuery({
    queryKey: ["master-saloes"],
    queryFn: async () => (await supabase.from("salao").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const upd = useMutation({
    mutationFn: ({ salao_id, action }: { salao_id: string; action: "suspender" | "reativar" | "cancelar" }) =>
      updateStatus({ data: { salao_id, action } }),
    onSuccess: () => { toast.success("Ação registrada"); qc.invalidateQueries({ queryKey: ["master-saloes"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const loginMut = useMutation({
    mutationFn: (salao_id: string) => loginAs({ data: { salao_id } }),
    onSuccess: (r: any) => {
      if (r.action_link) { window.open(r.action_link, "_blank"); toast.success(`Link gerado para ${r.email}`); }
      else toast.error("Link não retornado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Salões" description={`${data?.length ?? 0} salões cadastrados`} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Salão</TableHead><TableHead>Plano</TableHead><TableHead>Cobrança</TableHead><TableHead>Criado em</TableHead><TableHead>Trial até</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {(data ?? []).map((s: any) => (
              <TableRow key={s.id}>
                <TableCell><div className="font-medium">{s.nome_salao}</div><div className="text-xs text-muted-foreground">{s.admin_email}</div></TableCell>
                <TableCell><Badge variant="secondary">{s.plano}</Badge></TableCell>
                <TableCell><Badge>{s.status_cobranca}</Badge></TableCell>
                <TableCell className="text-sm">{format(new Date(s.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-sm">{s.trial_ate ? format(new Date(s.trial_ate), "dd/MM/yyyy") : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => loginMut.mutate(s.id)} disabled={loginMut.isPending}><LogIn className="mr-1 h-3 w-3" /> Login as</Button>
                  {s.status_cobranca !== "suspenso" && <Button size="sm" variant="ghost" onClick={() => upd.mutate({ salao_id: s.id, action: "suspender" })}><Pause className="mr-1 h-3 w-3" /> Suspender</Button>}
                  {s.status_cobranca === "suspenso" && <Button size="sm" variant="ghost" onClick={() => upd.mutate({ salao_id: s.id, action: "reativar" })}><Play className="mr-1 h-3 w-3" /> Reativar</Button>}
                  <Button size="sm" variant="ghost" onClick={() => confirm(`Cancelar ${s.nome_salao}?`) && upd.mutate({ salao_id: s.id, action: "cancelar" })}><X className="mr-1 h-3 w-3" /> Cancelar</Button>
                </TableCell>
              </TableRow>
            ))}
            {data?.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum salão cadastrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
