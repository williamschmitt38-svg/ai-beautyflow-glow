import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, subMonths } from "date-fns";
import { Building2, DollarSign, TrendingDown, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/master/")({ component: Painel });

function Painel() {
  const { data } = useQuery({
    queryKey: ["master-painel"],
    queryFn: async () => {
      const { data: saloes } = await supabase.from("salao").select("id, plano, status_cobranca, valor_plano, created_at");
      const rows = saloes ?? [];
      const ativos = rows.filter((s) => s.status_cobranca === "ativo");
      const trials = rows.filter((s) => s.status_cobranca === "trial");
      const cancelados = rows.filter((s) => s.status_cobranca === "cancelado");
      const mrr = ativos.reduce((a, s) => a + Number(s.valor_plano ?? 0), 0);
      const churn = rows.length > 0 ? Math.round((cancelados.length / rows.length) * 1000) / 10 : 0;
      // Cadastros últimos 6 meses
      const byMonth: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const k = format(subMonths(startOfMonth(new Date()), i), "MMM/yy");
        byMonth[k] = 0;
      }
      rows.forEach((s) => {
        const k = format(new Date(s.created_at), "MMM/yy");
        if (k in byMonth) byMonth[k]++;
      });
      const cadastros = Object.entries(byMonth).map(([mes, qtd]) => ({ mes, qtd }));
      return { total: rows.length, ativos: ativos.length, trials: trials.length, cancelados: cancelados.length, mrr, churn, cadastros };
    },
  });

  const kpis = [
    { label: "Salões totais", value: data?.total ?? 0, icon: Building2 },
    { label: "Ativos", value: data?.ativos ?? 0, icon: Users },
    { label: "MRR", value: `R$ ${(data?.mrr ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Churn", value: `${data?.churn ?? 0}%`, icon: TrendingDown },
  ];

  return (
    <div>
      <PageHeader title="Painel master" description="Visão geral da plataforma" />
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Novos salões por mês</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72"><ResponsiveContainer><BarChart data={data?.cadastros ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="qtd" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </CardContent>
      </Card>
    </div>
  );
}
