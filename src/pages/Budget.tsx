import { useState } from "react";
import {
  Utensils,
  Car,
  Hotel,
  Plane,
  Smartphone,
  Ticket,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  PencilLine,
  Check,
  X,
  Loader2,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useBudget } from "@/hooks/useBudget";
import { PageHero } from "@/components/PageHero";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n/LanguageContext";
import type { BudgetCategory, Currency } from "@/data/budget";
import { AUD_TO_TWD_RATE, CATEGORY_COLORS } from "@/data/budget";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  Flights: Plane,
  Transportation: Car,
  Accommodation: Hotel,
  Food: Utensils,
  "SIM Card": Smartphone,
  Tickets: Ticket,
};

const CATEGORIES: BudgetCategory[] = [
  "Flights",
  "Transportation",
  "Accommodation",
  "Food",
  "SIM Card",
  "Tickets",
];

function formatTWD(amount: number) {
  return `NT$${amount.toLocaleString()}`;
}

interface ExpenseFormData {
  category: BudgetCategory;
  description: string;
  amount: string;
  currency: Currency;
  date: string;
}

const emptyForm: ExpenseFormData = {
  category: "Food",
  description: "",
  amount: "",
  currency: "AUD",
  date: "2026-07-22",
};

export function Budget() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    expenses,
    budgets,
    loading,
    addExpense,
    editExpense,
    removeExpense,
    updateBudget,
    getSpentByCategory,
    totalBudget,
    totalSpent,
  } = useBudget();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(emptyForm);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const remaining = totalBudget - totalSpent;
  const spentPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const exportCsv = () => {
    const header = "Date,Category,Description,Amount,Currency,Amount (TWD)";
    const rows = expenses.map((e) =>
      [e.date, e.category, `"${e.description.replace(/"/g, '""')}"`, e.amount, e.currency, e.amountTWD].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sydney_trip_expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openAddDialog = () => {
    setEditingExpenseId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (expense: typeof expenses[0]) => {
    setEditingExpenseId(expense.id);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      date: expense.date,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.amount) return;
    const data = { ...formData, amount: parseFloat(formData.amount) };

    if (editingExpenseId) {
      editExpense(editingExpenseId, data);
      toast(t("toast.expenseUpdated"), "updated");
    } else {
      addExpense(data);
      toast(t("toast.expenseAdded"), "created");
    }
    setFormData(emptyForm);
    setDialogOpen(false);
    setEditingExpenseId(null);
  };

  const handleSaveBudget = (category: BudgetCategory) => {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      updateBudget(category, val);
      toast(t("toast.budgetUpdated"), "updated");
    }
    setEditingBudget(null);
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
        image="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1400&q=80"
        badge="Sydney 2026"
        title={t("budget.title")}
        subtitle={`${t("budget.subtitle")} ${AUD_TO_TWD_RATE} ${t("budget.twd")}`}
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openAddDialog}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {t("budget.addExpense")}
            </button>
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 border-2 border-white/50 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" /> {t("budget.exportCsv")}
              </button>
            )}
          </div>
        }
      />

      {/* Add/Edit Expense Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={() => { setDialogOpen(false); setEditingExpenseId(null); }} role="presentation" />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingExpenseId ? t("budget.editExpense") : t("budget.addNewExpense")}
              </h2>
              <button type="button" onClick={() => { setDialogOpen(false); setEditingExpenseId(null); }} className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="exp-cat" className="text-sm font-medium">{t("budget.category")}</label>
                <select id="exp-cat" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="exp-desc" className="text-sm font-medium">{t("budget.descriptionOptional")}</label>
                <input id="exp-desc" type="text" placeholder="e.g. Dinner at Darling Harbour" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="exp-amt" className="text-sm font-medium">{t("budget.amount")}</label>
                  <input id="exp-amt" type="number" required min="0" step="0.01" placeholder="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="exp-cur" className="text-sm font-medium">{t("budget.currency")}</label>
                  <select id="exp-cur" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="AUD">AUD</option>
                    <option value="TWD">TWD</option>
                  </select>
                </div>
              </div>
              {formData.amount && formData.currency === "AUD" && (
                <p className="text-sm text-muted-foreground">
                  ≈ {formatTWD(Math.round(parseFloat(formData.amount || "0") * AUD_TO_TWD_RATE))}
                </p>
              )}
              <div className="space-y-1.5">
                <label htmlFor="exp-date" className="text-sm font-medium">{t("budget.date")}</label>
                <input id="exp-date" type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                {editingExpenseId ? t("budget.save") : t("budget.addExpense")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3"><Wallet className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t("budget.totalBudget")}</p>
                <p className="text-xl font-bold">{formatTWD(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-chart-3/10 p-3"><TrendingUp className="h-5 w-5 text-chart-3" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{t("budget.totalSpent")}</p>
                <p className="text-xl font-bold">{formatTWD(totalSpent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn("border-border/50 shadow-sm", remaining < 0 && "border-destructive/50")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-xl p-3", remaining >= 0 ? "bg-primary/10" : "bg-destructive/10")}>
                <TrendingDown className={cn("h-5 w-5", remaining >= 0 ? "text-primary" : "text-destructive")} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("budget.remaining")}</p>
                <p className={cn("text-xl font-bold", remaining < 0 && "text-destructive")}>{formatTWD(remaining)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">{t("budget.overallSpending")}</p>
            <p className="text-sm text-muted-foreground">{spentPct.toFixed(0)}% {t("budget.used")}</p>
          </div>
          <Progress value={spentPct} className="h-3" />
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">{t("budget.categoryBudgets")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const Icon = categoryIcons[b.category] || Wallet;
            const spent = getSpentByCategory(b.category);
            const pct = b.budgetTWD > 0 ? Math.min((spent / b.budgetTWD) * 100, 100) : 0;
            const catRemaining = b.budgetTWD - spent;
            const isEditing = editingBudget === b.category;
            return (
              <Card key={b.category} className="border-border/50 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl p-2.5" style={{ backgroundColor: `${CATEGORY_COLORS[b.category]}15` }}>
                        <Icon className="h-4 w-4" style={{ color: CATEGORY_COLORS[b.category] }} />
                      </div>
                      <span className="font-semibold text-sm">{b.category}</span>
                    </div>
                    {!isEditing ? (
                      <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors" onClick={() => { setEditingBudget(b.category); setEditValue(b.budgetTWD.toString()); }}>
                        <PencilLine className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors" onClick={() => handleSaveBudget(b.category)}>
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </button>
                        <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors" onClick={() => setEditingBudget(null)}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm" onKeyDown={(e) => { if (e.key === "Enter") handleSaveBudget(b.category); if (e.key === "Escape") setEditingBudget(null); }} autoFocus />
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{formatTWD(spent)} / {formatTWD(b.budgetTWD)}</span>
                        <span className={cn("font-medium", catRemaining < 0 ? "text-destructive" : "text-primary")}>
                          {catRemaining >= 0 ? formatTWD(catRemaining) : `-${formatTWD(Math.abs(catRemaining))}`}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" style={{ "--progress-color": pct > 90 ? "#ef4444" : CATEGORY_COLORS[b.category] } as React.CSSProperties} />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Expense List */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">{t("budget.expenses")}</h2>
          <Badge variant="secondary">{expenses.length} {t("budget.items")}</Badge>
        </div>
        {expenses.length === 0 ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4"><Wallet className="h-6 w-6 text-muted-foreground" /></div>
              <p className="font-medium text-muted-foreground">{t("budget.noExpenses")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("budget.noExpensesHint")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              {expenses.map((expense, i) => {
                const Icon = categoryIcons[expense.category] || Wallet;
                return (
                  <div key={expense.id}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                      <div className="rounded-xl p-2 sm:p-2.5 flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}15` }}>
                        <Icon className="h-4 w-4" style={{ color: CATEGORY_COLORS[expense.category] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{expense.description || expense.category}</p>
                        <p className="text-xs text-muted-foreground">{expense.date} · {expense.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">
                          {expense.currency === "AUD" ? `A$${expense.amount}` : formatTWD(expense.amount)}
                        </p>
                        {expense.currency === "AUD" && (
                          <p className="text-xs text-muted-foreground">≈ {formatTWD(expense.amountTWD)}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors" onClick={() => openEditDialog(expense)}>
                          <PencilLine className="h-4 w-4" />
                        </button>
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors" onClick={() => { removeExpense(expense.id); toast(t("toast.expenseDeleted"), "deleted"); }}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
