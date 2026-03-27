import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  PencilLine,
  X,
  CheckSquare,
  Square,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHero } from "@/components/PageHero";
import { useToast } from "@/components/Toast";
import {
  getAllChecklist,
  insertChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  type ChecklistItemRow,
} from "@/lib/api";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const CHECKLIST_CATEGORIES = [
  "Documents",
  "Clothing",
  "Toiletries",
  "Baby Items",
  "Electronics",
  "Miscellaneous",
];

interface ItemForm {
  text: string;
  category: string;
}

const emptyForm: ItemForm = { text: "", category: "Miscellaneous" };

export function Checklist() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemForm>(emptyForm);

  useEffect(() => {
    getAllChecklist().then((rows) => {
      setItems(rows);
      setLoading(false);
    });
  }, []);

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progressPct = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  // Group by category
  const grouped = CHECKLIST_CATEGORIES.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  // Items with unknown category
  const ungrouped = items.filter(
    (i) => !CHECKLIST_CATEGORIES.includes(i.category || "")
  );
  if (ungrouped.length > 0) {
    grouped.push({ category: "Other", items: ungrouped });
  }

  const toggleItem = async (item: ChecklistItemRow) => {
    const newChecked = item.checked ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i))
    );
    await updateChecklistItem(item.id, { checked: newChecked });
    toast(
      newChecked ? `${item.text} ${t("checklist.checked")}` : `${item.text} ${t("checklist.unchecked")}`,
      "checked"
    );
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ChecklistItemRow) => {
    setEditingId(item.id);
    setFormData({ text: item.text, category: item.category || "Miscellaneous" });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.text) return;
    if (editingId) {
      const updated = await updateChecklistItem(editingId, {
        text: formData.text,
        category: formData.category,
      });
      setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      toast(t("toast.itemUpdated"), "updated");
    } else {
      const created = await insertChecklistItem({
        text: formData.text,
        category: formData.category,
        sort_order: 99,
      });
      setItems((prev) => [...prev, created]);
      toast(t("toast.itemAdded"), "created");
    }
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteChecklistItem(id);
    toast(t("toast.itemDeleted"), "deleted");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-8">
      <PageHero
        image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&q=80"
        badge="Sydney 2026"
        title={t("checklist.title")}
        subtitle={t("checklist.subtitle")}
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 transition-colors w-fit"
          >
            <Plus className="h-4 w-4" /> {t("checklist.addItem")}
          </button>
        }
      />

      {/* Progress */}
      <div className="animate-in" style={{ animationFillMode: "both" }}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{t("checklist.progress")}</p>
              <p className="text-sm text-muted-foreground">
                {checkedItems} / {totalItems} {t("checklist.packed")}
              </p>
            </div>
            <Progress value={progressPct} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => { setDialogOpen(false); setEditingId(null); }} role="presentation" />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingId ? t("checklist.editItem") : t("checklist.addItem")}
              </h2>
              <button type="button" onClick={() => { setDialogOpen(false); setEditingId(null); }} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="cl-text" className="text-sm font-medium">{t("checklist.itemText")}</label>
                <input id="cl-text" type="text" required value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cl-cat" className="text-sm font-medium">{t("checklist.category")}</label>
                <select id="cl-cat" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                  {CHECKLIST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                {editingId ? t("checklist.save") : t("checklist.addItem")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checklist Groups — two-column grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {grouped.map((group, gi) => {
          const groupChecked = group.items.filter((i) => i.checked).length;
          return (
            <div key={group.category} className="animate-in" style={{ animationDelay: `${80 + gi * 80}ms`, animationFillMode: "both" }}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-semibold text-base font-heading">{group.category}</h2>
                <Badge variant="secondary" className="text-xs">
                  {groupChecked}/{group.items.length}
                </Badge>
              </div>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-0">
                  {group.items.map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <Separator />}
                      <div className="flex items-center gap-3 p-3 sm:p-4">
                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className="flex-shrink-0 text-primary hover:text-primary/70 transition-all duration-200 active:scale-90"
                        >
                          {item.checked ? (
                            <CheckSquare className="h-5 w-5 transition-transform duration-200 scale-110" />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground transition-transform duration-200 hover:scale-110" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            item.checked && "line-through text-muted-foreground"
                          )}
                        >
                          {item.text}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors" onClick={() => openEdit(item)}>
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {totalItems === 0 && (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">{t("checklist.noItems")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
