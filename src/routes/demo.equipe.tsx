import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Plus, Shield } from "lucide-react";

export const Route = createFileRoute("/demo/equipe")({ component: DemoEquipe });

const equipe = [
  { nome: "Camila Ferreira", cargo: "Proprietária", role: "Admin", email: "camila@studiobela.com.br", telefone: "(11) 99999-0001", cor: "#F43F5E", status: "ativo" },
  { nome: "Ana Carolina", cargo: "Cabeleireira Sênior", role: "Profissional", email: "ana@studiobela.com.br", telefone: "(11) 98888-0002", cor: "#EC4899", status: "ativo" },
  { nome: "Carla Mendes", cargo: "Colorista", role: "Profissional", email: "carla@studiobela.com.br", telefone: "(11) 98888-0003", cor: "#8B5CF6", status: "ativo" },
  { nome: "Paula Souza", cargo: "Manicure", role: "Profissional", email: "paula@studiobela.com.br", telefone: "(11) 98888-0004", cor: "#10B981", status: "ativo" },
  { nome: "Beatriz Lima", cargo: "Designer de Sobrancelhas", role: "Profissional", email: "beatriz@studiobela.com.br", telefone: "(11) 98888-0005", cor: "#F59E0B", status: "ativo" },
  { nome: "Juliana Costa", cargo: "Esteticista", role: "Profissional", email: "juliana@studiobela.com.br", telefone: "(11) 98888-0006", cor: "#06B6D4", status: "ativo" },
  { nome: "Roberta Alves", cargo: "Recepcionista", role: "Atendente", email: "roberta@studiobela.com.br", telefone: "(11) 98888-0007", cor: "#71717a", status: "ativo" },
  { nome: "Marina Tavares", cargo: "Cabeleireira", role: "Profissional", email: "marina@studiobela.com.br", telefone: "(11) 98888-0008", cor: "#A855F7", status: "convite_pendente" },
];

function DemoEquipe() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">{equipe.length} membros · permissões e convites</p>
        </div>
        <Button className="bg-gradient-to-r from-rose-500 to-pink-500 text-white"><Plus className="mr-2 h-4 w-4" /> Convidar membro</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipe.map((m) => (
          <Card key={m.email}><CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white" style={{ background: `linear-gradient(135deg, ${m.cor}, ${m.cor}cc)` }}>
                {m.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{m.nome}</h3>
                  {m.status === "convite_pendente" && <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 text-[10px]">Convite pendente</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{m.cargo}</p>
                <Badge variant="outline" className="mt-1 text-[10px]"><Shield className="mr-1 h-2.5 w-2.5" /> {m.role}</Badge>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {m.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {m.telefone}</div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
