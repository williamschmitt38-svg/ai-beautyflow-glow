import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoPacotes } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/pacotes")({ component: DemoPacotes });

function DemoPacotes() {
  return (
    <div>
      <PageHeader title="Pacotes" description={`${demoPacotes.length} pacotes pré-pagos (demonstração)`} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoPacotes.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.nome}</CardTitle>
              <CardDescription>{p.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-primary">R$ {p.valor.toFixed(2)}</div>
              <div className="flex gap-2"><Badge variant="secondary">{p.total_sessoes} sessões</Badge><Badge variant="outline">{p.validade_dias} dias</Badge></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
