import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/onboarding")({ component: Onboarding });

const salaoSchema = z.object({
  nome_salao: z.string().min(2, "Mínimo 2 caracteres"),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  endereco: z.string().optional(),
});
const brandSchema = z.object({
  cor_primaria: z.string().default("#f43f5e"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/i, "Apenas letras, números e -"),
});
const profSchema = z.object({
  nome: z.string().min(2),
  especialidade: z.string().optional(),
});
const servSchema = z.object({
  nome: z.string().min(2),
  valor: z.coerce.number().min(0),
  duracao_minutos: z.coerce.number().min(15).default(60),
});

type State = {
  salao: z.infer<typeof salaoSchema> | null;
  brand: z.infer<typeof brandSchema> | null;
  prof: z.infer<typeof profSchema> | null;
  serv: z.infer<typeof servSchema> | null;
};

function Onboarding() {
  const { user } = useAuth();
  const { refetch, setSalaoId } = useSalao();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({ salao: null, brand: null, prof: null, serv: null });
  const [saving, setSaving] = useState(false);

  const steps = ["Dados", "Marca", "Equipe", "Primeiro serviço", "Confirmar"];

  async function finalize() {
    if (!state.salao || !state.brand) return;
    setSaving(true);
    try {
      const { data: salao, error } = await supabase.from("salao").insert({
        nome_salao: state.salao.nome_salao,
        admin_email: user!.email!,
        owner_email: user!.email!,
        telefone: state.salao.telefone || null,
        whatsapp: state.salao.whatsapp || null,
        endereco: state.salao.endereco || null,
        cor_primaria: state.brand.cor_primaria,
        slug: state.brand.slug.toLowerCase(),
        status: "ativo",
        status_cobranca: "trial",
        trial_ate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      }).select().single();
      if (error) throw error;

      const { error: e2 } = await supabase.from("salao_user").insert({
        salao_id: salao.id, user_id: user!.id, email: user!.email!, role: "owner", nome: user!.email!,
      });
      if (e2) throw e2;

      if (state.prof) {
        await supabase.from("profissional").insert({
          company_id: salao.id, nome: state.prof.nome, especialidade: state.prof.especialidade || null,
        });
      }
      if (state.serv) {
        await supabase.from("servico").insert({
          company_id: salao.id, nome: state.serv.nome, valor: state.serv.valor, duracao_minutos: state.serv.duracao_minutos,
        });
      }
      toast.success("Salão criado! Aproveite seu trial de 14 dias.");
      setSalaoId(salao.id);
      await refetch();
      nav({ to: "/app/dashboard" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold">Vamos configurar seu salão</span>
      </div>
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>Passo {step + 1} de {steps.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && <Step1 initial={state.salao} onNext={(v: any) => { setState({ ...state, salao: v }); setStep(1); }} />}
          {step === 1 && <Step2 initial={state.brand ?? { cor_primaria: "#f43f5e", slug: (state.salao?.nome_salao ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) }} onBack={() => setStep(0)} onNext={(v: any) => { setState({ ...state, brand: v }); setStep(2); }} />}
          {step === 2 && <Step3 initial={state.prof} onBack={() => setStep(1)} onSkip={() => { setState({ ...state, prof: null }); setStep(3); }} onNext={(v: any) => { setState({ ...state, prof: v }); setStep(3); }} />}
          {step === 3 && <Step4 initial={state.serv} onBack={() => setStep(2)} onSkip={() => { setState({ ...state, serv: null }); setStep(4); }} onNext={(v: any) => { setState({ ...state, serv: v }); setStep(4); }} />}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <p><b>Salão:</b> {state.salao?.nome_salao}</p>
                <p><b>Slug público:</b> /agendar/{state.brand?.slug}</p>
                <p><b>Cor primária:</b> <span style={{ color: state.brand?.cor_primaria }}>{state.brand?.cor_primaria}</span></p>
                <p><b>Trial:</b> 14 dias grátis</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                <Button onClick={finalize} disabled={saving} className="flex-1">{saving ? "Criando…" : "Criar salão e começar"}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Step1({ initial, onNext }: any) {
  const f = useForm({ resolver: zodResolver(salaoSchema), defaultValues: initial ?? {} });
  return (
    <form onSubmit={f.handleSubmit(onNext)} className="space-y-3">
      <div className="space-y-2"><Label>Nome do salão *</Label><Input {...f.register("nome_salao")} />{f.formState.errors.nome_salao && <p className="text-xs text-destructive">{String(f.formState.errors.nome_salao.message)}</p>}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Telefone</Label><Input {...f.register("telefone")} /></div>
        <div className="space-y-2"><Label>WhatsApp</Label><Input {...f.register("whatsapp")} /></div>
      </div>
      <div className="space-y-2"><Label>Endereço</Label><Input {...f.register("endereco")} /></div>
      <Button type="submit" className="w-full">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </form>
  );
}
function Step2({ initial, onBack, onNext }: any) {
  const f = useForm({ resolver: zodResolver(brandSchema), defaultValues: initial });
  return (
    <form onSubmit={f.handleSubmit(onNext)} className="space-y-3">
      <div className="space-y-2"><Label>Cor primária</Label><Input type="color" {...f.register("cor_primaria")} className="h-10 w-20 p-1" /></div>
      <div className="space-y-2"><Label>Slug público *</Label><Input {...f.register("slug")} placeholder="meu-salao" />{f.formState.errors.slug && <p className="text-xs text-destructive">{String(f.formState.errors.slug.message)}</p>}<p className="text-xs text-muted-foreground">Sua página pública: /agendar/{f.watch("slug")}</p></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button><Button type="submit" className="flex-1">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
    </form>
  );
}
function Step3({ initial, onBack, onSkip, onNext }: any) {
  const f = useForm({ resolver: zodResolver(profSchema), defaultValues: initial ?? {} });
  return (
    <form onSubmit={f.handleSubmit(onNext)} className="space-y-3">
      <p className="text-sm text-muted-foreground">Cadastre seu primeiro profissional (opcional).</p>
      <div className="space-y-2"><Label>Nome</Label><Input {...f.register("nome")} /></div>
      <div className="space-y-2"><Label>Especialidade</Label><Input {...f.register("especialidade")} placeholder="Ex: Cabeleireira" /></div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button><Button type="button" variant="ghost" onClick={onSkip}>Pular</Button><Button type="submit" className="flex-1">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
    </form>
  );
}
function Step4({ initial, onBack, onSkip, onNext }: any) {
  const f = useForm({ resolver: zodResolver(servSchema), defaultValues: initial ?? { duracao_minutos: 60 } });
  return (
    <form onSubmit={f.handleSubmit(onNext)} className="space-y-3">
      <p className="text-sm text-muted-foreground">Cadastre seu primeiro serviço (opcional).</p>
      <div className="space-y-2"><Label>Nome</Label><Input {...f.register("nome")} placeholder="Ex: Corte feminino" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" {...f.register("valor")} /></div>
        <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" {...f.register("duracao_minutos")} /></div>
      </div>
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button><Button type="button" variant="ghost" onClick={onSkip}>Pular</Button><Button type="submit" className="flex-1">Continuar <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
    </form>
  );
}
