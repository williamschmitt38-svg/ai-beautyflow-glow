import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Lock, TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const CUSTO_CATS = ["Materiais", "Produtos", "Divulgação", "Aluguel e estrutura", "Equipe", "Outros"];
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CustoRetorno({ salaoId, mStart, mEnd, despesasList }: { salaoId: string; mStart: string; mEnd: string; despesasList: any[] }) {
  const { data: plano } = useQuery({
    queryKey: ["salao-plano", salaoId],
    queryFn: async () => (await supabase.from("salao").select("plano").eq("id", salaoId).single()).data?.plano,
  });
  const unlocked = plano === "pro" || plano === "enterprise";
  const { data: receita = 0 } = useQuery({
    queryKey: ["retorno-atend", salaoId, mStart],
    enabled: unlocked,
    queryFn: async () => {
      const { data } = await supabase.from("agendamento").select("valor").eq("company_id", salaoId).in("status", ["confirmado", "concluido"]).gte("data", mStart).lte("data", mEnd);
      return (data ?? []).reduce((a, r: any) => a + Number(r.valor || 0), 0);
    },
  });

  if (plano === undefined) return null;
  if (!unlocked) return (
    <Card className="mb-6 border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Dashboard de Custos vs Retorno</h3>
        <p className="max-w-md text-sm text-muted-foreground">Veja quanto você gasta em materiais, produtos e divulgação e quanto isso retorna em atendimentos. Disponível nos planos Pro e Enterprise.</p>
        <Button asChild><Link to="/app/configuracoes" search={{ tab: "cobranca" } as any}>Fazer upgrade para o Pro</Link></Button>
      </CardContent>
    </Card>
  );

  const porCat: Record<string, number> = {};
  for (const l of despesasList) porCat[l.categoria || "Outros"] = (porCat[l.categoria || "Outros"] || 0) + Number(l.valor);
  const custo = Object.values(porCat).reduce((a, b) => a + b, 0);
  const lucro = receita - custo;
  const roi = custo > 0 ? (lucro / custo) * 100 : 0;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const max = Math.max(receita, custo, 1);

  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-lg font-semibold">Custo de operação vs Retorno</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Mini label="Retorno (atendimentos)" value={brl(receita)} icon={TrendingUp} />
        <Mini label="Custo de operação" value={brl(custo)} icon={TrendingDown} />
        <Mini label="Lucro real" value={brl(lucro)} icon={PiggyBank} accent={lucro >= 0 ? "text-primary" : "text-destructive"} />
        <Mini label="ROI / Margem" value={`${roi.toFixed(0)}% · ${margem.toFixed(0)}%`} icon={Percent} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm">Comparativo do mês</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Bar label="Retorno" value={receita} max={max} cls="bg-primary" />
            <Bar label="Custos" value={custo} max={max} cls="bg-destructive" />
            <p className="text-sm text-muted-foreground">{custo > 0 ? `Para cada R$ 1,00 gasto, voltaram ${brl(receita / custo)} em atendimentos.` : "Lance suas despesas para calcular o retorno."}</p>
          </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Gastos por categoria</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {cats.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma despesa neste mês.</p>}
            {cats.map(([c, v]) => <Bar key={c} label={`${c} · ${custo ? ((v / custo) * 100).toFixed(0) : 0}%`} value={v} max={custo} cls="bg-destructive/70" />)}
          </CardContent></Card>
      </div>
    </div>
  );
}

function Mini({ label, value, icon: Icon, accent = "" }: any) {
  return <Card><CardContent className="p-4"><div className="flex items-center justify-between text-xs text-muted-foreground">{label}<Icon className="h-4 w-4" /></div><div className={`mt-2 text-xl font-bold ${accent}`}>{value}</div></CardContent></Card>;
}
function Bar({ label, value, max, cls }: { label: string; value: number; max: number; cls: string }) {
  return <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-medium">{brl(value)}</span></div>
    <div className="h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${cls}`} style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%` }} /></div></div>;
}
