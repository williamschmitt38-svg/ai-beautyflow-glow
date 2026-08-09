import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/app/relatorios")({ component: Relatorios });

const COLORS = ["hsl(var(--primary))", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#06b6d4"];

function Relatorios() {
  const { salaoId } = useSalao();

  const { data } = useQuery({
    queryKey: ["relatorios", salaoId],
    enabled: !!salaoId,
    queryFn: async () => {
      const start = format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd");
      const end = format(endOfMonth(new Date()), "yyyy-MM-dd");
      const { data: ag } = await supabase.from("agendamento").select("data, valor, servico_nome, profissional_nome, status").eq("company_id", salaoId!).gte("data", start).lte("data", end);
      const rows = ag ?? [];
      // Por mês
      const porMes: Record<string, number> = {};
      rows.filter((r) => r.status === "concluido").forEach((r) => {
        const k = format(new Date(r.data), "MMM/yy", { locale: ptBR });
        porMes[k] = (porMes[k] ?? 0) + Number(r.valor ?? 0);
      });
      const mensal = Object.entries(porMes).map(([mes, valor]) => ({ mes, valor }));
      // Top serviços
      const porServ: Record<string, number> = {};
      rows.forEach((r) => { porServ[r.servico_nome] = (porServ[r.servico_nome] ?? 0) + 1; });
      const servicos = Object.entries(porServ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
      // Top profissionais
      const porProf: Record<string, number> = {};
      rows.forEach((r) => { if (r.profissional_nome) porProf[r.profissional_nome] = (porProf[r.profissional_nome] ?? 0) + Number(r.valor ?? 0); });
      const profissionais = Object.entries(porProf).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([nome, valor]) => ({ nome, valor }));
      return { mensal, servicos, profissionais };
    },
  });

  return (
    <div>
      <PageHeader title="Relatórios" description="Visão dos últimos 6 meses" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Faturamento por mês</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72"><ResponsiveContainer><BarChart data={data?.mensal ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Serviços mais agendados</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72"><ResponsiveContainer><PieChart><Pie data={data?.servicos ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>{(data?.servicos ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer></div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Receita por profissional</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72"><ResponsiveContainer><BarChart data={data?.profissionais ?? []} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="nome" width={120} /><Tooltip /><Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0,4,4,0]} /></BarChart></ResponsiveContainer></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
