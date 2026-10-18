import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeFinance } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const sugestoes = ["Onde estou gastando demais?", "Como aumentar minha margem de lucro?", "Vale a pena investir mais em divulgação?"];

export function ConsultorFinanceiro({ salaoId, start, end }: { salaoId: string; start: string; end: string }) {
  const { data: plano } = useQuery({
    queryKey: ["salao-plano", salaoId],
    queryFn: async () => (await supabase.from("salao").select("plano").eq("id", salaoId).single()).data?.plano,
  });
  const run = useServerFn(analyzeFinance);
  const [pergunta, setPergunta] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (plano === undefined) return null;
  const unlocked = plano === "pro" || plano === "enterprise";

  async function submit() {
    if (pergunta.trim().length < 3) return;
    setLoading(true); setError("");
    try { setAnswer((await run({ data: { salaoId, start, end, pergunta } })).answer); }
    catch (e) { setError(e instanceof Error ? e.message : "Não foi possível gerar a análise."); }
    finally { setLoading(false); }
  }

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Consultor financeiro com IA</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {!unlocked ? (
          <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Lock className="h-4 w-4" /> Pergunte sobre seus custos e lucro e receba uma análise prática. Disponível nos planos Pro e Enterprise.</p>
            <Button asChild size="sm"><Link to="/app/configuracoes" search={{ tab: "cobranca" } as any}>Fazer upgrade para o Pro</Link></Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Descreva sua dúvida. A análise usa os lançamentos e atendimentos confirmados do período selecionado acima.</p>
            <div className="flex flex-wrap gap-2">{sugestoes.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => setPergunta(s)}>{s}</Button>)}</div>
            <Textarea rows={3} value={pergunta} onChange={(e) => setPergunta(e.target.value)} placeholder="Ex: Meus custos com produtos estão altos? O que posso melhorar?" maxLength={1000} />
            <Button onClick={submit} disabled={loading || pergunta.trim().length < 3}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando…</> : "Gerar análise"}</Button>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {answer && <div className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{answer.replace(/\*\*/g, "")}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
