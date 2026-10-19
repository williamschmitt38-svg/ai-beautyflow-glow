import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DIAS, normalizeSemana, type Semana } from "@/lib/agenda";

export function HorariosSalao({ salao }: { salao: any }) {
  const qc = useQueryClient();
  const [semana, setSemana] = useState<Semana>(() => normalizeSemana(salao.horarios_funcionamento));
  useEffect(() => setSemana(normalizeSemana(salao.horarios_funcionamento)), [salao.horarios_funcionamento]);

  const salvar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("salao").update({ horarios_funcionamento: semana as any }).eq("id", salao.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Expediente salvo"); qc.invalidateQueries({ queryKey: ["salao"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (k: string, p: Partial<Semana[string]>) => setSemana((s) => ({ ...s, [k]: { ...s[k], ...p } }));
  const aplicarUteis = () => {
    const seg = semana["1"];
    setSemana((s) => { const n = { ...s }; for (const k of ["1", "2", "3", "4", "5"]) n[k] = { ...seg }; return n; });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expediente semanal</CardTitle>
          <CardDescription>Horário padrão do salão. Profissionais com "Seguir horário do salão" usam estes horários.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 0].map((i) => {
            const k = String(i); const d = semana[k];
            return (
              <div key={k} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <div className="flex w-36 items-center gap-2">
                  <Switch checked={d.aberto} onCheckedChange={(v) => set(k, { aberto: v })} />
                  <span className="text-sm font-medium">{DIAS[i]}</span>
                </div>
                {d.aberto ? (
                  <div className="flex items-center gap-2">
                    <Input type="time" className="w-28" value={d.inicio} onChange={(e) => set(k, { inicio: e.target.value })} />
                    <span className="text-sm text-muted-foreground">até</span>
                    <Input type="time" className="w-28" value={d.fim} onChange={(e) => set(k, { fim: e.target.value })} />
                  </div>
                ) : <span className="text-sm text-muted-foreground">Fechado</span>}
                {d.aberto && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Switch checked={!!d.pausa} onCheckedChange={(v) => set(k, { pausa: v })} />
                    <span className="text-sm text-muted-foreground">Almoço</span>
                    {d.pausa && (<>
                      <Input type="time" className="w-28" value={d.pausa_inicio ?? "12:00"} onChange={(e) => set(k, { pausa_inicio: e.target.value })} />
                      <span className="text-sm text-muted-foreground">até</span>
                      <Input type="time" className="w-28" value={d.pausa_fim ?? "13:00"} onChange={(e) => set(k, { pausa_fim: e.target.value })} />
                    </>)}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={aplicarUteis}>Copiar segunda para todos os dias úteis</Button>
            <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>Salvar expediente</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dias fechados e feriados</CardTitle>
          <CardDescription>Nestas datas ninguém poderá agendar no salão.</CardDescription>
        </CardHeader>
        <CardContent><BloqueiosLista salaoId={salao.id} profissionalId={null} /></CardContent>
      </Card>
    </div>
  );
}

export function BloqueiosLista({ salaoId, profissionalId }: { salaoId: string; profissionalId: string | null }) {
  const qc = useQueryClient();
  const [data, setData] = useState("");
  const [motivo, setMotivo] = useState("");
  const key = ["bloqueios", salaoId, profissionalId];
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: lista } = useQuery({
    queryKey: key,
    queryFn: async () => {
      let q = supabase.from("agenda_bloqueio").select("*").eq("company_id", salaoId).gte("data", hoje).order("data");
      q = profissionalId ? q.eq("profissional_id", profissionalId) : q.is("profissional_id", null);
      const { data, error } = await q; if (error) throw error; return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("Escolha a data");
      const { error } = await supabase.from("agenda_bloqueio").insert({ company_id: salaoId, profissional_id: profissionalId, data, motivo: motivo || null });
      if (error) throw error;
    },
    onSuccess: () => { setData(""); setMotivo(""); toast.success("Data bloqueada"); qc.invalidateQueries({ queryKey: key }); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("agenda_bloqueio").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1"><Label className="text-xs">Data</Label><Input type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} className="w-40" /></div>
        <div className="min-w-0 flex-1 space-y-1"><Label className="text-xs">Motivo (opcional)</Label><Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={profissionalId ? "Ex.: Folga, férias, congresso" : "Ex.: Feriado, reforma"} /></div>
        <Button type="button" onClick={() => add.mutate()} disabled={add.isPending}><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
      </div>
      {(lista ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhuma data bloqueada.</p>}
      {(lista ?? []).map((b: any) => (
        <div key={b.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span>{new Date(b.data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}{b.motivo ? ` — ${b.motivo}` : ""}</span>
          <Button type="button" size="sm" variant="ghost" onClick={() => del.mutate(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      ))}
    </div>
  );
}
