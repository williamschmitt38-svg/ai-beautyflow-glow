import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SalonBilling } from "@/components/SalonBilling";
import { HorariosSalao } from "@/components/HorariosSalao";
import { AparenciaForm, IntegracoesTab } from "@/components/EnterpriseSettings";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Check, MessageCircle, QrCode, Instagram, Download } from "lucide-react";

export const Route = createFileRoute("/app/configuracoes")({
  validateSearch: (search: Record<string, unknown>) => ({ tab: typeof search.tab === "string" ? search.tab : "salao", payment: typeof search.payment === "string" ? search.payment : undefined }),
  head: () => ({ meta: [{ title: "Configurações e assinatura — GlowVitta" }, { name: "description", content: "Gerencie seu salão e sua assinatura GlowVitta." }, { property: "og:title", content: "Configurações e assinatura — GlowVitta" }, { property: "og:description", content: "Gerencie seu salão e sua assinatura GlowVitta." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Configuracoes,
});

const salaoSchema = z.object({
  nome_salao: z.string().min(2),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  endereco: z.string().optional(),
  admin_email: z.string().email(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/i).optional().or(z.literal("")),
});
type SalaoForm = z.infer<typeof salaoSchema>;

function Configuracoes() {
  const { user } = useAuth();
  const { tab } = Route.useSearch();
  const { salaoId } = useSalao();
  const qc = useQueryClient();

  const { data: salao } = useQuery({
    queryKey: ["salao", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("salao").select("*").eq("id", salaoId!).single()).data,
  });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Configurações" description="Gerencie seu salão" />
      <Tabs defaultValue={tab}>
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="salao">Salão</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="divulgacao">Divulgação</TabsTrigger>
          <TabsTrigger value="horarios">Horários & Folgas</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="salao">
          <Card>
            <CardHeader><CardTitle>Dados do salão</CardTitle><CardDescription>Informações cadastrais</CardDescription></CardHeader>
            <CardContent>{salao && <SalaoForm initial={salao} salaoId={salaoId!} onSaved={() => { qc.invalidateQueries({ queryKey: ["salao"] }); qc.invalidateQueries({ queryKey: ["my-saloes"] }); }} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader><CardTitle>Aparência</CardTitle><CardDescription>Personalize cores e logo</CardDescription></CardHeader>
            <CardContent>{salao && <AparenciaForm salao={salao} onSaved={() => qc.invalidateQueries({ queryKey: ["salao"] })} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divulgacao">
          {salao && <DivulgacaoTab salao={salao} />}
        </TabsContent>

        <TabsContent value="horarios">
          {salao && <HorariosSalao salao={salao} />}
        </TabsContent>

        <TabsContent value="integracoes">
          {salao && <IntegracoesTab salao={salao} onSaved={() => qc.invalidateQueries({ queryKey: ["salao"] })} />}
        </TabsContent>

        <TabsContent value="cobranca">
          {salao && <SalonBilling salao={salao} />}
        </TabsContent>

        <TabsContent value="perfil">
          <Card>
            <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
              <div><span className="text-muted-foreground">User ID:</span> <code className="text-xs">{user?.id}</code></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SalaoForm({ initial, salaoId, onSaved }: any) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SalaoForm>({
    resolver: zodResolver(salaoSchema), defaultValues: initial,
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (v) => {
      const { error } = await supabase.from("salao").update({ ...v, slug: v.slug || null }).eq("id", salaoId);
      if (error) return toast.error(error.message);
      toast.success("Salvo"); onSaved();
    })}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Nome do salão *</Label><Input {...register("nome_salao")} />{errors.nome_salao && <p className="text-xs text-destructive">{errors.nome_salao.message}</p>}</div>
        <div className="space-y-2"><Label>Nome fantasia</Label><Input {...register("nome_fantasia")} /></div>
        <div className="space-y-2"><Label>CNPJ</Label><Input {...register("cnpj")} /></div>
        <div className="space-y-2"><Label>Email admin *</Label><Input type="email" {...register("admin_email")} /></div>
        <div className="space-y-2"><Label>Telefone</Label><Input {...register("telefone")} /></div>
        <div className="space-y-2"><Label>WhatsApp</Label><Input {...register("whatsapp")} /></div>
      </div>
      <div className="space-y-2"><Label>Endereço</Label><Input {...register("endereco")} /></div>
      <div className="space-y-2"><Label>Slug público</Label><Input {...register("slug")} placeholder="meu-salao" /></div>
      <Button type="submit" disabled={isSubmitting}>Salvar</Button>
    </form>
  );
}

function DivulgacaoTab({ salao }: any) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  const slug: string | null = salao.slug || null;
  const nome = salao.nome_fantasia || salao.nome_salao;
  const url = slug ? `${origin}/agendar/${slug}` : "";

  const instaText = `✨ Agende seu horário na ${nome}!\n\nEscolha o serviço, o profissional e o horário pelo link — rápido e sem espera:\n👉 ${url}\n${salao.endereco ? `\n📍 ${salao.endereco}\n` : ""}\nTe esperamos! 💇‍♀️💅`;
  const waText = `Olá! Agende seu horário na ${nome} pelo link: ${url}`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(key);
    toast.success("Copiado!");
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadQr() {
    const canvas = document.getElementById("bf-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas || !slug) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-agendar-${slug}.png`;
    a.click();
    toast.success("QR Code baixado");
  }

  if (!slug) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link de agendamento</CardTitle>
          <CardDescription>Defina o slug público para ativar sua página de divulgação.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vá na aba <b>Salão</b> e preencha o campo <b>Slug público</b> (ex.: <code>meu-salao</code>). Depois volte aqui para copiar seu link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Copy className="h-4 w-4 text-primary" /> Seu link de agendamento</CardTitle>
          <CardDescription>Compartilhe com seus clientes por qualquer canal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input readOnly value={url} className="font-mono text-sm" onFocus={(e) => e.currentTarget.select()} />
            <Button onClick={() => copy(url, "link")} className="shrink-0">
              {copied === "link" ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied === "link" ? "Copiado" : "Copiar"}
            </Button>
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" /> Compartilhar no WhatsApp
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /> QR Code</CardTitle>
            <CardDescription>Imprima e cole na recepção, no espelho ou no vitrine.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="rounded-lg border bg-white p-3">
              <QRCodeCanvas id="bf-qr-canvas" value={url} size={160} includeMargin />
            </div>
            <Button variant="outline" onClick={downloadQr}>
              <Download className="mr-1 h-4 w-4" /> Baixar PNG
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Instagram className="h-4 w-4 text-primary" /> Texto para Instagram</CardTitle>
            <CardDescription>Cole na bio, nos stories ou no feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">{instaText}</div>
            <Button variant="outline" onClick={() => copy(instaText, "insta")}>
              {copied === "insta" ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied === "insta" ? "Copiado" : "Copiar texto"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
