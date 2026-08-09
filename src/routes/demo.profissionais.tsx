import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoProfissionais } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/profissionais")({ component: DemoProfissionais });

function DemoProfissionais() {
  return (
    <div>
      <PageHeader title="Profissionais" description={`${demoProfissionais.length} profissionais (demonstração)`} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Especialidade</TableHead><TableHead>Horário</TableHead><TableHead>Contato</TableHead></TableRow></TableHeader>
          <TableBody>
            {demoProfissionais.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>{p.especialidade}</TableCell>
                <TableCell>{p.hora_inicio} – {p.hora_fim}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.telefone}<br />{p.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
