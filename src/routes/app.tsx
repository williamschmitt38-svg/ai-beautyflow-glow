import { pageHead } from "@/lib/page-head";
import { createFileRoute, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TrialBanner } from "@/components/TrialBanner";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { useSalonBilling } from "@/hooks/useSalonBilling";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({ head: () => pageHead("Meu salão", "Meu salão: gestão de salões de beleza no GlowVitta."),
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const { saloes, salaoId, loading: loadingSaloes } = useSalao();
  useSalonBilling(user ? salaoId : null);
  const path = useRouterState({ select: (r) => r.location.pathname });

  const { data: salao } = useQuery({
    queryKey: ["salao-current", salaoId],
    enabled: !!salaoId,
    queryFn: async () => (await supabase.from("salao").select("*").eq("id", salaoId!).single()).data,
  });

  if (loading || loadingSaloes) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }
  if (!user) return <Navigate to="/entrar" />;
  if (saloes.length === 0 && path !== "/app/onboarding") return <Navigate to="/app/onboarding" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-surface">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TrialBanner salao={salao} />
          <header className="flex h-12 items-center border-b bg-background px-3">
            <SidebarTrigger />
          </header>
          <main className="min-w-0 flex-1 overflow-x-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
