import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, isSuperAdmin: false, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
      if (s?.user) {
        setTimeout(() => handleUser(s.user), 0);
      } else {
        setIsSuperAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) handleUser(data.session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleUser(_u: User) {
    // First-login-wins claim
    try {
      const { data: avail } = await supabase.rpc("super_admin_claim_available");
      if (avail) {
        await supabase.rpc("claim_super_admin_if_empty");
      }
    } catch {}
    // Check role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", _u.id);
    const fromRoles = !!roles?.some((r) => r.role === "super_admin");
    let fromEmail = false;
    try {
      const { data: isa } = await supabase.rpc("is_super_admin");
      fromEmail = !!isa;
    } catch {}
    setIsSuperAdmin(fromRoles || fromEmail);
  }

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        isSuperAdmin,
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
