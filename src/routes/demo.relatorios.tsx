import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { demoReceitaMensal, demoServicosTop, demoKpis } from "@/lib/demo-data";

export const Route = createFileRoute("/demo/relatorios")({ component: DemoRelatorios });

const PIE = ["#F43F5E", "#EC4899", "#8B5CF6", "#10B981", "#F59E0B"];

const ranking = [
  { nome: "Ana Carolina", atendimentos: 142, receita: 18900, comissao: 5670, nota: 4.9 },
  { nome: "Carla Mendes", atendimentos: 128, receita: 22100, comissao: 6630, nota: 4.8 },
  { nome: "Paula Souza", atendimentos: 165, receita: 12400, comissao: 3720, nota: 4.9 },
  { nome: "Beatriz Lima", atendimentos: 98, receita: 14200, comissao: 4260, nota: 4.7 },
  { nome: "Juliana Costa", atendimentos: 79, receita: 11500, comissao: 3450, nota: 4.8 },
];

const retencao = [
  { mes: "Out", retencao: 72 }, { mes: "Nov", retencao: 74 }, { mes: "Dez", retencao: 75 },
  { mes: "Jan", retencao: 76 }, { mes: "Fev", retencao: 77 }, { mes: "Mar", retencao: 78 },
];

function DemoRelatorios() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visão analítica de performance do salão</p>
        </div>
        <Button><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Receita período", v: `R$ ${demoKpis.receitaMes.toLocaleString("pt-BR")}`, i: DollarSign },
          { l: "Atendimentos", v: demoKpis.agendamentosMes, i: Calendar },
          { l: "Clientes ativos", v: demoKpis.clientesAtivos, i: Users },
          { l: "Crescimento MoM", v: "+12%", i: TrendingUp },
        ].map((k) => (
          <Card key={k.l}><CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.l}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white"><k.i className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-black">{k.v}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="p-6">
          <h3 className="mb-4 font-bold">Receita vs Despesa — 6 meses</h3>
          <div className="h-64"><ResponsiveContainer><BarChart data={demoReceitaMensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" /><YAxis />
            <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
            <Legend /><Bar dataKey="receita" fill="#F43F5E" radius={[6,6,0,0]} /><Bar dataKey="despesa" fill="#71717a" radius={[6,6,0,0]} />
          </BarChart></ResponsiveContainer></div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <h3 className="mb-4 font-bold">Top serviços</h3>
          <div className="h-64"><ResponsiveContainer><PieChart>
            <Pie data={demoServicosTop} dataKey="receita" nameKey="nome" outerRadius={80}>
              {demoServicosTop.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
            </Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart></ResponsiveContainer></div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-6">
        <h3 className="mb-4 font-bold">Taxa de retenção — 6 meses</h3>
        <div className="h-56"><ResponsiveContainer><LineChart data={retencao}>
          <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis domain={[60, 90]} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Line type="monotone" dataKey="retencao" stroke="#F43F5E" strokeWidth={3} dot={{ r: 5, fill: "#F43F5E" }} />
        </LineChart></ResponsiveContainer></div>
      </CardContent></Card>

      <Card><CardContent className="p-6">
        <h3 className="mb-4 font-bold">Ranking de profissionais</h3>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground">
            <th className="py-2">Profissional</th><th>Atendimentos</th><th>Receita gerada</th><th>Comissão</th><th>Nota</th>
          </tr></thead>
          <tbody>{ranking.map((r) => (
            <tr key={r.nome} className="border-b">
              <td className="py-3 font-semibold">{r.nome}</td>
              <td>{r.atendimentos}</td>
              <td>R$ {r.receita.toLocaleString("pt-BR")}</td>
              <td className="text-emerald-600 font-semibold">R$ {r.comissao.toLocaleString("pt-BR")}</td>
              <td><Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700">★ {r.nota}</Badge></td>
            </tr>
          ))}</tbody>
        </table></div>
      </CardContent></Card>
    </div>
  );
}
