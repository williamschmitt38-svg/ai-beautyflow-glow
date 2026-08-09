import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import {
  Calendar, DollarSign, Users, TrendingUp, Package, Repeat,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { salaoId } = useSalao();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data } = useQuery({
    queryKey: ["dashboard", salaoId, today],
    enabled: !!salaoId,
    queryFn: async () => {
      const [hoje, semana, mes, clientes, pacotes] = await Promise.all([
        supabase.from("agendamento").select("id, hora, cliente_nome, servico_nome, profissional_nome, status")
          .eq("company_id", salaoId!).eq("data", today).order("hora"),
        supabase.from("agendamento").select("id", { count: "exact", head: true })
          .eq("company_id", salaoId!).gte("data", weekAgo).lte("data", today),
        supabase.from("agendamento").select("data, valor, status, servico_nome, profissional_nome")
          .eq("company_id", salaoId!).gte("data", monthStart).lte("data", monthEnd),
        supabase.from("cliente").select("id", { count: "exact", head: true })
          .eq("company_id", salaoId!).eq("ativo", true),
        supabase.from("pacote_cliente").select("id", { count: "exact", head: true })
          .eq("company_id", salaoId!).eq("status", "ativo"),
      ]);
      const concluidos = (mes.data ?? []).filter((a) => a.status === "concluido");
      const faturamento = concluidos.reduce((s, a) => s + Number(a.valor ?? 0), 0);
      const ticketMedio = concluidos.length ? faturamento / concluidos.length : 0;

      const byDay: Record<string, number> = {};
      (mes.data ?? []).forEach((a) => {
        if (a.status === "concluido") byDay[a.data] = (byDay[a.data] ?? 0) + Number(a.valor ?? 0);
      });
      const chart = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b))
        .map(([d, v]) => ({ data: d.slice(8), valor: v }));

      const bySrv: Record<string, number> = {};
      concluidos.forEach((a) => { bySrv[a.servico_nome] = (bySrv[a.servico_nome] ?? 0) + 1; });
      const topServicos = Object.entries(bySrv).sort(([, a], [, b]) => b - a).slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      const byProf: Record<string, number> = {};
      concluidos.forEach((a) => { byProf[a.profissional_nome ?? "—"] = (byProf[a.profissional_nome ?? "—"] ?? 0) + Number(a.valor ?? 0); });
      const topProfissionais = Object.entries(byProf).sort(([, a], [, b]) => b - a).slice(0, 5)
        .map(([nome, valor]) => ({ nome: nome.split(" ")[0], valor }));

      return {
        agendamentosHoje: hoje.data?.length ?? 0,
        agendamentosSemana: semana.count ?? 0,
        faturamentoMes: faturamento,
        ticketMedio,
        clientes: clientes.count ?? 0,
        pacotesAtivos: pacotes.count ?? 0,
        chart, topServicos, topProfissionais,
        proximosHoje: (hoje.data ?? []).filter((a) => a.status !== "cancelado").slice(0, 6),
      };
    },
  });

  const kpis = [
    { label: "Agendamentos hoje", value: data?.agendamentosHoje ?? 0, icon: Calendar },
    { label: "Agendamentos 7 dias", value: data?.agendamentosSemana ?? 0, icon: TrendingUp },
    { label: "Faturamento mês", value: `R$ ${(data?.faturamentoMes ?? 0).toFixed(2)}`, icon: DollarSign },
    { label: "Ticket médio", value: `R$ ${(data?.ticketMedio ?? 0).toFixed(2)}`, icon: Repeat },
    { label: "Clientes ativos", value: data?.clientes ?? 0, icon: Users },
    { label: "Pacotes ativos", value: data?.pacotesAtivos ?? 0, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu salão</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Faturamento no mês (por dia)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={data?.chart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="data" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top serviços</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data?.topServicos ?? []} dataKey="value" nameKey="name" outerRadius={80}>
                    {(data?.topServicos ?? []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top profissionais (faturamento)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={data?.topProfissionais ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="nome" stroke="var(--muted-foreground)" width={80} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="valor" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Próximos atendimentos hoje</CardTitle></CardHeader>
          <CardContent>
            {(data?.proximosHoje ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem atendimentos para hoje.</p>
            ) : (
              <ul className="divide-y">
                {data!.proximosHoje.map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{a.hora} — {a.cliente_nome}</p>
                      <p className="text-sm text-muted-foreground">{a.servico_nome} • {a.profissional_nome ?? "—"}</p>
                    </div>
                    <Badge variant={a.status === "confirmado" ? "default" : "secondary"}>{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
