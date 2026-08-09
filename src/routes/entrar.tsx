import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/entrar")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const signupSchema = loginSchema.extend({
  nome: z.string().min(2, "Informe seu nome"),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin");

  if (loading) return null;
  if (user) return <Navigate to="/app/dashboard" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-background to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-2 text-2xl">BeautyFlow AI</CardTitle>
          <CardDescription>Gestão inteligente para o seu salão</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignIn onDone={() => navigate({ to: "/app/dashboard" })} /></TabsContent>
            <TabsContent value="signup"><SignUp onDone={() => navigate({ to: "/app/dashboard" })} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SignIn({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={handleSubmit(async (v) => {
        const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
        if (error) { toast.error(error.message); return; }
        toast.success("Bem-vindo de volta!");
        onDone();
      })}
    >
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

function SignUp({ onDone }: { onDone: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
  });
  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={handleSubmit(async (v) => {
        const { data, error } = await supabase.auth.signUp({
          email: v.email,
          password: v.password,
          options: {
            emailRedirectTo: `${window.location.origin}/app/dashboard`,
            data: { nome: v.nome },
          },
        });
        if (error) { toast.error(error.message); return; }
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: v.email,
            password: v.password,
          });
          if (signInError) { toast.error(signInError.message); return; }
        }
        toast.success("Conta criada!");
        onDone();
      })}
    >
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input {...register("nome")} />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Criando…" : "Criar conta"}
      </Button>
    </form>
  );
}
