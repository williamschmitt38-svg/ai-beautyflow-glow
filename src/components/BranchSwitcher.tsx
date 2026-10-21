import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Lock, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpgradeModal } from "@/components/UpgradeModal";

export function BranchSwitcher() {
  const { user } = useAuth();
  const { saloes, salaoId, setSalaoId, refetch } = useSalao();
  const [novo, setNovo] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: planos } = useQuery({
    queryKey: ["saloes-planos", saloes.map((s) => s.id).join(",")],
    enabled: saloes.length > 0,
    queryFn: async () => (await supabase.from("salao").select("id, plano").in("id", saloes.map((s) => s.id))).data ?? [],
  });
  const enterprise = (planos ?? []).some((p) => p.plano === "enterprise");

  async function criar() {
    if (nome.trim().length < 2 || !user) return;
    setSaving(true);
    const { data: salao, error } = await supabase.from("salao").insert({
      nome_salao: nome.trim(), admin_email: user.email!, owner_email: user.email!, status: "ativo",
    }).select("id").single();
    if (error) { setSaving(false); return toast.error(error.message); }
    const { error: e2 } = await supabase.from("salao_user").insert({ salao_id: salao.id, user_id: user.id, email: user.email!, role: "owner" });
    setSaving(false);
    if (e2) return toast.error(e2.message);
    toast.success("Filial criada!");
    setNovo(false); setNome("");
    await refetch(); setSalaoId(salao.id);
  }

  return (
    <div className="space-y-1 px-2 pb-2 group-data-[collapsible=icon]:hidden">
      {saloes.length > 1 && (
        <Select value={salaoId ?? ""} onValueChange={setSalaoId}>
          <SelectTrigger className="h-8 text-xs"><Building2 className="mr-1 h-3 w-3" /><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>{saloes.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome_salao}</SelectItem>)}</SelectContent>
        </Select>
      )}
      <Button variant="ghost" size="sm" className="h-7 w-full justify-start text-xs" onClick={() => (enterprise ? setNovo(true) : setUpgrade(true))}>
        {enterprise ? <Plus className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}Adicionar filial
      </Button>
      <Dialog open={novo} onOpenChange={setNovo}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova filial</DialogTitle>
            <DialogDescription>A nova unidade usa o mesmo login. Ela começa com agenda, clientes e equipe próprios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2"><Label>Nome da unidade</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Clínica Moema" /></div>
          <Button onClick={criar} disabled={saving || nome.trim().length < 2}>{saving ? "Criando…" : "Criar filial"}</Button>
        </DialogContent>
      </Dialog>
      <UpgradeModal open={upgrade} onOpenChange={setUpgrade} badge="Exclusivo Enterprise" message="Gerencie várias unidades com um único login no plano Enterprise." />
    </div>
  );
}
