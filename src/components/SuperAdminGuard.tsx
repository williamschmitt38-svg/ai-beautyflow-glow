import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();
  if (loading) return <div className="p-8 text-muted-foreground">Carregando…</div>;
  if (!user) return <Navigate to="/entrar" />;
  if (!isSuperAdmin) return <Navigate to="/app/dashboard" />;
  return <>{children}</>;
}
