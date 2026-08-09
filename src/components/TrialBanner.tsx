import { differenceInDays, parseISO } from "date-fns";
import { AlertTriangle } from "lucide-react";

export function TrialBanner({ salao }: { salao: any }) {
  if (!salao) return null;
  const cob = salao.status_cobranca;
  if (cob === "ativo") return null;
  if (cob === "suspenso" || cob === "cancelado") {
    return (
      <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Acesso suspenso. Regularize a cobrança em Configurações → Cobrança.
      </div>
    );
  }
  if (cob === "trial" && salao.trial_ate) {
    const days = differenceInDays(parseISO(salao.trial_ate), new Date());
    if (days < 0) {
      return (
        <div className="flex items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Seu trial expirou. Ative seu plano em Configurações → Cobrança.
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 border-b border-amber-300/40 bg-amber-100/60 px-4 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        {days === 0 ? "Último dia de trial!" : `Trial: ${days} dias restantes.`}
      </div>
    );
  }
  return null;
}
