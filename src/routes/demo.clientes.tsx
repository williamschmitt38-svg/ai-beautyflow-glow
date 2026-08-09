import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { demoClientes } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/clientes")({ component: DemoClientes });

function DemoClientes() {
  return (
    <div>
      <PageHeader title="Clientes" description={`${demoClientes.length} clientes (demonstração)`} />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Telefone</TableHead><TableHead>Email</TableHead><TableHead>Nascimento</TableHead><TableHead>Observações</TableHead></TableRow></TableHeader>
          <TableBody>
            {demoClientes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.telefone}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{format(new Date(c.data_nascimento), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.observacoes ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
