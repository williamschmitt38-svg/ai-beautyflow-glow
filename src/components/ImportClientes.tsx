import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { nome: string; telefone: string | null; email: string | null; data_nascimento: string | null; observacoes: string | null };

function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/)[0] ?? "";
  const sep = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = []; let row: string[] = []; let cur = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === sep) { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function toDate(v: string): string | null {
  const s = v.trim(); if (!s) return null;
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

export function ImportClientes({ salaoId }: { salaoId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFile(f?: File) {
    if (!f) return;
    const data = parseCsv(await f.text());
    const head = (data[0] ?? []).map(norm);
    const idx = (...k: string[]) => head.findIndex((h) => k.some((x) => h.includes(x)));
    const iN = idx("nome"), iT = idx("telefone", "celular", "whatsapp", "fone"), iE = idx("email", "e-mail"), iD = idx("nascimento", "aniversario"), iO = idx("observ", "nota");
    if (iN < 0) { toast.error("A planilha precisa de uma coluna 'nome'."); return; }
    const out = data.slice(1).map((r) => ({
      nome: (r[iN] ?? "").trim(),
      telefone: iT >= 0 ? r[iT]?.trim() || null : null,
      email: iE >= 0 && /\S+@\S+\.\S+/.test(r[iE] ?? "") ? r[iE].trim() : null,
      data_nascimento: iD >= 0 ? toDate(r[iD] ?? "") : null,
      observacoes: iO >= 0 ? r[iO]?.trim() || null : null,
    })).filter((r) => r.nome.length >= 2);
    setRows(out);
  }

  async function importar() {
    setBusy(true);
    try {
      for (let i = 0; i < rows.length; i += 200) {
        const { error } = await supabase.from("cliente").insert(rows.slice(i, i + 200).map((r) => ({ ...r, company_id: salaoId })));
        if (error) throw error;
      }
      toast.success(`${rows.length} clientes importados`);
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setOpen(false); setRows([]);
    } catch (e: any) { toast.error(e.message ?? "Falha na importação"); }
    finally { setBusy(false); }
  }

  function modelo() {
    const csv = "nome;telefone;email;data_nascimento;observacoes\nMaria Silva;11999998888;maria@email.com;15/03/1990;Prefere manhã\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "modelo-clientes-glowvitta.csv"; a.click();
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><Upload className="mr-2 h-4 w-4" /> Importar planilha</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setRows([]); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar clientes</DialogTitle>
            <DialogDescription>Envie um arquivo CSV (Excel → Salvar como CSV) com as colunas nome, telefone, email, data_nascimento e observacoes.</DialogDescription>
          </DialogHeader>
          <Button variant="ghost" size="sm" className="w-fit" onClick={modelo}><Download className="mr-2 h-4 w-4" /> Baixar planilha modelo</Button>
          <Input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          {rows.length > 0 && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{rows.length} clientes prontos para importar</p>
              <ul className="mt-2 max-h-32 overflow-auto text-muted-foreground">
                {rows.slice(0, 5).map((r, i) => <li key={i}>{r.nome}{r.telefone ? ` · ${r.telefone}` : ""}</li>)}
                {rows.length > 5 && <li>… e mais {rows.length - 5}</li>}
              </ul>
            </div>
          )}
          <Button disabled={!rows.length || busy} onClick={importar}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Importar {rows.length || ""} clientes
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
