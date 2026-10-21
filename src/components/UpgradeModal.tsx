import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const beneficios = [
  "Mensagens de WhatsApp com IA usando o histórico real",
  "Histórico de gastos e LTV de cada cliente",
  "Dashboard de Custos vs Retorno",
  "Consultor financeiro com IA",
];

export function UpgradeModal({ open, onOpenChange, message, badge = "Exclusivo Pro & Enterprise" }: { open: boolean; onOpenChange: (o: boolean) => void; message: string; badge?: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">{badge}</p>
          <DialogTitle className="text-center">Desbloqueie este recurso</DialogTitle>
          <DialogDescription className="text-center">{message}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          {beneficios.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b}</li>)}
        </ul>
        <Button asChild className="w-full" onClick={() => onOpenChange(false)}>
          <Link to="/app/configuracoes" search={{ tab: "cobranca" } as any}>Fazer Upgrade</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeButton({ message, label = "Fazer upgrade para o Pro" }: { message: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (<><Button size="sm" onClick={() => setOpen(true)}>{label}</Button><UpgradeModal open={open} onOpenChange={setOpen} message={message} /></>);
}
