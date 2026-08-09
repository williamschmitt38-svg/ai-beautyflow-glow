// Rich demo data for /demo/* routes and AI insights — premium Brazilian beauty salon.
import { addDays, format, subDays, subMonths } from "date-fns";

export type DemoCliente = {
  id: string; nome: string; telefone: string; email: string; data_nascimento: string;
  observacoes?: string; total_agendamentos: number; total_gasto: number;
  ticket_medio: number; pacotes_ativos: number; ultimo_atendimento: string;
  profissional_preferido: string; status: "vip" | "recorrente" | "nova" | "inativa";
  tags: string[]; ativo: boolean;
};
export type DemoServico = { id: string; nome: string; categoria: "Cabelo" | "Coloração" | "Unhas" | "Estética" | "Cílios" | "Maquiagem"; duracao_minutos: number; valor: number; descricao?: string; ativo: boolean };
export type DemoProfissional = {
  id: string; nome: string; especialidade: string; telefone: string; email: string;
  hora_inicio: string; hora_fim: string; comissao: number; cor_agenda: string;
  dias_atendimento: string[]; ativo: boolean;
  agendamentos_mes: number; faturamento_mes: number;
};
export type DemoPacote = { id: string; nome: string; descricao: string; total_sessoes: number; valor: number; validade_dias: number; ativo: boolean };
export type DemoPacoteCliente = {
  id: string; cliente_nome: string; pacote_nome: string; total_sessoes: number;
  sessoes_usadas: number; valor_pago: number; saldo_restante: number;
  data_validade: string; status: "ativo" | "expirado" | "concluido";
};
export type DemoAgendamento = {
  id: string; cliente_nome: string; servico_nome: string; profissional_nome: string;
  profissional_cor: string; data: string; hora: string; duracao_minutos: number; valor: number;
  status: "agendado" | "confirmado" | "chegou" | "concluido" | "cancelado";
};
export type DemoLancamento = { id: string; tipo: "receita" | "despesa"; categoria: string; descricao: string; valor: number; data: string; forma_pagamento?: string };

export const demoSalao = {
  id: "demo-salao",
  nome_salao: "Studio Beleza Excellence",
  nome_fantasia: "Beleza Excellence",
  slug: "studio-bela",
  cnpj: "12.345.678/0001-90",
  endereco: "Rua Oscar Freire, 1234 — Jardins, São Paulo/SP",
  telefone: "(11) 3456-7890",
  whatsapp: "(11) 99999-8888",
  cor_primaria: "#F43F5E",
  plano: "profissional",
  owner_email: "contato@belezaexcellence.com.br",
};

export const demoProfissionais: DemoProfissional[] = [
  { id: "p1", nome: "Ana Carolina", especialidade: "Cabelo", telefone: "(11) 98888-1111", email: "ana@belezaexcellence.com", hora_inicio: "09:00", hora_fim: "19:00", comissao: 45, cor_agenda: "#F43F5E", dias_atendimento: ["Seg","Ter","Qua","Qui","Sex","Sáb"], ativo: true, agendamentos_mes: 142, faturamento_mes: 12480 },
  { id: "p2", nome: "Carla Mendes", especialidade: "Coloração", telefone: "(11) 98888-2222", email: "carla@belezaexcellence.com", hora_inicio: "10:00", hora_fim: "19:00", comissao: 50, cor_agenda: "#EC4899", dias_atendimento: ["Ter","Qua","Qui","Sex","Sáb"], ativo: true, agendamentos_mes: 98, faturamento_mes: 9650 },
  { id: "p3", nome: "Paula Souza", especialidade: "Manicure", telefone: "(11) 98888-3333", email: "paula@belezaexcellence.com", hora_inicio: "09:00", hora_fim: "18:00", comissao: 50, cor_agenda: "#8B5CF6", dias_atendimento: ["Seg","Ter","Qua","Qui","Sex","Sáb"], ativo: true, agendamentos_mes: 168, faturamento_mes: 7820 },
  { id: "p4", nome: "Renata Lima", especialidade: "Estética", telefone: "(11) 98888-4444", email: "renata@belezaexcellence.com", hora_inicio: "10:00", hora_fim: "19:00", comissao: 45, cor_agenda: "#10B981", dias_atendimento: ["Seg","Ter","Qua","Qui","Sex"], ativo: true, agendamentos_mes: 86, faturamento_mes: 8950 },
  { id: "p5", nome: "Fernanda Costa", especialidade: "Cílios & Sobrancelha", telefone: "(11) 98888-5555", email: "fernanda@belezaexcellence.com", hora_inicio: "10:00", hora_fim: "20:00", comissao: 50, cor_agenda: "#F59E0B", dias_atendimento: ["Ter","Qua","Qui","Sex","Sáb"], ativo: true, agendamentos_mes: 118, faturamento_mes: 6480 },
];

