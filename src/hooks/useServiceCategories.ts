import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ServiceCategory = { id: string; nome: string; company_id: string };

export function useServiceCategories(salaoId: string | null) {
  return useQuery({
    queryKey: ["service-categories", salaoId],
    enabled: !!salaoId,
    queryFn: async () => {
      if (!salaoId) return [];
      const { data, error } = await supabase.from("servico_categoria")
        .select("id, nome, company_id").eq("company_id", salaoId).order("nome");
      if (error) throw error;
      return data;
    },
  });
}