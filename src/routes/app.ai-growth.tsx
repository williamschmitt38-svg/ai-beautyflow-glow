import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateWhatsAppMessage } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Brain, Sparkles, Copy, TrendingUp, ChevronRight, MessageCircle, Lightbulb, Check, Wand2, Loader2, Lock } from "lucide-react";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSalao } from "@/hooks/useSalao";

export const Route = createFileRoute("/app/ai-growth")({
  head: () => pageHead("AI Growth", "Oportunidades reais de faturamento e mensagens prontas para WhatsApp no GlowVitta."),
  component: AIGrowth,
});

const severityMap = {
  alta: { label: "ALTA", color: "bg-rose-500/15 text-rose-600 border-rose-500/30" },
  media: { label: "MÉDIA", color: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  oportunidade: { label: "OPORTUNIDADE", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
} as const;

type Cli = { id: string; nome: string; telefone: string | null; chave?: string };
type Insight = {
  id: string; severity: keyof typeof severityMap; titulo: string; resumo: string;
  impacto: number; clientes: Cli[]; mensagem: string;
};

const DAY = 86400000;
const firstName = (n: string) => n.trim().split(/\s+/)[0] ?? n;

function waLink(tel: string | null, text: string) {
  let d = (tel ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.length <= 11) d = "55" + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

function AIGrowth() {
  const { salaoId } = useSalao();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-growth", salaoId],
    enabled: !!salaoId,
    queryFn: async () => {
      const [s, c, a, k] = await Promise.all([
        supabase.from("salao").select("nome_salao,plano").eq("id", salaoId!).maybeSingle(),
        supabase.from("cliente").select("id,nome,telefone,data_nascimento,ativo").eq("company_id", salaoId!).eq("ativo", true),
        supabase.from("agendamento").select("cliente_id,data,valor,status").eq("company_id", salaoId!).in("status", ["confirmado", "concluido"]),
        supabase.from("oportunidade_contato").select("cliente_id,chave").eq("company_id", salaoId!),
      ]);
      const sd = s.data as { nome_salao?: string; plano?: string } | null;
      return { salao: sd?.nome_salao ?? "nosso espaço", paid: sd?.plano === "pro" || sd?.plano === "enterprise", clientes: c.data ?? [], ags: a.data ?? [], contatos: new Set((k.data ?? []).map((r) => `${r.cliente_id}|${r.chave}`)) };
    },
  });

  const insights = useMemo<Insight[]>(() => {
    if (!data) return [];
    const now = Date.now();
    const stats = new Map<string, { last: number; total: number; n: number }>();
    for (const a of data.ags) {
      if (!a.cliente_id) continue;
      const t = new Date(a.data + "T12:00:00").getTime();
      if (t > now) continue;
      const s = stats.get(a.cliente_id) ?? { last: 0, total: 0, n: 0 };
      s.last = Math.max(s.last, t); s.total += Number(a.valor ?? 0); s.n++;
      stats.set(a.cliente_id, s);
    }
    const all = [...stats.values()];
    const ticket = all.length ? all.reduce((x, s) => x + s.total, 0) / Math.max(1, all.reduce((x, s) => x + s.n, 0)) : 0;
    const ltvs = all.map((s) => s.total).sort((a, b) => b - a);
    const vipCut = ltvs[Math.floor(ltvs.length * 0.2)] ?? Infinity;
    const cli = data.clientes as Array<Cli & { data_nascimento: string | null }>;
    const nm = data.salao;

    const vip = cli.filter((c) => { const s = stats.get(c.id); return s && s.total >= vipCut && s.total > 0 && now - s.last > 30 * DAY; });
    const vipIds = new Set(vip.map((c) => c.id));
    const inativos = cli.filter((c) => { const s = stats.get(c.id); return s && now - s.last > 45 * DAY && !vipIds.has(c.id); });
    const mes = new Date().getMonth() + 1;
    const aniv = cli.filter((c) => c.data_nascimento && Number(c.data_nascimento.slice(5, 7)) === mes);
    const nunca = cli.filter((c) => !stats.has(c.id));

    const yr = new Date().getFullYear();
    const tag = (list: typeof cli, key: (c: Cli) => string) => list.map((c) => ({ ...c, chave: key(c) })).filter((c) => !data.contatos.has(`${c.id}|${c.chave}`));
    const vipT = tag(vip, (c) => `vip-${stats.get(c.id)!.last}`);
    const inaT = tag(inativos, (c) => `inativo-${stats.get(c.id)!.last}`);
    const anivT = tag(aniv, () => `aniv-${yr}`);
    const nuncaT = tag(nunca, () => "nunca");
    vip.splice(0, vip.length, ...vipT); inativos.splice(0, inativos.length, ...inaT); aniv.splice(0, aniv.length, ...anivT); nunca.splice(0, nunca.length, ...nuncaT);
    const out: Insight[] = [];
    if (vip.length) out.push({ id: "vip", severity: "alta", titulo: `${vip.length} cliente(s) VIP sem voltar há +30 dias`, resumo: "Clientes que mais gastaram com você. Vale um convite especial.", impacto: Math.round(vip.reduce((x, c) => x + stats.get(c.id)!.total / stats.get(c.id)!.n, 0)), clientes: vip, mensagem: `Olá {nome}! ✨ Sentimos sua falta aqui no ${nm}. Separei um horário especial pra você essa semana — posso reservar?` });
    if (inativos.length) out.push({ id: "inativos", severity: "alta", titulo: `${inativos.length} cliente(s) inativo(s) há +45 dias`, resumo: "Uma mensagem carinhosa costuma trazer boa parte de volta.", impacto: Math.round(inativos.length * ticket), clientes: inativos, mensagem: `Oi {nome}! 💖 Faz um tempinho que não te vejo aqui no ${nm}. Temos horários livres essa semana, vem me visitar? 😊` });
    if (aniv.length) out.push({ id: "aniv", severity: "oportunidade", titulo: `${aniv.length} aniversariante(s) este mês`, resumo: "Um mimo de aniversário gera visita e carinho pela marca.", impacto: Math.round(aniv.length * ticket), clientes: aniv, mensagem: `Feliz aniversário, {nome}! 🎉 Para comemorar, o ${nm} preparou um presente especial no seu próximo atendimento. Vamos agendar?` });
    if (nunca.length) out.push({ id: "nunca", severity: "media", titulo: `${nunca.length} cliente(s) cadastrado(s) sem atendimento`, resumo: "Pessoas que já demonstraram interesse, mas ainda não vieram.", impacto: Math.round(nunca.length * ticket), clientes: nunca, mensagem: `Oi {nome}! Aqui é do ${nm} 🌸 Que tal marcar seu primeiro horário? Vou adorar te receber!` });
    return out;
  }, [data]);

  const total = insights.reduce((s, i) => s + i.impacto, 0);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
          <Brain className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">AI Growth Engine</h1>
          <p className="text-muted-foreground">Oportunidades encontradas nos seus clientes e atendimentos reais</p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950 text-white">
        <CardContent className="p-6">
          <div className="text-sm font-medium text-zinc-400">Receita potencial recuperável</div>
          <div className="mt-1 text-4xl font-black">R$ {total.toLocaleString("pt-BR")}</div>
          <div className="mt-1 text-xs text-zinc-500">{insights.length} oportunidade(s) identificada(s) agora</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="min-w-0 space-y-4">
          {isLoading && <Card><CardContent className="p-6 text-sm text-muted-foreground">Analisando seus clientes…</CardContent></Card>}
          {!isLoading && insights.length === 0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhuma oportunidade no momento. Conforme você cadastra clientes e confirma atendimentos, as sugestões aparecem aqui.</CardContent></Card>
          )}
          {insights.map((ins) => (
            <InsightCard key={ins.id} ins={ins} salaoId={salaoId!} paid={!!data?.paid} expanded={expanded === ins.id} onToggle={() => setExpanded(expanded === ins.id ? null : ins.id)} />
          ))}
        </div>
        <Card className="h-fit">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold"><Lightbulb className="h-4 w-4 text-primary" /> Como usar</div>
            <p className="text-muted-foreground">1. Abra uma oportunidade e ajuste a mensagem se quiser.</p>
            <p className="text-muted-foreground">2. Clique em <strong>WhatsApp</strong> ao lado de cada cliente: a conversa abre com o nome e o texto prontos.</p>
            <p className="text-muted-foreground">3. É só apertar enviar. Sem custo extra e sem risco para o seu número.</p>
            <p className="text-muted-foreground">4. Use <strong>IA</strong> para criar uma mensagem personalizada com o histórico do cliente (Pro e Enterprise).</p>
            <p className="text-muted-foreground">5. Clique em <strong>Contatado</strong> para tirar o cliente da lista. Ele volta só quando surgir uma nova oportunidade.</p>
            <p className="text-xs text-muted-foreground">Clientes sem telefone cadastrado aparecem sem o botão — complete o cadastro em Clientes.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightCard({ ins, salaoId, paid, expanded, onToggle }: { ins: Insight; salaoId: string; paid: boolean; expanded: boolean; onToggle: () => void }) {
  const s = severityMap[ins.severity];
  const [msg, setMsg] = useState(ins.mensagem);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const qc = useQueryClient();
  const gen = useServerFn(generateWhatsAppMessage);
  async function aiMsg(c: Cli) {
    setBusy("ai-" + c.id);
    try { const r = await gen({ data: { salaoId, clienteId: c.id, oportunidade: ins.titulo } }); setCustom((m) => ({ ...m, [c.id]: r.message })); toast.success("Mensagem personalizada pronta"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível gerar a mensagem."); }
    finally { setBusy(null); }
  }
  async function contatado(c: Cli) {
    setBusy("ok-" + c.id);
    const { error } = await supabase.from("oportunidade_contato").upsert({ company_id: salaoId, cliente_id: c.id, chave: c.chave! }, { onConflict: "company_id,cliente_id,chave", ignoreDuplicates: true });
    setBusy(null);
    if (error) return toast.error("Não foi possível marcar como contatado.");
    toast.success(`${firstName(c.nome)} marcado(a) como contatado(a)`);
    qc.invalidateQueries({ queryKey: ["ai-growth", salaoId] });
  }
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <UpgradeModal open={upgrade} onOpenChange={setUpgrade} message="A personalização de mensagens com Inteligência Artificial é exclusiva dos planos Pro e Enterprise. Desbloqueie agora para falar com suas clientes usando o histórico real de atendimentos!" />
      <CardContent className="p-0">
        <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={s.color}>{s.label}</Badge>
                {ins.impacto > 0 && <Badge variant="secondary"><TrendingUp className="mr-1 h-3 w-3" /> +R$ {ins.impacto.toLocaleString("pt-BR")}</Badge>}
              </div>
              <h3 className="font-bold leading-tight">{ins.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ins.resumo}</p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 shrink-0 text-muted-foreground transition ${expanded ? "rotate-90" : ""}`} />
        </button>
        {expanded && (
          <div className="space-y-4 border-t bg-muted/30 p-5">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mensagem ({"{nome}"} vira o primeiro nome do cliente)</div>
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="bg-background" />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { navigator.clipboard.writeText(msg); toast.success("Mensagem copiada"); }}>
                <Copy className="mr-2 h-3 w-3" /> Copiar
              </Button>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clientes ({ins.clientes.length})</div>
              <div className="divide-y rounded-xl border bg-background">
                {ins.clientes.map((c) => {
                  const text = custom[c.id] ?? msg.replaceAll("{nome}", firstName(c.nome));
                  const link = waLink(c.telefone, text);
                  return (
                    <div key={c.id} className="space-y-2 px-3 py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 truncate">{c.nome}</span>
                      <div className="flex flex-wrap items-center gap-1">
                      {paid ? <Button size="sm" variant="outline" disabled={!!busy} onClick={() => aiMsg(c)}>{busy === "ai-" + c.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Wand2 className="mr-1 h-3 w-3" />} IA</Button>
                        : <Button size="sm" variant="outline" onClick={() => setUpgrade(true)}><Lock className="mr-1 h-3 w-3" /> IA <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] font-bold text-primary">PRO</span></Button>}
                      <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => contatado(c)}><Check className="mr-1 h-3 w-3" /> Contatado</Button>
                      {link ? (
                        <Button asChild size="sm" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-90">
                          <a href={link} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1 h-3 w-3" /> WhatsApp</a>
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">sem telefone</span>}
                      </div>
                    </div>
                    {custom[c.id] !== undefined && <Textarea rows={3} value={custom[c.id]} onChange={(e) => setCustom((m) => ({ ...m, [c.id]: e.target.value }))} className="bg-muted/30 text-sm" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