const nomesFemininos = [
  "Maria Silva", "Joana Pereira", "Fernanda Lima", "Beatriz Costa", "Camila Santos",
  "Ana Paula Souza", "Priscila Mendes", "Larissa Oliveira", "Renata Castro", "Patrícia Almeida",
  "Juliana Ramos", "Mariana Rocha", "Carolina Martins", "Sabrina Duarte", "Vanessa Ribeiro",
  "Letícia Barros", "Gabriela Freitas", "Tatiane Moraes", "Cláudia Pinto", "Helena Vieira",
  "Isabela Castro", "Mônica Teixeira", "Rebeca Lopes", "Simone Cunha", "Thaís Monteiro",
  "Carla Ferraz", "Eduarda Salgado", "Júlia Magalhães", "Daniela Cardoso", "Bruna Faria",
];

export const demoClientes: DemoCliente[] = nomesFemininos.map((nome, i) => {
  const total = 2 + ((i * 7) % 41);
  const ticket = 95 + ((i * 13) % 220);
  const status: DemoCliente["status"] =
    i < 8 ? "vip" : i < 26 ? "recorrente" : i < 30 ? "nova" : "inativa";
  const lastDays = status === "inativa" ? 50 + i * 2 : (i * 3) % 28;
  return {
    id: `c${i + 1}`,
    nome,
    telefone: `(11) 9${String(8000 + i * 17).slice(0,4)}-${String(1000 + i * 91).slice(0,4)}`,
    email: nome.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@email.com",
    data_nascimento: `199${i % 10}-${String((i % 12) + 1).padStart(2, "0")}-${String((i * 3) % 28 + 1).padStart(2, "0")}`,
    observacoes: i % 7 === 0 ? "Alergia a amônia" : i % 9 === 0 ? "Prefere atendimento à tarde" : undefined,
    total_agendamentos: total,
    total_gasto: total * ticket,
    ticket_medio: ticket,
    pacotes_ativos: i % 5 === 0 ? 1 : 0,
    ultimo_atendimento: format(subDays(new Date(), lastDays), "yyyy-MM-dd"),
    profissional_preferido: demoProfissionais[i % demoProfissionais.length].nome,
    status,
    tags: [
      ...(status === "vip" ? ["VIP"] : []),
      ...(i % 4 === 0 ? ["Combo"] : []),
      ...(i % 6 === 0 ? ["Fidelidade"] : []),
      ...(i % 8 === 0 ? ["Indicação"] : []),
    ],
    ativo: status !== "inativa",
  };
});

