import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type SalaoCtx = {
  salaoId: string | null;
  setSalaoId: (id: string) => void;
  saloes: Array<{ id: string; nome_salao: string }>;
  loading: boolean;
  refetch: () => void;
};

const Ctx = createContext<SalaoCtx>({
  salaoId: null,
  setSalaoId: () => {},
  saloes: [],
  loading: true,
  refetch: () => {},
});

export function SalaoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [salaoId, setSalaoIdState] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("bf:salaoId") : null,
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-saloes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salao_user")
        .select("salao_id, salao:salao(id, nome_salao)")
        .eq("user_id", user!.id)
        .eq("ativo", true);
      if (error) throw error;
      return (data ?? [])
        .map((r: any) => r.salao)
        .filter(Boolean) as Array<{ id: string; nome_salao: string }>;
    },
  });

  const saloes = data ?? [];

  useEffect(() => {
    if (!salaoId && saloes.length > 0) {
      setSalaoId(saloes[0].id);
    }
    if (salaoId && saloes.length > 0 && !saloes.find((s) => s.id === salaoId)) {
      setSalaoId(saloes[0].id);
    }
  }, [saloes, salaoId]);

  function setSalaoId(id: string) {
    setSalaoIdState(id);
    if (typeof window !== "undefined") localStorage.setItem("bf:salaoId", id);
  }

  return (
    <Ctx.Provider value={{ salaoId, setSalaoId, saloes, loading: isLoading, refetch }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSalao = () => useContext(Ctx);
