import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calendar, Users, Scissors, UserCog, Package, LayoutDashboard,
  Settings, LogOut, Sparkles, Gift, Wallet, BarChart3, Bot, UsersRound, Shield,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSalao } from "@/hooks/useSalao";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const grupos = [
  {
    label: "Principal",
    items: [
      { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
      { title: "Agendamentos", url: "/app/agendamentos", icon: Calendar },
      { title: "Clientes", url: "/app/clientes", icon: Users },
      { title: "Serviços", url: "/app/servicos", icon: Scissors },
      { title: "Profissionais", url: "/app/profissionais", icon: UserCog },
      { title: "Pacotes", url: "/app/pacotes", icon: Package },
    ],
  },
  {
    label: "Operacional",
    items: [
      { title: "Pacotes vendidos", url: "/app/pacotes-clientes", icon: Gift },
      { title: "Financeiro", url: "/app/financeiro", icon: Wallet },
      { title: "Relatórios", url: "/app/relatorios", icon: BarChart3 },
      { title: "AI Growth", url: "/app/ai-growth", icon: Bot },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Equipe", url: "/app/equipe", icon: UsersRound },
      { title: "Configurações", url: "/app/configuracoes", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { signOut, user, isSuperAdmin } = useAuth();
  const { saloes, salaoId, setSalaoId } = useSalao();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">BeautyFlow</span>
        </div>
        {saloes.length > 1 && (
          <div className="px-2 pb-2">
            <Select value={salaoId ?? ""} onValueChange={setSalaoId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Salão" /></SelectTrigger>
              <SelectContent>
                {saloes.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome_salao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {grupos.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={path === it.url}>
                      <Link to={it.url} className="flex items-center gap-2">
                        <it.icon className="h-4 w-4" />
                        <span>{it.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Master</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/master" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Painel master</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 text-xs text-muted-foreground truncate">{user?.email}</div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut className="h-4 w-4" /> <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
