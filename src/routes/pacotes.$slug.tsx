import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Check, Package as PackageIcon } from "lucide-react";
import { getPublicSalao, comprarPacote } from "@/lib/public-booking.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/pacotes/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Pacotes — ${params.slug}` }] }),
  component: PacotesPublic,
});

const schema = z.object({
  cliente_nome: z.string().min(2),
  cliente_telefone: z.string().min(8),
  cliente_email: z.string().email().optional().or(z.literal("")),
});
type Form = z.infer<typeof schema>;

function PacotesPublic() {
  const { slug } = Route.useParams();
  const fetchSalao = useServerFn(getPublicSalao);
  const comprar = useServerFn(comprarPacote);
  const [pacoteId, setPacoteId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["public-salao", slug],
    queryFn: () => fetchSalao({ data: { slug } }),
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const mut = useMutation({
    mutationFn: (v: Form) => comprar({ data: { slug, pacote_id: pacoteId!, ...v } }),
    onSuccess: () => { setDone(true); setPacoteId(null); reset(); toast.success("Compra registrada! Entraremos em contato."); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!data) return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Salão não encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Ir para o início</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
          <div className="flex-1">
            <div className="text-lg font-semibold">{data.salao.nome_fantasia || data.salao.nome_salao}</div>
            {data.salao.endereco && <div className="text-xs text-muted-foreground">{data.salao.endereco}</div>}
          </div>
          <Link to="/agendar/$slug" params={{ slug }}><Button variant="outline" size="sm">Agendar</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Pacotes pré-pagos</h1>
          <p className="mt-1 text-muted-foreground">Economize comprando sessões antecipadas</p>
        </div>
        {data.pacotes.length === 0 && (
          <div className="rounded-md border bg-background p-8 text-center text-muted-foreground">Nenhum pacote disponível no momento.</div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.pacotes.map((p: any) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PackageIcon className="h-4 w-4 text-primary" /> {p.nome}</CardTitle>
                {p.descricao && <CardDescription>{p.descricao}</CardDescription>}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="text-3xl font-bold text-primary">R$ {Number(p.valor).toFixed(2)}</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">{p.total_sessoes} sessões</Badge>
                  <Badge variant="outline">{p.validade_dias} dias</Badge>
                </div>
                <Button className="mt-auto pt-4" onClick={() => setPacoteId(p.id)}>Comprar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={!!pacoteId} onOpenChange={(o) => !o && setPacoteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Seus dados para compra</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit((v) => mut.mutate(v))}>
            <div className="space-y-1"><Label>Nome completo</Label><Input {...register("cliente_nome")} />{errors.cliente_nome && <p className="text-xs text-destructive">{errors.cliente_nome.message}</p>}</div>
            <div className="space-y-1"><Label>Telefone / WhatsApp</Label><Input {...register("cliente_telefone")} />{errors.cliente_telefone && <p className="text-xs text-destructive">{errors.cliente_telefone.message}</p>}</div>
            <div className="space-y-1"><Label>Email (opcional)</Label><Input type="email" {...register("cliente_email")} /></div>
            <Button type="submit" className="w-full" disabled={mut.isPending}>{mut.isPending ? "Processando…" : "Confirmar compra"}</Button>
            <p className="text-center text-xs text-muted-foreground">Pagamento será combinado diretamente com o salão.</p>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={done} onOpenChange={setDone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" /> Compra registrada</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">O salão entrará em contato para confirmar o pagamento e ativar suas sessões.</p>
          <Button onClick={() => setDone(false)}>Fechar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
