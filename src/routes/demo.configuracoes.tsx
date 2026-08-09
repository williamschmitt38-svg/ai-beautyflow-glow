import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Palette, Bell, CreditCard, MessageSquare, Globe } from "lucide-react";

export const Route = createFileRoute("/demo/configuracoes")({ component: DemoConfig });

function DemoConfig() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Personalize o BeautyFlow para o seu salão</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-rose-500" /><h3 className="font-bold">Dados do salão</h3></div>
          <div className="space-y-3">
            <div><Label>Nome do salão</Label><Input defaultValue="Studio Beleza Excellence" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
              <div><Label>Slug público</Label><Input defaultValue="studio-bela" /></div>
            </div>
            <div><Label>Endereço</Label><Input defaultValue="Rua das Flores, 123 — Jardins, São Paulo" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><Palette className="h-4 w-4 text-rose-500" /><h3 className="font-bold">Identidade visual</h3></div>
          <div className="space-y-3">
            <div><Label>Cor primária</Label>
              <div className="mt-1 flex gap-2">{["#F43F5E", "#EC4899", "#8B5CF6", "#10B981", "#F59E0B"].map((c) => (
                <button key={c} className="h-9 w-9 rounded-full border-2 border-white shadow ring-1 ring-black/10" style={{ background: c }} />
              ))}</div>
            </div>
            <div><Label>Logo</Label>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xl font-black">SB</div>
                <Button variant="outline" size="sm">Trocar logo</Button>
              </div>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-rose-500" /><h3 className="font-bold">WhatsApp Business</h3></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm">Conexão</span><Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30" variant="outline">Conectado</Badge></div>
            <div><Label>Número</Label><Input defaultValue="(11) 98888-0001" /></div>
            <div><Label>Mensagem de confirmação automática</Label>
              <Input defaultValue="Olá {cliente}! Confirmando seu horário em {data} às {hora}. ✨" /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-rose-500" /><h3 className="font-bold">Notificações</h3></div>
          <div className="space-y-2">
            {[
              "Lembrete 24h antes do agendamento",
              "Confirmação automática ao agendar",
              "Aniversário do cliente (-7 dias)",
              "Pacote prestes a vencer",
              "Cliente inativo +30 dias (AI Growth)",
            ].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                <span>{t}</span><Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700">Ativo</Badge>
              </div>
            ))}
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-rose-500" /><h3 className="font-bold">Assinatura BeautyFlow</h3></div>
          <div className="rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 p-4 text-white">
            <div className="text-xs uppercase tracking-wider opacity-80">Plano atual</div>
            <div className="text-2xl font-black">Profissional</div>
            <div className="text-sm opacity-90">R$ 97/mês · Renova em 14 dias</div>
          </div>
          <Button variant="outline" className="mt-3 w-full">Gerenciar pagamento</Button>
        </CardContent></Card>

        <Card><CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2"><Globe className="h-4 w-4 text-rose-500" /><h3 className="font-bold">Página pública de agendamento</h3></div>
          <p className="text-sm text-muted-foreground">URL pública que você compartilha com clientes:</p>
          <div className="mt-2 rounded-lg border bg-muted p-3 text-sm font-mono">beautyflow.app/agendar/studio-bela</div>
          <Button variant="outline" className="mt-3 w-full">Copiar link</Button>
        </CardContent></Card>
      </div>
    </div>
  );
}
