import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar, DollarSign, Users, TrendingUp, Package, Repeat, Percent, Cake,
  Brain, AlertCircle, Gift, Sparkles, ChevronRight, Zap,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDashboardKpis } from "@/lib/demo-seed";
import { demoKpis, demoReceitaMensal, demoAgendamentosHoje, demoServicosTop, demoAniversariantesSemana } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/dashboard")({ component: DemoDashboard });

const PIE_COLORS = ["#F43F5E", "#EC4899", "#8B5CF6", "#10B981", "#F59E0B"];

const statusBadge: Record<string, string> = {
  agendado: "bg-slate-500/15 text-slate-700 border-slate-500/30",
  confirmado: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  chegou: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  em_atendimento: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  concluido: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  cancelado: "bg-rose-500/15 text-rose-700 border-rose-500/30",
};

function DemoDashboard() {
  const d = demoDashboardKpis();

  const alertas = [
    { color: "from-rose-500/10 to-rose-500/0 border-rose-500/30", icon: AlertCircle, iconBg: "bg-rose-500 text-white", title: "8 clientes VIP sem retorno há +30 dias", desc: "Reativar pode gerar +R$ 2.800", cta: "Ver insights" },
    { color: "from-amber-500/10 to-amber-500/0 border-amber-500/30", icon: Calendar, iconBg: "bg-amber-500 text-white", title: "Terças 14h-16h: 3 slots vagos esta semana", desc: "Padrão semanal de baixa ocupação", cta: "Criar promo" },
    { color: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/30", icon: Sparkles, iconBg: "bg-emerald-500 text-white", title: "Patrícia confirmou Pacote Facial Premium", desc: "+R$ 1.500 fechado agora", cta: "Ver pacote" },
    { color: "from-purple-500/10 to-purple-500/0 border-purple-500/30", icon: Cake, iconBg: "bg-purple-500 text-white", title: "12 aniversariantes este mês", desc: "Enviar mensagem com 20% off", cta: "Disparar" },
  ];

  const kpis = [
    { label: "Agendamentos hoje", value: demoKpis.agendamentosHoje, delta: "+3 vs ontem", icon: Calendar },
    { label: "Receita do mês", value: `R$ ${demoKpis.receitaMes.toLocaleString("pt-BR")}`, delta: "+12% vs anterior", icon: DollarSign },
    { label: "Clientes ativos", value: demoKpis.clientesAtivos, delta: "+18 este mês", icon: Users },
    { label: "Taxa de retorno", value: `${demoKpis.taxaRetorno}%`, delta: "+5%", icon: Repeat },
    { label: "Ticket médio", value: `R$ ${demoKpis.ticketMedio}`, delta: "+8%", icon: TrendingUp },
    { label: "Pacotes ativos", value: demoKpis.pacotesAtivos, delta: "8 vencendo", icon: Package },
    { label: "No-show", value: `${demoKpis.noShowRate}%`, delta: "-2%", icon: AlertCircle },
    { label: "Ocupação", value: `${demoKpis.taxaOcupacao}%`, delta: "Acima da meta", icon: Percent },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Studio Beleza Excellence — Visão executiva em tempo real</p>
      </div>

      {/* Alertas IA */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {alertas.map((a) => (
          <div key={a.title} className={`rounded-xl border bg-gradient-to-br ${a.color} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.iconBg} shadow-sm`}>
                <a.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
                <Link to="/demo/dashboard" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:underline">
                  {a.cta} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                  <k.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black">{k.value}</div>
              <div className="mt-1 text-xs text-emerald-600">{k.delta}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">Receita mensal — últimos 6 meses</h3>
                <p className="text-xs text-muted-foreground">Curva de crescimento acelerada</p>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">+38% YTD</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={demoReceitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Bar dataKey="receita" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold">AI Growth</h3>
                <p className="text-xs text-zinc-400">5 oportunidades ativas</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { tag: "ALTA", color: "text-rose-300", title: "8 inativos +45d", val: "+R$ 2.8k" },
                { tag: "OPP", color: "text-emerald-300", title: "Pacote facial 60%", val: "+R$ 8.4k" },
                { tag: "MED", color: "text-amber-300", title: "Terças 14h-16h", val: "+R$ 1.2k" },
              ].map((i) => (
                <div key={i.title} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`border-white/20 bg-transparent text-[10px] ${i.color}`}>{i.tag}</Badge>
                    <span className="text-sm text-zinc-200">{i.title}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{i.val}</span>
                </div>
              ))}
            </div>
            <Link to="/demo/ai-growth">
              <Button className="mt-4 w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90">
                <Zap className="mr-2 h-4 w-4" /> Abrir AI Growth
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Próximos atendimentos */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Agendamentos de hoje</h3>
              <p className="text-xs text-muted-foreground">{demoAgendamentosHoje.length} agendamentos · Receita potencial R$ {demoAgendamentosHoje.reduce((s,a) => s+a.valor, 0).toLocaleString("pt-BR")}</p>
            </div>
            <Link to="/demo/agendamentos"><Button variant="outline" size="sm">Ver agenda completa</Button></Link>
          </div>
          <div className="divide-y">
            {demoAgendamentosHoje.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-14 text-sm font-bold">{a.hora}</div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${a.profCor}, ${a.profCor}cc)` }}>
                  {a.cliente[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{a.cliente}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{a.servico}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: a.profCor }} />
                      {a.profissional}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className={statusBadge[a.status] ?? statusBadge.agendado}>{a.status.replace("_", " ")}</Badge>
                <div className="w-20 text-right text-sm font-semibold">R$ {a.valor}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pie + Aniversariantes + Pacotes vencendo */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-bold">Top 5 serviços</h3>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={demoServicosTop} dataKey="total" nameKey="nome" outerRadius={75}>
                    {demoServicosTop.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Cake className="h-4 w-4 text-rose-500" />
              <h3 className="font-bold">Aniversariantes da semana</h3>
            </div>
            <div className="space-y-2.5">
              {demoAniversariantesSemana.map((c) => (
                <div key={c.nome} className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-xs font-bold text-white">{c.nome[0]}</div>
                    <div>
                      <div className="text-sm font-semibold">{c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.data} · {c.idade} anos</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs"><Gift className="mr-1 h-3 w-3" /> Mensagem</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold">Pacotes vencendo</h3>
            </div>
            <div className="space-y-2.5">
              {d.pacotesVencendo.map((p) => (
                <div key={p.id} className="rounded-lg border p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.cliente_nome}</span>
                    <Badge variant="outline" className="text-[10px]">{p.sessoes_usadas}/{p.total_sessoes}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.pacote_nome}</div>
                  <div className="mt-1 text-xs text-amber-600">Vence em {Math.max(0, Math.ceil((new Date(p.data_validade).getTime() - Date.now()) / 86400000))} dias</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
