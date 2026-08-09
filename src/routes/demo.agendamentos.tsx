import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { demoAgendamentos } from "@/lib/demo-seed";

export const Route = createFileRoute("/demo/agendamentos")({ component: DemoAgendamentos });

function DemoAgendamentos() {
  const ord = [...demoAgendamentos].sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  return (
    <div>
      <PageHeader title="Agendamentos" description="Demonstração — últimos 30 dias + próximos 14" />
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead><TableHead>Profissional</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ord.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{format(new Date(a.data), "dd/MM/yyyy")}</TableCell>
                <TableCell>{a.hora}</TableCell>
                <TableCell>{a.cliente_nome}</TableCell>
                <TableCell>{a.servico_nome}</TableCell>
                <TableCell>{a.profissional_nome}</TableCell>
                <TableCell>R$ {a.valor.toFixed(2)}</TableCell>
                <TableCell><Badge variant={a.status === "concluido" ? "default" : a.status === "cancelado" ? "destructive" : "secondary"}>{a.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
