import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, CalendarDays, BellRing, CreditCard, UsersRound, Check, Menu, X, Leaf, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GlowFlowLogo } from "@/components/GlowFlowLogo";
import { useAuth } from "@/hooks/useAuth";
import { billingPlans } from "@/lib/billing-plans";
import clinic from "@/assets/glowflow-clinic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "GlowFlow — Gestão para profissionais de estética e saúde" },
    { name: "description", content: "Do salão à clínica de estética: automatize sua agenda, receba pagamentos e encante seus clientes com o GlowFlow. Planos a partir de R$ 39/mês." },
    { property: "og:title", content: "GlowFlow — Beleza, bem-estar e gestão inteligente" },
    { property: "og:description", content: "Agenda online, gestão de clientes e planos para salões, clínicas de estética e massoterapeutas. Teste 14 dias grátis." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Landing,
});

const benefits = [
  { icon: CalendarDays, name: "Agenda Online 24h", text: "Seu cliente escolhe o serviço e reserva um horário, mesmo quando você está atendendo." },
  { icon: BellRing, name: "Lembretes Automáticos", text: "Mais cuidado em cada etapa, do agendamento ao próximo encontro." },
  { icon: CreditCard, name: "Pagamento via App", text: "Organização financeira para acompanhar os pagamentos e cuidar do seu negócio." },
  { icon: UsersRound, name: "Gestão de Clientes", text: "Histórico, preferências e informações reunidos para um atendimento mais próximo." },
];
const plans = [
  { key: "starter" as const, description: "O essencial para uma rotina mais leve.", features: ["Agendamento essencial", "Agenda online 24h", "Cadastro e histórico de clientes", "Link público de agendamento"] },
  { key: "pro" as const, description: "Mais presença. Mais controle. Mais possibilidades.", features: ["Tudo do Starter", "Link na Bio Personalizado", "Gestão avançada do negócio", "Pacotes e controle de sessões", "Relatórios financeiros"] },
  { key: "enterprise" as const, description: "Uma experiência à altura do seu negócio.", features: ["Tudo do Pro", "Página de Vendas Exclusiva para o seu negócio", "Gestão para operações maiores", "Suporte prioritário"] },
];
const faqs = [
  { q: "O GlowFlow é para o meu negócio?", a: "O GlowFlow foi pensado para profissionais de estética e saúde: salões, clínicas de estética, massoterapeutas e especialistas em tratamentos faciais." },
  { q: "Como funciona o teste gratuito?", a: "Crie sua conta e configure seu negócio para começar o período gratuito de 14 dias. Não é necessário cartão para iniciar o teste." },
  { q: "Preciso instalar algum programa?", a: "Não. Você acessa o GlowFlow pelo navegador, no computador ou no celular." },
  { q: "Como meus clientes agendam?", a: "Compartilhe seu link público no WhatsApp ou na bio do Instagram. Seus clientes escolhem o serviço, o profissional e um horário disponível." },
  { q: "Posso cancelar minha assinatura?", a: "Sim. Você pode gerenciar e cancelar sua assinatura na seção de cobrança da sua conta." },
];

