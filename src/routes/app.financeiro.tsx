import { pageHead } from "@/lib/page-head";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfYear } from "date-fns";
import { Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader, FormDialog, NewButton } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CustoRetorno, CUSTO_CATS } from "@/components/CustoRetorno";
import { ConsultorFinanceiro } from "@/components/ConsultorFinanceiro";

export const Route = createFileRoute("/app/financeiro")({ head: () => pageHead("Financeiro", "Financeiro: gestão de salões de beleza no GlowVitta."), component: Financeiro });

const schema = z.object({
  tipo: z.enum(["receita", "despesa"]),
  descricao: z.string().min(2),
  valor: z.coerce.number().positive(),
  categoria: z.string().optional(),
  data: z.string(),
  forma_pagamento: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Financeiro() {
  const { salaoId } = useSalao();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const f = (d: Date) => format(d, "yyyy-MM-dd");
  const [preset, setPreset] = useState("mes");
  const [custom, setCustom] = useState({ start: f(startOfMonth(new Date())), end: f(endOfMonth(new Date())) });
  const now = new Date();
  const ranges: Record<string, { start: string; end: string; label: string }> = {
    mes: { start: f(startOfMonth(now)), end: f(endOfMonth(now)), label: "Mês atual" },
    anterior: { start: f(startOfMonth(subMonths(now, 1))), end: f(endOfMonth(subMonths(now, 1))), label: "Mês anterior" },
    d90: { start: f(subDays(now, 89)), end: f(now), label: "Últimos 90 dias" },
    ano: { start: f(startOfYear(now)), end: f(now), label: "Este ano" },
    custom: { ...custom, label: "Personalizado" },
  };
  const mStart = ranges[preset].start;
  const mEnd = ranges[preset].end;

  const { data: lancamentos } = useQuery({
    queryKey: ["lancamentos", salaoId, mStart, mEnd],
    enabled: !!salaoId,
    queryFn: async () => (await supabase.from("lancamento").select("*").eq("company_id", salaoId!).gte("data", mStart).lte("data", mEnd).order("data", { ascending: false })).data ?? [],
  });

  const receitas = (lancamentos ?? []).filter((l: any) => l.tipo === "receita").reduce((a: number, l: any) => a + Number(l.valor), 0);
  const despesas = (lancamentos ?? []).filter((l: any) => l.tipo === "despesa").reduce((a: number, l: any) => a + Number(l.valor), 0);

  const save = useMutation({
    mutationFn: async (v: Form) => {
      const { error } = await supabase.from("lancamento").insert({ ...v, company_id: salaoId! });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Lançamento salvo"); qc.invalidateQueries({ queryKey: ["lancamentos"] }); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("lancamento").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["lancamentos"] }); },
  });

  return (
    <div>
      <PageHeader title="Financeiro" description="Receitas, despesas e retorno do período escolhido" action={<NewButton label="Novo lançamento" onClick={() => setOpen(true)} />} />
      <div className="mb-6 flex flex-wrap items-end gap-2">
        {Object.entries(ranges).map(([k, r]) => <Button key={k} size="sm" variant={preset === k ? "default" : "outline"} onClick={() => setPreset(k)}>{r.label}</Button>)}
        {preset === "custom" && <div className="flex flex-wrap items-center gap-2">
          <Input type="date" className="w-auto" value={custom.start} onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))} />
          <span className="text-sm text-muted-foreground">até</span>
          <Input type="date" className="w-auto" value={custom.end} onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))} />
        </div>}
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Kpi label="Receitas" value={receitas} icon={TrendingUp} color="text-emerald-600" />
        <Kpi label="Despesas" value={despesas} icon={TrendingDown} color="text-destructive" />
        <Kpi label="Saldo" value={receitas - despesas} icon={Wallet} color="text-primary" />
      </div>
      {salaoId && <CustoRetorno salaoId={salaoId} mStart={mStart} mEnd={mEnd} despesasList={(lancamentos ?? []).filter((l: any) => l.tipo === "despesa")} />}
      {salaoId && <ConsultorFinanceiro salaoId={salaoId} start={mStart} end={mEnd} />}
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {(lancamentos ?? []).map((l: any) => (
              <TableRow key={l.id}>
                <TableCell>{format(new Date(l.data), "dd/MM")}</TableCell>
                <TableCell><Badge variant={l.tipo === "receita" ? "default" : "destructive"}>{l.tipo}</Badge></TableCell>
                <TableCell>{l.descricao}</TableCell>
                <TableCell className="text-muted-foreground">{l.categoria}</TableCell>
                <TableCell className="text-right font-medium">R$ {Number(l.valor).toFixed(2)}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => confirm("Remover?") && del.mutate(l.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {lancamentos?.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum lançamento neste período</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
      <FormDialog open={open} onOpenChange={setOpen} title="Novo lançamento">
        <LancForm onSubmit={(v) => save.mutate(v)} loading={save.isPending} />
      </FormDialog>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent><div className={`text-2xl font-bold ${color}`}>R$ {value.toFixed(2)}</div></CardContent>
    </Card>
  );
}

function LancForm({ onSubmit, loading }: { onSubmit: (v: Form) => void; loading: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "receita", data: format(new Date(), "yyyy-MM-dd") },
  });
  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label>Tipo</Label>
        <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="receita">Receita</SelectItem><SelectItem value="despesa">Despesa</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Descrição</Label><Input {...register("descricao")} />{errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" {...register("valor")} /></div>
        <div className="space-y-2"><Label>Data</Label><Input type="date" {...register("data")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Categoria</Label>{watch("tipo") === "despesa" ? (
          <Select value={watch("categoria") || ""} onValueChange={(v) => setValue("categoria", v)}>
            <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
            <SelectContent>{CUSTO_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        ) : <Input {...register("categoria")} placeholder="Ex: Serviços" />}</div>
        <div className="space-y-2"><Label>Forma de pagamento</Label><Input {...register("forma_pagamento")} /></div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">Salvar</Button>
    </form>
  );
}
