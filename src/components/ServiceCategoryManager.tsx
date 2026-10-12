import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServiceCategories, type ServiceCategory } from "@/hooks/useServiceCategories";
import { FormDialog } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ServiceCategoryManager({ salaoId, open, onOpenChange }: { salaoId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories = [], isLoading, error } = useServiceCategories(salaoId);
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [removing, setRemoving] = useState<ServiceCategory | null>(null);
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["service-categories", salaoId] });
    void qc.invalidateQueries({ queryKey: ["servicos", salaoId] });
    void qc.invalidateQueries({ queryKey: ["public-salao"] });
  };
  const save = useMutation({
    mutationFn: async () => {
      const name = nome.trim();
      if (!name || name.length > 80) throw new Error("Informe um nome com até 80 caracteres.");
      const result = editing
        ? await supabase.from("servico_categoria").update({ nome: name }).eq("id", editing.id).eq("company_id", salaoId).select("id").single()
        : await supabase.from("servico_categoria").insert({ nome: name, company_id: salaoId }).select("id").single();
      if (result.error) throw result.error;
    },
    onSuccess: () => { refresh(); setNome(""); setEditing(null); toast.success("Categoria salva"); },
    onError: (e: Error & { code?: string }) => toast.error(e.code === "23505" ? "Já existe uma categoria com esse nome." : e.message),
  });
  const del = useMutation({
    mutationFn: async (category: ServiceCategory) => {
      const { error } = await supabase.from("servico_categoria").delete().eq("id", category.id).eq("company_id", salaoId).select("id").single();
      if (error) throw error;
    },
    onSuccess: (_, category) => {
      refresh(); setRemoving(null);
      if (editing?.id === category.id) { setEditing(null); setNome(""); }
      toast.success("Categoria excluída");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return <>
    <FormDialog open={open} onOpenChange={onOpenChange} title="Gerenciar Categorias">
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
        <Label htmlFor="category-name">{editing ? "Editar categoria" : "Nova categoria"}</Label>
        <div className="flex gap-2">
          <Input id="category-name" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required placeholder="Nome da categoria" />
          <Button type="submit" disabled={save.isPending || !nome.trim()}>{editing ? "Salvar" : <><Plus className="mr-1 h-4 w-4" /> Criar</>}</Button>
          {editing && <Button type="button" variant="ghost" size="icon" aria-label="Cancelar edição" onClick={() => { setEditing(null); setNome(""); }}><X className="h-4 w-4" /></Button>}
        </div>
      </form>
      {isLoading && <p className="text-sm text-muted-foreground">Carregando categorias…</p>}
      {error && <p className="text-sm text-destructive">Não foi possível carregar as categorias.</p>}
      <ul className="divide-y">
        {categories.map((category) => <li key={category.id} className="flex items-center justify-between gap-2 py-2">
          <span className="min-w-0 break-words text-sm">{category.nome}</span>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" aria-label={`Editar ${category.nome}`} onClick={() => { setEditing(category); setNome(category.nome); }}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label={`Excluir ${category.nome}`} disabled={del.isPending} onClick={() => setRemoving(category)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </li>)}
      </ul>
      {!isLoading && !error && categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>}
    </FormDialog>
    <AlertDialog open={!!removing} onOpenChange={(value) => { if (!value && !del.isPending) setRemoving(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Excluir {removing?.nome}?</AlertDialogTitle><AlertDialogDescription>Os serviços serão mantidos, mas ficarão sem categoria.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={del.isPending}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={del.isPending} onClick={(e) => { e.preventDefault(); if (removing) del.mutate(removing); }}>Excluir categoria</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}