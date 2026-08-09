import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/master/novo")({ component: NovoSalao });

const schema = z.object({
  nome_salao: z.string().min(2),
  admin_email: z.string().email(),
  telefone: z.string().optional(),
  plano: z.enum(["starter", "pro", "enterprise"]),
  trial_dias: z.coerce.number().min(0).max(90),
});
type Form = z.infer<typeof schema>;

function NovoSalao() {
  const nav = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema), defaultValues: { plano: "starter", trial_dias: 14 },
  });

  return (
    <div className="max-w-xl">
      <PageHeader title="Novo salão" description="Cadastrar manualmente (sem onboarding)" />
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit(async (v) => {
            const valor = v.plano === "starter" ? 39 : v.plano === "pro" ? 79 : 149;
            const { error } = await supabase.from("salao").insert({
              nome_salao: v.nome_salao,
              admin_email: v.admin_email,
              telefone: v.telefone || null,
              plano: v.plano,
              valor_plano: valor,
              status_cobranca: v.trial_dias > 0 ? "trial" : "ativo",
              trial_ate: v.trial_dias > 0 ? format(addDays(new Date(), v.trial_dias), "yyyy-MM-dd") : null,
              status: "ativo",
            });
            if (error) return toast.error(error.message);
            toast.success("Salão criado");
            nav({ to: "/master/saloes" });
          })}>
            <div className="space-y-2"><Label>Nome do salão *</Label><Input {...register("nome_salao")} />{errors.nome_salao && <p className="text-xs text-destructive">{errors.nome_salao.message}</p>}</div>
            <div className="space-y-2"><Label>Email admin *</Label><Input type="email" {...register("admin_email")} />{errors.admin_email && <p className="text-xs text-destructive">{errors.admin_email.message}</p>}</div>
            <div className="space-y-2"><Label>Telefone</Label><Input {...register("telefone")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Plano</Label>
                <Select value={watch("plano")} onValueChange={(v) => setValue("plano", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter — R$ 39</SelectItem>
                    <SelectItem value="pro">Pro — R$ 79</SelectItem>
                    <SelectItem value="enterprise">Enterprise — R$ 149</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Trial (dias)</Label><Input type="number" {...register("trial_dias")} /></div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">Criar salão</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
