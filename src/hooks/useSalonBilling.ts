import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkSalonSubscription } from '@/lib/billing.functions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useSalonBilling(salaoId: string | null) {
  const { user } = useAuth();
  const check = useServerFn(checkSalonSubscription);
  const qc = useQueryClient();
  const permissions = useQuery({
    queryKey: ['billing-permission', salaoId, user?.id], enabled: !!salaoId,
    queryFn: async () => {
      if (!salaoId || !user) return false;
      const [{ data: owner }, { data: master }] = await Promise.all([
        supabase.from('salao_user').select('id').eq('salao_id', salaoId).eq('user_id', user.id).eq('role', 'owner').eq('ativo', true).limit(1),
        supabase.rpc('is_super_admin'),
      ]);
      return !!(owner?.length || master);
    },
  });
  const subscription = useQuery({
    queryKey: ['salon-subscription', salaoId], enabled: !!salaoId && permissions.data === true,
    refetchInterval: 60000, refetchOnWindowFocus: true, retry: 1,
    queryFn: async () => {
      if (!salaoId) throw new Error('Selecione um salão.');
      const result = await check({ data: { salaoId } });
      void qc.invalidateQueries({ queryKey: ['salao-current', salaoId] });
      void qc.invalidateQueries({ queryKey: ['salao', salaoId] });
      return result;
    },
  });
  return { ...subscription, canBill: permissions.data === true, permissionLoading: permissions.isLoading };
}
