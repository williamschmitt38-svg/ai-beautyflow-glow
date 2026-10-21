import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Lock, Upload, Trash2, Webhook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeModal } from "@/components/UpgradeModal";
import { testSalonWebhook } from "@/lib/webhook.functions";

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ["image/png", "image/jpeg", "image/webp"];

function readSize(file: File): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { res({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(img.src); };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export function AparenciaForm({ salao, onSaved }: { salao: any; onSaved: () => void }) {
  const enterprise = salao.plano === "enterprise";
  const [cor, setCor] = useState<string>(salao.cor_primaria);
  const [logo, setLogo] = useState<string>(salao.logo_url ?? "");
  const [semMarca, setSemMarca] = useState<boolean>(!!salao.remover_marca);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    if (!TIPOS.includes(file.type)) return toast.error("Envie PNG, JPG ou WebP.");
    if (file.size > MAX_BYTES) return toast.error("A imagem deve ter até 5 MB.");
    const { w, h } = await readSize(file);
    if (w < 250 || h < 250) return toast.error(`Imagem pequena (${w}×${h}). Mínimo 250×250 px.`);
    if (Math.abs(w / h - 1) > 0.1) toast.warning("Sua logo não é quadrada; ela será recortada em círculo.");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${salao.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("salon-logos").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: signed, error: es } = await supabase.storage.from("salon-logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setUploading(false);
    if (es || !signed) return toast.error(es?.message ?? "Falha ao gerar link da imagem.");
    setLogo(signed.signedUrl);
    toast.success("Logo carregada. Clique em Salvar.");
  }

  async function save() {
    setLoading(true);
    const payload: any = { cor_primaria: cor, logo_url: logo || null };
    if (enterprise) payload.remover_marca = semMarca;
    const { error } = await supabase.from("salao").update(payload).eq("id", salao.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Aparência atualizada"); onSaved();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2"><Label>Cor primária</Label><div className="flex items-center gap-3"><Input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="h-10 w-20 p-1" /><Input value={cor} onChange={(e) => setCor(e.target.value)} className="max-w-xs" /></div></div>

      <div className="space-y-2">
        <Label>Logo do salão</Label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {logo ? <img src={logo} alt="Logo" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Sem logo</span>}
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">Envie sua logo <strong>quadrada (500 × 500 px)</strong> em PNG, JPG ou WebP de até 5 MB. Mínimo 250 × 250 px.</p>
            <div className="flex gap-2">
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}><Upload className="mr-1 h-4 w-4" />{uploading ? "Enviando…" : "Escolher imagem"}</Button>
              {logo && <Button type="button" variant="ghost" size="sm" onClick={() => setLogo("")}><Trash2 className="mr-1 h-4 w-4" />Remover</Button>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-medium">Remover marca GlowVitta {!enterprise && <Lock className="h-4 w-4 text-muted-foreground" />}</div>
          <p className="text-sm text-muted-foreground">Sua página de agendamento mostra só sua logo e seu nome, sem menção ao GlowVitta. Exclusivo Enterprise.</p>
        </div>
        <Switch checked={enterprise && semMarca} onCheckedChange={(v) => (enterprise ? setSemMarca(v) : setUpgrade(true))} />
      </div>

      <Button onClick={save} disabled={loading || uploading}>Salvar</Button>
      <UpgradeModal open={upgrade} onOpenChange={setUpgrade} badge="Exclusivo Enterprise" message="O White-label é exclusivo do plano Enterprise. Apresente o agendamento 100% com a marca do seu espaço!" />
    </div>
  );
}

export function IntegracoesTab({ salao, onSaved }: { salao: any; onSaved: () => void }) {
  const enterprise = salao.plano === "enterprise";
  const [url, setUrl] = useState<string>(salao.webhook_url ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const test = useServerFn(testSalonWebhook);

  async function save() {
    if (!enterprise) return setUpgrade(true);
    if (url && !/^https:\/\/.+/i.test(url)) return toast.error("Use uma URL começando com https://");
    setSaving(true);
    const { error } = await supabase.from("salao").update({ webhook_url: url || null }).eq("id", salao.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Integração salva"); onSaved();
  }
  async function runTest() {
    if (!enterprise) return setUpgrade(true);
    setTesting(true);
    try {
      const r = await test({ data: { salaoId: salao.id } });
      r.ok ? toast.success(`Teste enviado (resposta ${r.status})`) : toast.error(`O endereço não respondeu (${r.status || "sem resposta"})`);
    } catch (e: any) { toast.error(e.message); } finally { setTesting(false); }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" />Integrações {!enterprise && <Lock className="h-4 w-4 text-muted-foreground" />}</CardTitle>
        <CardDescription>Envie cada novo agendamento online para Make, Zapier, n8n ou seu CRM. Exclusivo Enterprise.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>URL do webhook</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hook.make.com/…" disabled={!enterprise} />
          <p className="text-xs text-muted-foreground">Enviamos os dados da cliente, serviço, profissional, data, hora e valor sempre que um agendamento é criado pela sua página.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving}>Salvar</Button>
          <Button variant="outline" onClick={runTest} disabled={testing}>{testing ? "Enviando…" : "Enviar teste"}</Button>
        </div>
        <UpgradeModal open={upgrade} onOpenChange={setUpgrade} badge="Exclusivo Enterprise" message="Integrações com Make, Zapier e CRMs são exclusivas do plano Enterprise." />
      </CardContent>
    </Card>
  );
}
