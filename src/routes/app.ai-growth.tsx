import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Brain, Sparkles, Send, Copy, Zap, MessageCircle, TrendingUp, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAIInsights, type AIInsight } from "@/lib/demo-seed";

export const Route = createFileRoute("/app/ai-growth")({ component: AIGrowth });

const severityMap = {
  alta: { label: "ALTA", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  media: { label: "MÉDIA", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  oportunidade: { label: "OPORTUNIDADE", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
} as const;

type Msg = { from: "ai" | "user"; text: string };

function AIGrowth() {
  const totalImpacto = demoAIInsights.reduce((s, i) => s + i.impacto_estimado, 0);
  const [expanded, setExpanded] = useState<string | null>(demoAIInsights[0]?.id ?? null);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ai", text: "Olá! Sou seu AI Growth Engine. Analisei o histórico e separei 5 oportunidades concretas pra você ao lado. Quer que eu detalhe alguma?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: "user", text: input }, { from: "ai", text: "Boa! Analisando seu pedido… (versão demonstração — em produção a IA executa via Lovable AI)" }]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
          <Brain className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">AI Growth Engine</h1>
          <p className="text-muted-foreground">Insights e ações concretas geradas a partir do seu histórico real</p>
        </div>
        <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">Beta</Badge>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <div className="text-sm font-medium text-zinc-400">Receita potencial recuperável</div>
            <div className="mt-1 text-4xl font-black">R$ {totalImpacto.toLocaleString("pt-BR")}</div>
            <div className="mt-1 text-xs text-zinc-500">{demoAIInsights.length} oportunidades identificadas esta semana</div>
          </div>
          <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90" onClick={() => toast.success("Demonstração — campanhas seriam disparadas via WhatsApp/Email")}>
            <Zap className="mr-2 h-4 w-4" /> Executar todas
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-4">
          {demoAIInsights.map((ins) => (
            <InsightCard key={ins.id} ins={ins} expanded={expanded === ins.id} onToggle={() => setExpanded(expanded === ins.id ? null : ins.id)} />
          ))}
        </div>

        <Card className="flex h-[640px] flex-col">
          <div className="border-b p-4">
            <div className="flex items-center gap-2 font-semibold"><MessageCircle className="h-4 w-4 text-primary" /> Chat com a IA</div>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "bg-muted"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte algo…" />
              <Button type="submit" size="icon" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
        <strong>Pendente (mock):</strong> integração real com Lovable AI Gateway para gerar mensagens dinâmicas, envio real via WhatsApp Business API e Email transacional.{" "}
        <Link to="/" className="text-primary underline">Conheça o roadmap</Link>
      </div>
    </div>
  );
}

function InsightCard({ ins, expanded, onToggle }: { ins: AIInsight; expanded: boolean; onToggle: () => void }) {
  const s = severityMap[ins.severity];
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <CardContent className="p-0">
        <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={s.color}>{s.label}</Badge>
                <Badge variant="secondary"><TrendingUp className="mr-1 h-3 w-3" /> +R$ {ins.impacto_estimado.toLocaleString("pt-BR")}</Badge>
              </div>
              <h3 className="font-bold leading-tight">{ins.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ins.resumo}</p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 shrink-0 text-muted-foreground transition ${expanded ? "rotate-90" : ""}`} />
        </button>
        {expanded && (
          <div className="space-y-4 border-t bg-muted/30 p-5">
            {ins.clientes_amostra && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clientes ({ins.quantidade})</div>
                <div className="flex flex-wrap gap-1.5">
                  {ins.clientes_amostra.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
                </div>
              </div>
            )}
            {ins.mensagem_whatsapp && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensagem WhatsApp pronta</div>
                <div className="rounded-xl border bg-background p-4 text-sm italic">"{ins.mensagem_whatsapp}"</div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {ins.mensagem_whatsapp && (
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(ins.mensagem_whatsapp ?? ""); toast.success("Mensagem copiada"); }}>
                  <Copy className="mr-2 h-3 w-3" /> Copiar
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => toast.success("Gerando variação com IA…")}>
                <Sparkles className="mr-2 h-3 w-3" /> Gerar com IA
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90" onClick={() => toast.success(`Ação "${ins.acao_texto}" enfileirada`)}>
                <Send className="mr-2 h-3 w-3" /> {ins.acao_texto}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