export const demoServicos: DemoServico[] = [
  // Cabelo
  { id: "s1", nome: "Corte Feminino", categoria: "Cabelo", duracao_minutos: 60, valor: 85, descricao: "Lavagem + corte + finalização", ativo: true },
  { id: "s2", nome: "Corte + Escova", categoria: "Cabelo", duracao_minutos: 90, valor: 120, ativo: true },
  { id: "s3", nome: "Escova", categoria: "Cabelo", duracao_minutos: 45, valor: 60, ativo: true },
  { id: "s4", nome: "Hidratação", categoria: "Cabelo", duracao_minutos: 60, valor: 95, ativo: true },
  { id: "s5", nome: "Botox Capilar", categoria: "Cabelo", duracao_minutos: 120, valor: 220, ativo: true },
  { id: "s6", nome: "Cauterização", categoria: "Cabelo", duracao_minutos: 90, valor: 180, ativo: true },
  // Coloração
  { id: "s7", nome: "Coloração Completa", categoria: "Coloração", duracao_minutos: 120, valor: 180, ativo: true },
  { id: "s8", nome: "Mechas / Luzes", categoria: "Coloração", duracao_minutos: 150, valor: 280, ativo: true },
  { id: "s9", nome: "Tonalização", categoria: "Coloração", duracao_minutos: 60, valor: 120, ativo: true },
  { id: "s10", nome: "Retoque Raiz", categoria: "Coloração", duracao_minutos: 60, valor: 95, ativo: true },
  // Manicure/Pedicure
  { id: "s11", nome: "Manicure", categoria: "Unhas", duracao_minutos: 45, valor: 45, ativo: true },
  { id: "s12", nome: "Pedicure", categoria: "Unhas", duracao_minutos: 50, valor: 55, ativo: true },
  { id: "s13", nome: "Spa dos Pés", categoria: "Unhas", duracao_minutos: 90, valor: 85, ativo: true },
  // Estética
  { id: "s14", nome: "Limpeza de Pele", categoria: "Estética", duracao_minutos: 60, valor: 150, ativo: true },
  { id: "s15", nome: "Massagem Relaxante", categoria: "Estética", duracao_minutos: 60, valor: 120, ativo: true },
  { id: "s16", nome: "Drenagem Linfática", categoria: "Estética", duracao_minutos: 60, valor: 140, ativo: true },
  { id: "s17", nome: "Peeling Facial", categoria: "Estética", duracao_minutos: 60, valor: 220, ativo: true },
  // Cílios
  { id: "s18", nome: "Design de Sobrancelha", categoria: "Cílios", duracao_minutos: 30, valor: 50, ativo: true },
  { id: "s19", nome: "Extensão de Cílios", categoria: "Cílios", duracao_minutos: 120, valor: 180, ativo: true },
];

export const demoPacotes: DemoPacote[] = [
  { id: "pk1", nome: "Pacote Facial Premium", descricao: "6 sessões de limpeza de pele + peeling", total_sessoes: 6, valor: 780, validade_dias: 180, ativo: true },
  { id: "pk2", nome: "Cílios Premium Trimestral", descricao: "3 manutenções de extensão de cílios", total_sessoes: 3, valor: 480, validade_dias: 90, ativo: true },
  { id: "pk3", nome: "Manicure Mensal", descricao: "4 manicures + 2 pedicures no mês", total_sessoes: 6, valor: 270, validade_dias: 30, ativo: true },
  { id: "pk4", nome: "Cabelo Total", descricao: "10 escovas + 2 hidratações + 1 botox", total_sessoes: 13, valor: 890, validade_dias: 120, ativo: true },
  { id: "pk5", nome: "Pacote Noiva", descricao: "Teste de make + make + cabelo + sobrancelha", total_sessoes: 4, valor: 1500, validade_dias: 365, ativo: true },
  { id: "pk6", nome: "Spa Day Completo", descricao: "Massagem + drenagem + limpeza de pele", total_sessoes: 3, valor: 540, validade_dias: 90, ativo: true },
];

