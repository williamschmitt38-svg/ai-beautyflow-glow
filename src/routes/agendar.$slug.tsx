import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Sparkles, Check, ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, Scissors } from "lucide-react";
import { getPublicSalao, getAvailableSlots, createPublicAgendamento } from "@/lib/public-booking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/agendar/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Agendar online — ${params.slug}` }] }),
  component: AgendarPublic,
});

const clienteSchema = z.object({
  cliente_nome: z.string().min(2, "Informe seu nome"),
  cliente_telefone: z.string().min(8, "Telefone obrigatório"),
  cliente_email: z.string().email("Email inválido").optional().or(z.literal("")),
});
type ClienteForm = z.infer<typeof clienteSchema>;

const STEPS = [
  { n: 1, label: "Serviço", icon: Scissors },
  { n: 2, label: "Profissional", icon: User },
  { n: 3, label: "Data e horário", icon: CalIcon },
  { n: 4, label: "Seus dados", icon: User },
  { n: 5, label: "Confirmar", icon: Check },
];

function AgendarPublic() {
  const { slug } = Route.useParams();
  const fetchSalao = useServerFn(getPublicSalao);
  const fetchSlots = useServerFn(getAvailableSlots);
  const createAg = useServerFn(createPublicAgendamento);

  const [step, setStep] = useState(1);
  const [servicoId, setServicoId] = useState<string>("");
  const [profId, setProfId] = useState<string>("");
  const [data, setData] = useState<string>(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState<string>("");
  const [done, setDone] = useState<{ data: string; hora: string } | null>(null);

  const { data: salaoData, isLoading } = useQuery({
    queryKey: ["public-salao", slug],
    queryFn: () => fetchSalao({ data: { slug } }),
  });

  const { register, handleSubmit, getValues, formState: { errors, isValid } } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema), mode: "onChange",
  });

  const { data: slotsData, isFetching: loadingSlots } = useQuery({
    queryKey: ["slots", slug, profId, servicoId, data],
    queryFn: () => fetchSlots({ data: { slug, profissional_id: profId, servico_id: servicoId, data } }),
    enabled: step === 3 && !!profId && !!servicoId && !!data,
  });

  const mut = useMutation({
    mutationFn: (cliente: ClienteForm) => createAg({ data: { slug, servico_id: servicoId, profissional_id: profId, data, hora, ...cliente } }),
    onSuccess: (r: any) => {
      setDone({ data: r.agendamento.data, hora: r.agendamento.hora });
      toast.success("Agendamento confirmado!", { description: `Confirmação enviada por WhatsApp para ${getValues("cliente_telefone")}` });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!salaoData) return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Salão não encontrado</h1>
        <p className="text-muted-foreground">Verifique o link.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Ir para o início</Link>
      </div>
    </div>
  );

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-6 w-6" /></div>
            <CardTitle className="text-center">Agendamento confirmado</CardTitle>
            <CardDescription className="text-center">{format(new Date(done.data + "T00:00:00"), "dd/MM/yyyy")} às {done.hora}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
            <p>Você receberá uma confirmação em breve. Obrigado!</p>
            <Button variant="outline" onClick={() => { setDone(null); setStep(1); setServicoId(""); setProfId(""); setHora(""); }}>Novo agendamento</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedServico = salaoData.servicos.find((s: any) => s.id === servicoId);
  const selectedProf = salaoData.profissionais.find((p: any) => p.id === profId);
  const today = new Date().toISOString().slice(0, 10);

  const canNext =
    (step === 1 && !!servicoId) ||
    (step === 2 && !!profId) ||
    (step === 3 && !!hora) ||
    (step === 4 && isValid) ||
    step === 5;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{salaoData.salao.nome_fantasia || salaoData.salao.nome_salao}</div>
            {salaoData.salao.endereco && <div className="text-xs text-muted-foreground">{salaoData.salao.endereco}</div>}
          </div>
          <Link to="/pacotes/$slug" params={{ slug }}><Button variant="outline" size="sm">Ver pacotes</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Stepper */}
        <ol className="mb-8 flex items-center justify-between gap-2">
          {STEPS.map((s) => {
            const active = step === s.n;
            const completed = step > s.n;
            return (
              <li key={s.n} className="flex flex-1 items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${completed ? "bg-primary text-primary-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {completed ? <Check className="h-4 w-4" /> : s.n}
                </div>
                <span className={`hidden text-xs sm:inline ${active ? "font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
                {s.n < STEPS.length && <div className={`h-px flex-1 ${completed ? "bg-primary" : "bg-border"}`} />}
              </li>
            );
          })}
        </ol>

        {/* Step 1: Serviço */}
        {step === 1 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Escolha o serviço</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {salaoData.servicos.map((s: any) => {
                const active = servicoId === s.id;
                return (
                  <button type="button" key={s.id} onClick={() => setServicoId(s.id)}
                    className={`rounded-md border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <div className="flex items-center justify-between"><span className="font-medium">{s.nome}</span>{s.categoria && <Badge variant="secondary" className="text-[10px]">{s.categoria}</Badge>}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.duracao_minutos} min · R$ {Number(s.valor).toFixed(2)}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 2: Profissional */}
        {step === 2 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Escolha o profissional</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {salaoData.profissionais.map((p: any) => {
                const active = profId === p.id;
                return (
                  <button type="button" key={p.id} onClick={() => setProfId(p.id)}
                    className={`rounded-md border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-xs text-muted-foreground">{p.especialidade ?? "—"} · {p.hora_inicio}–{p.hora_fim}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 3: Data e horário */}
        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Escolha data e horário</h2>
            <div>
              <Label className="mb-1 block text-sm">Data</Label>
              <Input type="date" min={today} value={data} onChange={(e) => { setData(e.target.value); setHora(""); }} />
            </div>
            <div>
              <Label className="mb-2 block text-sm flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Horários disponíveis</Label>
              {loadingSlots && <p className="text-sm text-muted-foreground">Calculando disponibilidade…</p>}
              {!loadingSlots && slotsData?.slots.length === 0 && (
                <p className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">Sem horários disponíveis nessa data. Escolha outro dia.</p>
              )}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slotsData?.slots.map((h) => (
                  <button type="button" key={h} onClick={() => setHora(h)}
                    className={`rounded-md border px-2 py-2 text-sm transition ${hora === h ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Step 4: Dados */}
        {step === 4 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Seus dados</h2>
            <div className="space-y-1"><Label>Nome completo</Label><Input {...register("cliente_nome")} />{errors.cliente_nome && <p className="text-xs text-destructive">{errors.cliente_nome.message}</p>}</div>
            <div className="space-y-1"><Label>Telefone / WhatsApp</Label><Input {...register("cliente_telefone")} placeholder="(11) 99999-9999" />{errors.cliente_telefone && <p className="text-xs text-destructive">{errors.cliente_telefone.message}</p>}</div>
            <div className="space-y-1"><Label>Email (opcional)</Label><Input type="email" {...register("cliente_email")} /></div>
          </section>
        )}

        {/* Step 5: Confirmar */}
        {step === 5 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Confirme seu agendamento</h2>
            <Card>
              <CardContent className="space-y-2 pt-6 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Serviço:</span><strong>{selectedServico?.nome}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Profissional:</span><strong>{selectedProf?.nome}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Data:</span><strong>{format(new Date(data + "T00:00:00"), "dd/MM/yyyy")}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horário:</span><strong>{hora}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duração:</span><strong>{selectedServico?.duracao_minutos} min</strong></div>
                <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Cliente:</span><strong>{getValues("cliente_nome")}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Telefone:</span><strong>{getValues("cliente_telefone")}</strong></div>
                <div className="mt-3 flex justify-between border-t pt-2 text-base"><span>Total:</span><strong className="text-primary">R$ {Number(selectedServico?.valor ?? 0).toFixed(2)}</strong></div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext} disabled={!canNext}>
              Próximo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit((v) => mut.mutate(v))} disabled={mut.isPending}>
              {mut.isPending ? "Confirmando…" : "Confirmar agendamento"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
