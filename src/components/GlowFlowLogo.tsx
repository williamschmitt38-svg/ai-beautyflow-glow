import logo from "@/assets/glowflow-logo.png";

export function GlowFlowLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-2 ${className}`}>
    <img src={logo} alt={compact ? "GlowFlow" : ""} width={40} height={40} className="h-10 w-10 shrink-0 object-contain" />
    {!compact && <span className="font-display text-2xl font-medium leading-none">Glow<span className="italic">Flow</span></span>}
  </span>;
}