export const demoPacotesClientes: DemoPacoteCliente[] = [
  { id: "pc1", cliente_nome: "Patrícia Almeida", pacote_nome: "Pacote Facial Premium", total_sessoes: 6, sessoes_usadas: 4, valor_pago: 780, saldo_restante: 260, data_validade: format(addDays(new Date(), 90), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc2", cliente_nome: "Larissa Oliveira", pacote_nome: "Cílios Premium Trimestral", total_sessoes: 3, sessoes_usadas: 1, valor_pago: 480, saldo_restante: 320, data_validade: format(addDays(new Date(), 60), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc3", cliente_nome: "Maria Silva", pacote_nome: "Cabelo Total", total_sessoes: 13, sessoes_usadas: 8, valor_pago: 890, saldo_restante: 340, data_validade: format(addDays(new Date(), 80), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc4", cliente_nome: "Sabrina Duarte", pacote_nome: "Pacote Noiva", total_sessoes: 4, sessoes_usadas: 1, valor_pago: 1500, saldo_restante: 1125, data_validade: format(addDays(new Date(), 300), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc5", cliente_nome: "Juliana Ramos", pacote_nome: "Manicure Mensal", total_sessoes: 6, sessoes_usadas: 5, valor_pago: 270, saldo_restante: 45, data_validade: format(addDays(new Date(), 6), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc6", cliente_nome: "Mariana Rocha", pacote_nome: "Spa Day Completo", total_sessoes: 3, sessoes_usadas: 2, valor_pago: 540, saldo_restante: 180, data_validade: format(addDays(new Date(), 30), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc7", cliente_nome: "Renata Castro", pacote_nome: "Pacote Facial Premium", total_sessoes: 6, sessoes_usadas: 2, valor_pago: 780, saldo_restante: 520, data_validade: format(addDays(new Date(), 150), "yyyy-MM-dd"), status: "ativo" },
  { id: "pc8", cliente_nome: "Beatriz Costa", pacote_nome: "Cabelo Total", total_sessoes: 13, sessoes_usadas: 12, valor_pago: 890, saldo_restante: 68, data_validade: format(addDays(new Date(), 4), "yyyy-MM-dd"), status: "ativo" },
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

// 24 agendamentos hoje + histórico
function buildAgendamentos(): DemoAgendamento[] {
  const hojeBase = [
    { hora: "09:00", cli: 0, srv: 1, prof: 0, status: "concluido" as const },
    { hora: "09:30", cli: 5, srv: 10, prof: 2, status: "concluido" as const },
    { hora: "10:00", cli: 1, srv: 6, prof: 1, status: "concluido" as const },
    { hora: "10:30", cli: 9, srv: 13, prof: 3, status: "concluido" as const },
    { hora: "11:00", cli: 2, srv: 17, prof: 4, status: "concluido" as const },
    { hora: "11:30", cli: 12, srv: 0, prof: 0, status: "chegou" as const },
    { hora: "12:00", cli: 3, srv: 11, prof: 2, status: "confirmado" as const },
    { hora: "13:00", cli: 7, srv: 7, prof: 1, status: "confirmado" as const },
    { hora: "13:30", cli: 4, srv: 18, prof: 4, status: "confirmado" as const },
    { hora: "14:00", cli: 11, srv: 1, prof: 0, status: "confirmado" as const },
    { hora: "14:30", cli: 14, srv: 12, prof: 2, status: "agendado" as const },
    { hora: "15:00", cli: 6, srv: 14, prof: 3, status: "agendado" as const },
    { hora: "15:30", cli: 18, srv: 3, prof: 0, status: "agendado" as const },
    { hora: "16:00", cli: 8, srv: 7, prof: 1, status: "agendado" as const },
    { hora: "16:30", cli: 22, srv: 10, prof: 2, status: "agendado" as const },
    { hora: "17:00", cli: 10, srv: 4, prof: 0, status: "agendado" as const },
    { hora: "17:00", cli: 16, srv: 17, prof: 4, status: "agendado" as const },
    { hora: "17:30", cli: 13, srv: 11, prof: 2, status: "agendado" as const },
    { hora: "18:00", cli: 20, srv: 15, prof: 3, status: "agendado" as const },
    { hora: "18:00", cli: 24, srv: 18, prof: 4, status: "agendado" as const },
    { hora: "18:30", cli: 17, srv: 1, prof: 1, status: "agendado" as const },
    { hora: "19:00", cli: 19, srv: 4, prof: 0, status: "agendado" as const },
    { hora: "19:00", cli: 26, srv: 11, prof: 2, status: "agendado" as const },
    { hora: "19:30", cli: 21, srv: 14, prof: 3, status: "agendado" as const },
  ];
  const today = format(new Date(), "yyyy-MM-dd");
  const hoje: DemoAgendamento[] = hojeBase.map((h, i) => {
    const cli = pick(demoClientes, h.cli);
    const srv = pick(demoServicos, h.srv);
    const prof = pick(demoProfissionais, h.prof);
    return {
      id: `ag-h${i}`, cliente_nome: cli.nome, servico_nome: srv.nome,
      profissional_nome: prof.nome, profissional_cor: prof.cor_agenda,
      data: today, hora: h.hora, duracao_minutos: srv.duracao_minutos, valor: srv.valor, status: h.status,
    };
  });
  // Resto do mês (histórico + futuros)
  const rest: DemoAgendamento[] = Array.from({ length: 180 }).map((_, i) => {
    const cli = pick(demoClientes, i * 3 + 1);
    const srv = pick(demoServicos, i + 2);
    const prof = pick(demoProfissionais, i + 1);
    const dayOffset = ((i * 7) % 60) - 30;
    if (dayOffset === 0) return null;
    const d = dayOffset < 0 ? subDays(new Date(), -dayOffset) : addDays(new Date(), dayOffset);
    const hour = 9 + (i % 10);
    const status: DemoAgendamento["status"] =
      dayOffset < 0 ? (i % 12 === 0 ? "cancelado" : "concluido") :
      (i % 3 === 0 ? "confirmado" : "agendado");
    return {
      id: `ag-r${i}`, cliente_nome: cli.nome, servico_nome: srv.nome,
      profissional_nome: prof.nome, profissional_cor: prof.cor_agenda,
      data: format(d, "yyyy-MM-dd"),
      hora: `${String(hour).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
      duracao_minutos: srv.duracao_minutos, valor: srv.valor, status,
    };
  }).filter(Boolean) as DemoAgendamento[];
  return [...hoje, ...rest];
}

export const demoAgendamentos: DemoAgendamento[] = buildAgendamentos();

// Lançamentos financeiros
export const demoLancamentos: DemoLancamento[] = [
  // Despesas mês
  { id: "l1", tipo: "despesa", categoria: "Folha", descricao: "Folha de pagamento", valor: 8500, data: format(subDays(new Date(), 5), "yyyy-MM-dd") },
  { id: "l2", tipo: "despesa", categoria: "Aluguel", descricao: "Aluguel do espaço", valor: 4500, data: format(subDays(new Date(), 10), "yyyy-MM-dd") },
  { id: "l3", tipo: "despesa", categoria: "Produtos", descricao: "Produtos de cabelo (Loreal)", valor: 1800, data: format(subDays(new Date(), 8), "yyyy-MM-dd") },
  { id: "l4", tipo: "despesa", categoria: "Marketing", descricao: "Tráfego pago Instagram", valor: 1200, data: format(subDays(new Date(), 12), "yyyy-MM-dd") },
  { id: "l5", tipo: "despesa", categoria: "Utilidades", descricao: "Energia elétrica", valor: 650, data: format(subDays(new Date(), 3), "yyyy-MM-dd") },
  // Receitas: atendimentos concluídos + pacotes
  ...demoAgendamentos.filter((a) => a.status === "concluido").slice(0, 70).map((a, i) => ({
    id: `lr${i}`, tipo: "receita" as const, categoria: "Atendimento", descricao: `${a.servico_nome} — ${a.cliente_nome}`,
    valor: a.valor, data: a.data, forma_pagamento: i % 3 === 0 ? "Pix" : i % 3 === 1 ? "Crédito" : "Débito",
  })),
  ...demoPacotesClientes.map((p, i) => ({
    id: `lp${i}`, tipo: "receita" as const, categoria: "Pacote", descricao: `${p.pacote_nome} — ${p.cliente_nome}`,
    valor: p.valor_pago, data: format(subDays(new Date(), i * 4 + 2), "yyyy-MM-dd"), forma_pagamento: "Crédito",
  })),
];

// AI Insights ricos com mensagem pronta
export type AIInsight = {
  id: string; severity: "alta" | "media" | "oportunidade";
  titulo: string; resumo: string;
  impacto_estimado: number; quantidade: number;
  clientes_amostra?: string[];
  mensagem_whatsapp?: string;
  acao_texto: string;
};

export const demoAIInsights: AIInsight[] = [
  {
    id: "ai1", severity: "alta", titulo: "8 clientes inativos há +45 dias",
    resumo: "Recuperáveis com uma mensagem personalizada. A maioria fechou ticket alto antes de sumir.",
    impacto_estimado: 2800, quantidade: 8,
    clientes_amostra: ["Daniela Cardoso", "Letícia Barros", "Helena Vieira", "Bruna Faria", "Eduarda Salgado", "Cláudia Pinto"],
    mensagem_whatsapp: "Oi {nome}! 💖 Faz um tempinho que não te vejo aqui no Studio Beleza Excellence! Estamos com horários livres essa semana e até uma surpresa pra você no próximo atendimento. Vem me visitar? 😊",
    acao_texto: "Disparar campanha de reativação",
  },
  {
    id: "ai2", severity: "alta", titulo: "5 clientes VIP sem retornar há +30 dias",
    resumo: "Clientes de alto ticket. Cada visita média = R$ 280. Risco de perda alto.",
    impacto_estimado: 3500, quantidade: 5,
    clientes_amostra: ["Patrícia Almeida", "Maria Silva", "Joana Pereira", "Camila Santos", "Ana Paula Souza"],
    mensagem_whatsapp: "Olá {nome}! ✨ Como VIP do Studio Beleza Excellence, separei um horário premium pra você essa semana. Posso reservar? Quero te receber com uma cortesia exclusiva. 💄",
    acao_texto: "Enviar convite premium",
  },
  {
    id: "ai3", severity: "oportunidade", titulo: "Pacote Facial converte 60% da base",
    resumo: "60% das clientes que receberam oferta de Pacote Facial Premium converteram. Vale repetir.",
    impacto_estimado: 8400, quantidade: 14,
    mensagem_whatsapp: "Oi {nome}! ✨ Acabou de chegar uma novidade que vai te encantar: nosso Pacote Facial Premium com 6 sessões. Quer conhecer com 15% de desconto exclusivo? 🌸",
    acao_texto: "Criar campanha de pacote",
  },
  {
    id: "ai4", severity: "media", titulo: "Terças 14h-16h: baixa ocupação",
    resumo: "Janela com 3 slots vagos toda semana. Promo de manicure expressa pode preencher.",
    impacto_estimado: 1200, quantidade: 3,
    acao_texto: "Criar promoção terça",
  },
  {
    id: "ai5", severity: "oportunidade", titulo: "12 aniversariantes do mês",
    resumo: "Mensagem comemorativa + 20% off em qualquer serviço. Conversão histórica: 45%.",
    impacto_estimado: 2500, quantidade: 12,
    mensagem_whatsapp: "Feliz aniversário, {nome}! 🎉 Pra comemorar, separei 20% de desconto em qualquer serviço durante o seu mês de aniversário. Vem se mimar com a gente? 💖",
    acao_texto: "Enviar mensagens de aniversário",
  },
];

// Dashboard KPIs com valores realistas
export function demoDashboardKpis() {
  const today = format(new Date(), "yyyy-MM-dd");
  const monthStart = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const hoje = demoAgendamentos.filter((a) => a.data === today);
  const mes = demoAgendamentos.filter((a) => a.data >= monthStart);
  const concluidos = mes.filter((a) => a.status === "concluido");

  // Faturamento últimos 6 meses (realista)
  const seedReceita = [28400, 32100, 35200, 31800, 36400, 38900];
  const seedDespesa = [14800, 15600, 16200, 15400, 16100, 16650];
  const chartMensal = Array.from({ length: 6 }).map((_, i) => ({
    mes: format(subMonths(new Date(), 5 - i), "MMM/yy"),
    receita: seedReceita[i],
    despesa: seedDespesa[i],
    lucro: seedReceita[i] - seedDespesa[i],
  }));

  // Top serviços
  const bySrv: Record<string, number> = {};
  demoAgendamentos.forEach((a) => { bySrv[a.servico_nome] = (bySrv[a.servico_nome] ?? 0) + 1; });
  const topServicos = Object.entries(bySrv).sort(([,a],[,b]) => b-a).slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return {
    agendamentosHoje: 24,
    agendamentosSemana: 168,
    agendamentosMes: 612,
    clientesAtivos: 487,
    receitaMes: 38900,
    despesasMes: 16650,
    lucroMes: 38900 - 16650,
    aReceber: 5200,
    ticketMedio: 178,
    pacotesAtivos: demoPacotesClientes.filter((p) => p.status === "ativo").length,
    taxaOcupacao: 82,
    taxaNoShow: 6,
    taxaRetorno: 78,
    chartMensal,
    topServicos,
    proximosHoje: hoje.sort((a,b) => a.hora.localeCompare(b.hora)),
    aniversariantes: demoClientes.slice(0, 4),
    pacotesVencendo: demoPacotesClientes.filter((p) => p.status === "ativo")
      .filter((p) => new Date(p.data_validade).getTime() - Date.now() < 15 * 86400000)
      .slice(0, 4),
    concluidosMes: concluidos.length,
  };
}