function Landing() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!loading && user) return <Navigate to="/app/dashboard" />;
  return <div className="glow-landing bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="GlowFlow — início" className="min-w-0 justify-self-start"><GlowFlowLogo /></Link>
        <nav aria-label="Navegação principal" className="hidden items-center gap-8 text-sm lg:flex">
          <a href="#beneficios" className="transition hover:text-primary">Benefícios</a>
          <a href="#para-voce" className="transition hover:text-primary">Para quem é</a>
          <a href="#planos" className="transition hover:text-primary">Planos</a>
        </nav>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <Link to="/entrar"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link to="/entrar" search={{ tab: "signup" }} className="hidden sm:block"><Button>Começar grátis <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>
      {menuOpen && <nav aria-label="Menu móvel" className="grid gap-1 border-t px-4 py-4 lg:hidden">
        {[{ href: "#beneficios", label: "Benefícios" }, { href: "#para-voce", label: "Para quem é" }, { href: "#planos", label: "Planos" }].map((item) => <a key={item.href} href={item.href} className="py-3 text-sm" onClick={() => setMenuOpen(false)}>{item.label}</a>)}
        <Link to="/entrar" search={{ tab: "signup" }}><Button className="mt-2 w-full">Começar grátis</Button></Link>
      </nav>}
    </header>

    <section className="glow-hero relative isolate overflow-hidden bg-graphite text-on-graphite">
      <img src={clinic} alt="Profissional de estética realizando um tratamento facial em uma clínica" width={1600} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
      <div className="glow-hero-shade absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-[660px] lg:py-20">
        <div className="glow-enter max-w-xl">
          <p className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-nude"><span className="h-px w-8 bg-nude" /> Profissionais de Estética e Saúde</p>
          <p className="mb-4 font-display text-3xl italic text-nude">GlowFlow</p>
          <h1 className="font-display text-4xl font-medium leading-[1.12] sm:text-5xl lg:text-6xl">A gestão inteligente para quem transforma beleza e bem-estar.</h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-on-graphite/85 sm:text-lg">Do salão à clínica de estética: automatize sua agenda, receba pagamentos e encante seus clientes com o GlowFlow.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/entrar" search={{ tab: "signup" }}><Button size="lg" className="h-12 w-full bg-nude text-graphite hover:bg-nude/90 sm:w-auto">Começar meu teste grátis <ArrowUpRight className="ml-3 h-4 w-4" /></Button></Link>
            <Link to="/demo/dashboard"><Button size="lg" variant="outline" className="h-12 w-full border-on-graphite/40 bg-transparent text-on-graphite hover:bg-on-graphite/10 hover:text-on-graphite sm:w-auto">Conhecer o GlowFlow</Button></Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-on-graphite/75"><Check className="h-4 w-4 text-nude" /> 14 dias grátis · Sem cartão de crédito</p>
        </div>
      </div>
    </section>

    <section className="border-b bg-nude/25 px-5 py-7 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="font-display text-2xl">Você cuida das pessoas. <span className="italic text-muted-foreground">A gente cuida da gestão.</span></p>
        <span className="flex items-center gap-2 text-sm text-muted-foreground"><Leaf className="h-4 w-4" /> Mais leveza para a sua rotina</span>
      </div>
    </section>

    <section id="beneficios" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-5 md:grid-cols-2 md:items-end">
          <div><p className="mb-3 text-xs uppercase text-muted-foreground">O cuidado começa na organização</p><h2 className="max-w-lg font-display text-4xl leading-tight sm:text-5xl">Menos tarefas.<br /><span className="italic">Mais tempo para cuidar.</span></h2></div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:justify-self-end">Uma rotina organizada abre espaço para o que realmente importa: a experiência de cada cliente e o crescimento do seu negócio.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, i) => <div key={item.name} className="border-t pt-6">
            <div className="mb-6 flex items-center justify-between"><item.icon className="h-7 w-7 text-primary" /><span className="font-display text-sm text-muted-foreground">0{i + 1}</span></div>
            <h3 className="text-lg font-semibold">{item.name}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section id="para-voce" className="scroll-mt-24 border-y bg-surface px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
        <div><p className="mb-3 text-xs uppercase text-muted-foreground">Feito para o seu universo</p><h2 className="font-display text-4xl leading-tight sm:text-5xl">Cada cuidado é único.<br /><span className="italic">Seu negócio também.</span></h2><p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">Do primeiro agendamento ao próximo tratamento, o GlowFlow acompanha a sua forma de atender.</p><Link to="/entrar" search={{ tab: "signup" }}><Button variant="link" className="mt-5 h-auto p-0 text-foreground">Encontrar meu novo fluxo <ArrowRight className="ml-3 h-4 w-4" /></Button></Link></div>
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {[{ name: "Salões", text: "Beleza e organização em sintonia." }, { name: "Clínicas de Estética", text: "Uma jornada completa para cada cliente." }, { name: "Massoterapeutas", text: "Mais equilíbrio entre sessões e rotina." }, { name: "Tratamentos Faciais", text: "Cuidado contínuo, do histórico à agenda." }].map((item) => <div key={item.name} className="border-t py-6"><h3 className="font-display text-2xl">{item.name}</h3><p className="mt-2 text-sm text-muted-foreground">{item.text}</p></div>)}
        </div>
      </div>
    </section>

    <section id="planos" className="scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center"><p className="mb-3 text-xs uppercase text-muted-foreground">Um plano para cada momento</p><h2 className="font-display text-4xl sm:text-5xl">Seu próximo passo <span className="italic">começa aqui.</span></h2><p className="mt-5 text-muted-foreground">14 dias para conhecer uma rotina mais leve. Sem cartão.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => { const value = billingPlans[plan.key]; const highlight = plan.key === "pro";
            return <article key={plan.key} className={`relative flex min-w-0 flex-col rounded-lg border p-6 sm:p-8 ${highlight ? "border-graphite bg-graphite text-on-graphite" : "border-border bg-card text-card-foreground"}`}>
              <div className="mb-6 flex min-h-6 items-center justify-between gap-2"><span className={`text-xs uppercase ${highlight ? "text-nude" : "text-muted-foreground"}`}>{highlight ? "Para ir além" : plan.key === "starter" ? "Para começar" : "Para expandir"}</span>{highlight && <span className="text-xs text-nude">Nossa escolha <Leaf className="ml-1 inline h-3 w-3" /></span>}</div>
              <h3 className="font-display text-3xl">{value.name}</h3>
              <div className="mt-5 flex items-baseline gap-1"><span className="text-lg">R$</span><span className="font-display text-6xl">{value.amount}</span><span className={`ml-1 text-sm ${highlight ? "text-on-graphite/70" : "text-muted-foreground"}`}>/mês</span></div>
              <p className={`mt-4 min-h-12 text-sm leading-relaxed ${highlight ? "text-on-graphite/75" : "text-muted-foreground"}`}>{plan.description}</p>
              <div className={`my-6 border-t ${highlight ? "border-on-graphite/20" : "border-border"}`} />
              <ul className="mb-8 flex-1 space-y-4">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? "text-nude" : "text-primary"}`} /><span className="min-w-0 break-words">{feature}</span></li>)}</ul>
              <Link to="/entrar" search={{ tab: "signup" }}><Button className={`h-12 w-full ${highlight ? "bg-nude text-graphite hover:bg-nude/90" : ""}`} variant={highlight ? "default" : "outline"}>Testar {value.name} grátis <ArrowUpRight className="ml-2 h-4 w-4" /></Button></Link>
            </article>;
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Mensalidades em reais. Gerencie sua assinatura diretamente na sua conta.</p>
      </div>
    </section>

    <section className="border-t bg-surface px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]"><div><p className="mb-3 text-xs uppercase text-muted-foreground">Vamos conversar?</p><h2 className="font-display text-4xl">Tudo claro,<br /><span className="italic">desde o início.</span></h2></div><Accordion type="single" collapsible>{faqs.map((faq, i) => <AccordionItem key={faq.q} value={`faq-${i}`}><AccordionTrigger className="text-left text-base hover:no-underline">{faq.q}</AccordionTrigger><AccordionContent className="leading-relaxed text-muted-foreground">{faq.a}</AccordionContent></AccordionItem>)}</Accordion></div>
    </section>

    <section className="bg-graphite px-5 py-16 text-on-graphite sm:px-8 lg:py-20"><div className="mx-auto max-w-3xl text-center"><Leaf className="mx-auto mb-5 h-8 w-8 text-nude" /><h2 className="font-display text-4xl sm:text-5xl">Seu talento transforma vidas.<br /><span className="italic text-nude">Sua gestão pode acompanhar.</span></h2><p className="mt-5 text-on-graphite/75">Descubra um novo fluxo para o seu negócio com o GlowFlow.</p><Link to="/entrar" search={{ tab: "signup" }}><Button size="lg" className="mt-8 h-12 bg-nude text-graphite hover:bg-nude/90">Começar meus 14 dias grátis <ArrowUpRight className="ml-3 h-4 w-4" /></Button></Link><p className="mt-4 text-xs text-on-graphite/70"><CheckCircle2 className="mr-1 inline h-3 w-3" /> Sem cartão de crédito</p></div></section>
    <footer className="border-t px-5 py-8 sm:px-8"><div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><GlowFlowLogo /><p className="text-xs leading-relaxed text-muted-foreground">© {new Date().getFullYear()} GlowFlow<br />Gestão para quem cuida da beleza e do bem-estar.</p></div></footer>
  </div>;
}
