import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  nome_salao: z.string().min(2),
  admin_email: z.string().email(),
  telefone: z.string().optional(),
});

export function CreateSalaoCard() {
  const { user } = useAuth();
  const { refetch, setSalaoId } = useSalao();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { admin_email: user?.email ?? "" },
  });

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bem-vindo ao BeautyFlow!</CardTitle>
          <CardDescription>Vamos cadastrar seu salão para começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(async (v) => {
              const { data: salao, error } = await supabase
                .from("salao")
                .insert({
                  nome_salao: v.nome_salao,
                  admin_email: v.admin_email,
                  telefone: v.telefone || null,
                  owner_email: user!.email!,
                  status: "ativo",
                })
                .select()
                .single();
              if (error) { toast.error(error.message); return; }
              const { error: e2 } = await supabase.from("salao_user").insert({
                salao_id: salao.id,
                user_id: user!.id,
                email: user!.email!,
                role: "owner",
              });
              if (e2) { toast.error(e2.message); return; }
              toast.success("Salão criado!");
              setSalaoId(salao.id);
              await refetch();
            })}
          >
            <div className="space-y-2">
              <Label>Nome do salão *</Label>
              <Input {...register("nome_salao")} />
              {errors.nome_salao && <p className="text-xs text-destructive">{errors.nome_salao.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email administrativo *</Label>
              <Input type="email" {...register("admin_email")} />
              {errors.admin_email && <p className="text-xs text-destructive">{errors.admin_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input {...register("telefone")} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Criando…" : "Criar salão"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
