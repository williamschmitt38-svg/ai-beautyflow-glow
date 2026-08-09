import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MasterSidebar } from "@/components/MasterSidebar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/master")({ component: MasterLayout });

function MasterLayout() {
  const { user, loading, isSuperAdmin } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!user) return <Navigate to="/entrar" />;
  if (!isSuperAdmin) return <Navigate to="/app/dashboard" />;
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-surface">
        <MasterSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 items-center border-b bg-background px-3">
            <SidebarTrigger />
            <span className="ml-2 text-xs font-medium text-destructive">MASTER ADMIN</span>
          </header>
          <main className="flex-1 p-6"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
