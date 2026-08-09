// Hardcoded demo data for /demo/* showcase. Values are intentionally fixed
// (not computed) so the dashboard reads the exact same numbers every render.

export const demoKpis = {
  agendamentosHoje: 24,
  agendamentosSemana: 168,
  agendamentosMes: 612,
  clientesAtivos: 487,
  receitaMes: 38900,
  despesasMes: 16650,
  lucroMes: 22250,
  aReceber: 5200,
  ticketMedio: 178,
  taxaOcupacao: 82,
  noShowRate: 6,
  taxaRetorno: 78,
  pacotesAtivos: 23,
  aniversariantesMes: 12,
};

export const demoReceitaMensal = [
  { mes: "Out", receita: 28400, despesa: 14800 },
  { mes: "Nov", receita: 32200, despesa: 15600 },
  { mes: "Dez", receita: 35800, despesa: 16200 },
  { mes: "Jan", receita: 31900, despesa: 15400 },
  { mes: "Fev", receita: 36200, despesa: 16100 },
  { mes: "Mar", receita: 38900, despesa: 16650 },
];

export type DemoAgendamentoHoje = {
  hora: string;
  cliente: string;
  servico: string;
  profissional: string;
  profCor: string;
  status: "concluido" | "em_atendimento" | "chegou" | "confirmado" | "agendado" | "cancelado";
  valor: number;
};

const PROF = [
  { nome: "Ana Carolina", cor: "#F43F5E" },
  { nome: "Carla Mendes", cor: "#EC4899" },
  { nome: "Paula Souza", cor: "#8B5CF6" },
  { nome: "Beatriz Lima", cor: "#10B981" },
  { nome: "Juliana Costa", cor: "#F59E0B" },
];

export const demoAgendamentosHoje: DemoAgendamentoHoje[] = [
  { hora: "09:00", cliente: "Maria Silva", servico: "Corte + Escova", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "concluido", valor: 120 },
  { hora: "09:30", cliente: "Joana Pereira", servico: "Coloração Completa", profissional: "Carla Mendes", profCor: PROF[1].cor, status: "em_atendimento", valor: 220 },
  { hora: "10:00", cliente: "Fernanda Lima", servico: "Manicure", profissional: "Paula Souza", profCor: PROF[2].cor, status: "em_atendimento", valor: 50 },
  { hora: "10:30", cliente: "Beatriz Costa", servico: "Hidratação", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "confirmado", valor: 120 },
  { hora: "11:00", cliente: "Patrícia Almeida", servico: "Design Sobrancelha", profissional: "Beatriz Lima", profCor: PROF[3].cor, status: "confirmado", valor: 45 },
  { hora: "11:30", cliente: "Camila Santos", servico: "Pedicure", profissional: "Paula Souza", profCor: PROF[2].cor, status: "chegou", valor: 60 },
  { hora: "12:00", cliente: "Renata Castro", servico: "Limpeza de Pele", profissional: "Juliana Costa", profCor: PROF[4].cor, status: "confirmado", valor: 180 },
  { hora: "13:00", cliente: "Larissa Oliveira", servico: "Cílios Volume", profissional: "Beatriz Lima", profCor: PROF[3].cor, status: "confirmado", valor: 160 },
  { hora: "13:30", cliente: "Sabrina Duarte", servico: "Coloração + Corte", profissional: "Carla Mendes", profCor: PROF[1].cor, status: "confirmado", valor: 290 },
  { hora: "14:00", cliente: "Helena Vieira", servico: "Escova Progressiva", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "confirmado", valor: 350 },
  { hora: "14:30", cliente: "Bruna Faria", servico: "Manicure + Pedicure", profissional: "Paula Souza", profCor: PROF[2].cor, status: "agendado", valor: 110 },
  { hora: "15:00", cliente: "Daniela Cardoso", servico: "Hidratação Premium", profissional: "Carla Mendes", profCor: PROF[1].cor, status: "agendado", valor: 180 },
  { hora: "15:30", cliente: "Letícia Barros", servico: "Corte Feminino", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "agendado", valor: 90 },
  { hora: "16:00", cliente: "Mariana Rocha", servico: "Cílios Clássico", profissional: "Beatriz Lima", profCor: PROF[3].cor, status: "agendado", valor: 120 },
  { hora: "16:30", cliente: "Eduarda Salgado", servico: "Coloração Retoque", profissional: "Carla Mendes", profCor: PROF[1].cor, status: "agendado", valor: 150 },
  { hora: "17:00", cliente: "Cláudia Pinto", servico: "Manicure", profissional: "Paula Souza", profCor: PROF[2].cor, status: "agendado", valor: 50 },
  { hora: "17:00", cliente: "Juliana Ramos", servico: "Design Sobrancelha", profissional: "Beatriz Lima", profCor: PROF[3].cor, status: "agendado", valor: 45 },
  { hora: "17:30", cliente: "Aline Tavares", servico: "Escova", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "agendado", valor: 70 },
  { hora: "18:00", cliente: "Vanessa Brito", servico: "Limpeza de Pele", profissional: "Juliana Costa", profCor: PROF[4].cor, status: "agendado", valor: 180 },
  { hora: "18:00", cliente: "Tatiana Moura", servico: "Coloração Completa", profissional: "Carla Mendes", profCor: PROF[1].cor, status: "agendado", valor: 220 },
  { hora: "18:30", cliente: "Roberta Nunes", servico: "Corte + Escova", profissional: "Ana Carolina", profCor: PROF[0].cor, status: "agendado", valor: 120 },
  { hora: "19:00", cliente: "Simone Diniz", servico: "Pedicure Spa", profissional: "Paula Souza", profCor: PROF[2].cor, status: "agendado", valor: 90 },
  { hora: "19:00", cliente: "Karen Lobo", servico: "Hidratação", profissional: "Juliana Costa", profCor: PROF[4].cor, status: "agendado", valor: 120 },
  { hora: "19:30", cliente: "Priscila Mota", servico: "Cílios Volume", profissional: "Beatriz Lima", profCor: PROF[3].cor, status: "agendado", valor: 160 },
];

export const demoServicosTop = [
  { nome: "Corte + Escova", total: 92, receita: 11040 },
  { nome: "Coloração", total: 64, receita: 11520 },
  { nome: "Manicure", total: 145, receita: 6525 },
  { nome: "Hidratação", total: 38, receita: 3610 },
  { nome: "Extensão Cílios", total: 18, receita: 3240 },
];

export const demoAniversariantesSemana = [
  { nome: "Patrícia Almeida", data: "27/05", idade: 34 },
  { nome: "Camila Santos", data: "28/05", idade: 29 },
  { nome: "Larissa Oliveira", data: "29/05", idade: 31 },
  { nome: "Helena Vieira", data: "30/05", idade: 27 },
  { nome: "Bruna Faria", data: "31/05", idade: 38 },
];
