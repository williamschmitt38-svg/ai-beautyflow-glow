import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
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

export const Route = createFileRoute("/app/configuracoes")({ component: Configuracoes });

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
  const { salaoId } = useSalao();
  const qc = useQueryClient();

  const { data: salao } = useQuery({
    queryKey: ["salao", salaoId], enabled: !!salaoId,
    queryFn: async () => (await supabase.from("salao").select("*").eq("id", salaoId!).single()).data,
  });

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Configurações" description="Gerencie seu salão" />
      <Tabs defaultValue="salao">
        <TabsList>
          <TabsTrigger value="salao">Salão</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
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

        <TabsContent value="cobranca">
          {salao && <CobrancaTab salao={salao} onSaved={() => qc.invalidateQueries({ queryKey: ["salao"] })} />}
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

function AparenciaForm({ salao, onSaved }: any) {
  const [cor, setCor] = useState<string>(salao.cor_primaria);
  const [logo, setLogo] = useState<string>(salao.logo_url ?? "");
  const [loading, setLoading] = useState(false);
  async function save() {
    setLoading(true);
    const { error } = await supabase.from("salao").update({ cor_primaria: cor, logo_url: logo || null }).eq("id", salao.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Aparência atualizada"); onSaved();
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2"><Label>Cor primária</Label><div className="flex items-center gap-3"><Input type="color" value={cor} onChange={(e: any) => setCor(e.target.value)} className="h-10 w-20 p-1" /><Input value={cor} onChange={(e: any) => setCor(e.target.value)} className="max-w-xs" /></div></div>
      <div className="space-y-2"><Label>URL do logo</Label><Input value={logo} onChange={(e: any) => setLogo(e.target.value)} placeholder="https://…" /></div>
      <Button onClick={save} disabled={loading}>Salvar</Button>
    </div>
  );
}

function CobrancaTab({ salao, onSaved }: any) {
  const planoLabel = { starter: "R$ 39", pro: "R$ 79", enterprise: "R$ 149" } as any;
  const statusVar: any = { trial: "secondary", ativo: "default", suspenso: "destructive", cancelado: "outline" };
  async function alterarPlano(plano: "starter" | "pro" | "enterprise") {
    const valor = plano === "starter" ? 39 : plano === "pro" ? 79 : 149;
    const { error } = await supabase.from("salao").update({ plano, valor_plano: valor, status_cobranca: "ativo", trial_ate: null }).eq("id", salao.id);
    if (error) return toast.error(error.message);
    toast.success("Plano ativado (mock)"); onSaved();
  }
  async function estender() {
    const novo = format(addDays(new Date(), 14), "yyyy-MM-dd");
    const { error } = await supabase.from("salao").update({ trial_ate: novo, status_cobranca: "trial" }).eq("id", salao.id);
    if (error) return toast.error(error.message);
    toast.success("Trial estendido por 14 dias"); onSaved();
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Plano atual</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Plano:</span> <Badge>{salao.plano}</Badge> <span className="text-muted-foreground">{planoLabel[salao.plano]}/mês</span></div>
          <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span> <Badge variant={statusVar[salao.status_cobranca]}>{salao.status_cobranca}</Badge></div>
          {salao.trial_ate && <div><span className="text-muted-foreground">Trial até:</span> {format(new Date(salao.trial_ate), "dd/MM/yyyy")}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Alterar plano (mock)</CardTitle><CardDescription>Em produção, integração com gateway. Aqui apenas registra.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => alterarPlano("starter")}>Starter — R$ 39</Button>
          <Button onClick={() => alterarPlano("pro")}>Pro — R$ 79</Button>
          <Button variant="outline" onClick={() => alterarPlano("enterprise")}>Enterprise — R$ 149</Button>
          <Button variant="ghost" onClick={estender}>Estender trial +14d</Button>
        </CardContent>
      </Card>
    </div>
  );
}
