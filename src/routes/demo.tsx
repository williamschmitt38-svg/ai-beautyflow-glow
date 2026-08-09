import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Calendar, Users, Scissors, UserCog, Package, ArrowLeft, Brain, DollarSign, BarChart3, UsersRound, Settings } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/demo")({
  component: DemoLayout,
});

const operacao = [
  { title: "Dashboard", url: "/demo/dashboard", icon: LayoutDashboard },
  { title: "Agenda", url: "/demo/agendamentos", icon: Calendar },
  { title: "Clientes", url: "/demo/clientes", icon: Users },
  { title: "Serviços", url: "/demo/servicos", icon: Scissors },
  { title: "Profissionais", url: "/demo/profissionais", icon: UserCog },
  { title: "Pacotes", url: "/demo/pacotes", icon: Package },
];
const gestao = [
  { title: "Financeiro", url: "/demo/financeiro", icon: DollarSign },
  { title: "Relatórios", url: "/demo/relatorios", icon: BarChart3 },
  { title: "AI Growth", url: "/demo/ai-growth", icon: Brain },
];
const config = [
  { title: "Equipe", url: "/demo/equipe", icon: UsersRound },
  { title: "Configurações", url: "/demo/configuracoes", icon: Settings },
];


function DemoLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-surface">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold leading-tight">BeautyFlow</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Modo demonstração</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {[
              { label: "Operação", items: operacao },
              { label: "Gestão", items: gestao },
              { label: "Configurações", items: config },
            ].map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((it) => (
                      <SidebarMenuItem key={it.url}>
                        <SidebarMenuButton asChild isActive={path === it.url}>
                          <Link to={it.url} className="flex items-center gap-2">
                            <it.icon className="h-4 w-4" /><span>{it.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> <span>Voltar ao site</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <div className="border-b bg-primary/10 px-4 py-2 text-sm">
            <strong>Modo demonstração</strong> — dados fictícios. <Link to="/entrar" className="text-primary underline">Criar minha conta grátis</Link>
          </div>
          <header className="flex h-12 items-center border-b bg-background px-3">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
