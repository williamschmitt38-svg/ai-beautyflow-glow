import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoServicos } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/servicos")({ component: DemoServicos });

function DemoServicos() {
  return (
    <div>
      <PageHeader title="Serviços" description={`${demoServicos.length} serviços (demonstração)`} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Duração</TableHead><TableHead>Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {demoServicos.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nome}</TableCell>
                <TableCell><Badge variant="secondary">{s.categoria}</Badge></TableCell>
                <TableCell>{s.duracao_minutos} min</TableCell>
                <TableCell>R$ {s.valor.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
