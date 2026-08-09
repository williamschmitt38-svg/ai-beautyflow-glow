import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoDashboardKpis, demoLancamentos } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/financeiro")({ component: DemoFin });

function DemoFin() {
  const d = demoDashboardKpis();
  const receitas = demoLancamentos.filter((l) => l.tipo === "receita");
  const despesas = demoLancamentos.filter((l) => l.tipo === "despesa");

  const kpis = [
    { label: "Receitas do mês", value: `R$ ${d.receitaMes.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-emerald-600" },
    { label: "A receber", value: `R$ ${d.aReceber.toLocaleString("pt-BR")}`, icon: Wallet, color: "text-amber-600" },
    { label: "Despesas", value: `R$ ${d.despesasMes.toLocaleString("pt-BR")}`, icon: TrendingDown, color: "text-rose-600" },
    { label: "Lucro líquido", value: `R$ ${d.lucroMes.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">Receitas, despesas e lucro do salão</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <div className="mt-3 text-2xl font-black">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-bold">Receitas vs Despesas — últimos 6 meses</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={d.chartMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Legend />
                <Bar dataKey="receita" fill="#10B981" radius={[6,6,0,0]} name="Receita" />
                <Bar dataKey="despesa" fill="#F43F5E" radius={[6,6,0,0]} name="Despesa" />
                <Bar dataKey="lucro" fill="#8B5CF6" radius={[6,6,0,0]} name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rec">
        <TabsList>
          <TabsTrigger value="rec">Receitas ({receitas.length})</TabsTrigger>
          <TabsTrigger value="des">Despesas ({despesas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="rec">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Pagamento</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {receitas.slice(0, 40).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.data}</TableCell>
                    <TableCell className="text-sm">{l.descricao}</TableCell>
                    <TableCell><Badge variant="secondary">{l.categoria}</Badge></TableCell>
                    <TableCell className="text-sm">{l.forma_pagamento ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">R$ {l.valor.toLocaleString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="des">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
              <TableBody>
                {despesas.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.data}</TableCell>
                    <TableCell className="text-sm">{l.descricao}</TableCell>
                    <TableCell><Badge variant="outline">{l.categoria}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-rose-600">R$ {l.valor.toLocaleString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
