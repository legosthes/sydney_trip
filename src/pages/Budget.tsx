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
import { Input } from "@/components/ui/input";
import { useBudget } from "@/hooks/useBudget";
import { PageHero } from "@/components/PageHero";
import { useToast } from "@/components/Toast";
import { useTranslation } from "@/i18n/LanguageContext";
import type { BudgetCategory, Currency, ExpenseAccount } from "@/data/budget";
import { CATEGORY_COLORS, EXPENSE_ACCOUNTS } from "@/data/budget";
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
  account: ExpenseAccount;
}

const emptyForm: ExpenseFormData = {
  category: "Food",
  description: "",
  amount: "",
  currency: "AUD",
  date: "2026-07-22",
  account: "Combined",
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
    audToTwdRate,
    rateUpdatedAt,
  } = useBudget();

  const rateTimestamp = rateUpdatedAt
    ? (() => {
        const d = new Date(rateUpdatedAt);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(emptyForm);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const remaining = totalBudget - totalSpent;
  const spentPct =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const exportCsv = () => {
    const header = "Date,Category,Description,Account,Amount,Currency,Amount (TWD)";
    const rows = expenses.map((e) =>
      [
        e.date,
        e.category,
        `"${e.description.replace(/"/g, '""')}"`,
        e.account,
        e.amount,
        e.currency,
        e.amountTWD,
      ].join(","),
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

  const openEditDialog = (expense: (typeof expenses)[0]) => {
    setEditingExpenseId(expense.id);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      date: expense.date,
      account: expense.account,
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
        subtitle={t("budget.subtitleShort")}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAddDialog}
              className="inline-flex items-center gap-2 rounded-full bg-white text-foreground pl-4 pr-1.5 py-1.5 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              {t("budget.addExpense")}
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </button>
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> {t("budget.exportCsv")}
              </button>
            )}
          </div>
        }
      />

      {/* Add/Edit Expense Modal */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setDialogOpen(false);
              setEditingExpenseId(null);
            }}
            role="presentation"
          />
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover p-6 shadow-xl ring-1 ring-foreground/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editingExpenseId
                  ? t("budget.editExpense")
                  : t("budget.addNewExpense")}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingExpenseId(null);
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="exp-cat" className="text-sm font-medium">
                  {t("budget.category")}
                </label>
                <select
                  id="exp-cat"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as BudgetCategory,
                    })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="exp-account" className="text-sm font-medium">
                  {t("budget.account")}
                </label>
                <select
                  id="exp-account"
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      account: e.target.value as ExpenseAccount,
                    })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {EXPENSE_ACCOUNTS.map((a) => (
                    <option key={a} value={a}>
                      {a === "Combined" ? t("budget.accountCombined") : a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="exp-desc" className="text-sm font-medium">
                  {t("budget.descriptionOptional")}
                </label>
                <input
                  id="exp-desc"
                  type="text"
                  placeholder="e.g. Dinner at Darling Harbour"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="exp-amt" className="text-sm font-medium">
                    {t("budget.amount")}
                  </label>
                  <input
                    id="exp-amt"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="exp-cur" className="text-sm font-medium">
                    {t("budget.currency")}
                  </label>
                  <select
                    id="exp-cur"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value as Currency,
                      })
                    }
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="AUD">AUD</option>
                    <option value="TWD">TWD</option>
                  </select>
                </div>
              </div>
              {formData.amount && formData.currency === "AUD" && (
                <p className="text-sm text-muted-foreground">
                  ≈{" "}
                  {formatTWD(
                    Math.round(
                      parseFloat(formData.amount || "0") * audToTwdRate,
                    ),
                  )}
                </p>
              )}
              <div className="space-y-1.5">
                <label htmlFor="exp-date" className="text-sm font-medium">
                  {t("budget.date")}
                </label>
                <input
                  id="exp-date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {editingExpenseId ? t("budget.save") : t("budget.addExpense")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Account block ───────────────────────────────── */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-10 animate-in">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] font-numeric text-muted-foreground">
            Jul 21 <span aria-hidden>→</span> Jul 28
          </span>
          <span className="eyebrow">{t("budget.accountDetails")}</span>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Hero number */}
          <div className="md:col-span-7 space-y-3">
            <p className="bracket-label">{t("budget.totalBudget")}</p>
            <p className="font-stat text-[clamp(48px,7vw,104px)] tracking-tighter">
              {formatTWD(totalBudget)}
            </p>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                1 AUD = {audToTwdRate}
              </span>
              {rateTimestamp && (
                <span className="text-xs text-muted-foreground">
                  Updated {rateTimestamp}
                </span>
              )}
            </div>
          </div>

          {/* Side stats */}
          <div className="md:col-span-5 grid grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden self-start">
            <div className="bg-card p-4 space-y-1">
              <p className="bracket-label">{t("budget.totalSpent")}</p>
              <p className="font-stat text-2xl">{formatTWD(totalSpent)}</p>
              <div className="flex items-center gap-1 text-[11px] text-chart-3">
                <TrendingUp className="h-3 w-3" strokeWidth={2} />
                {spentPct.toFixed(0)}% {t("budget.used")}
              </div>
            </div>
            <div className="bg-card p-4 space-y-1">
              <p className="bracket-label">{t("budget.remaining")}</p>
              <p
                className={cn(
                  "font-stat text-2xl",
                  remaining < 0 && "text-destructive",
                )}
              >
                {remaining >= 0
                  ? formatTWD(remaining)
                  : `-${formatTWD(Math.abs(remaining))}`}
              </p>
              <div
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  remaining < 0 ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <TrendingDown className="h-3 w-3" strokeWidth={2} />
                {Math.max(0, 100 - spentPct).toFixed(0)}% {t("budget.left")}
              </div>
            </div>
          </div>
        </div>

        {/* Big progress */}
        <div className="mt-8 space-y-2">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${Math.min(spentPct, 100)}%`,
                transition: "width 600ms var(--ease-out-quint)",
                backgroundColor:
                  remaining < 0
                    ? "var(--destructive)"
                    : spentPct >= 90
                      ? "var(--accent-warm)"
                      : "var(--foreground)",
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground font-numeric">
            <span>
              {formatTWD(totalSpent)} {t("budget.totalSpent").toLowerCase()}
            </span>
            <span>
              {formatTWD(totalBudget)} {t("budget.totalBudget").toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      {/* ── Category cards ──────────────────────────────── */}
      <section
        className="animate-in"
        style={{ animationDelay: "120ms", animationFillMode: "both" }}
      >
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-xl tracking-tight">
            {t("budget.categoryBudgets")}
          </h2>
          <span className="eyebrow">
            {budgets.length} {t("budget.categories")}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
          {budgets.map((b) => {
            const Icon = categoryIcons[b.category] || Wallet;
            const spent = getSpentByCategory(b.category);
            const pct =
              b.budgetTWD > 0 ? Math.min((spent / b.budgetTWD) * 100, 100) : 0;
            const catRemaining = b.budgetTWD - spent;
            const isEditing = editingBudget === b.category;
            const accent = CATEGORY_COLORS[b.category];
            const over = catRemaining < 0;

            return (
              <article
                key={b.category}
                className="rounded-2xl border border-border bg-card p-5 hover:border-foreground/30 transition-colors"
              >
                <header className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span className="text-xs font-medium">{b.category}</span>
                  </div>
                  {!isEditing ? (
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setEditingBudget(b.category);
                        setEditValue(b.budgetTWD.toString());
                      }}
                      aria-label="Edit budget"
                    >
                      <PencilLine className="h-3 w-3" />
                    </button>
                  ) : (
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
                        onClick={() => handleSaveBudget(b.category)}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        onClick={() => setEditingBudget(null)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </header>

                {isEditing ? (
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-9 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveBudget(b.category);
                      if (e.key === "Escape") setEditingBudget(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    {/* Big spent number */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <Icon
                        className="h-4 w-4 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                      <span
                        className="font-stat text-3xl sm:text-[36px]"
                        style={{
                          color: over
                            ? "var(--destructive)"
                            : pct >= 90
                              ? "var(--accent-warm)"
                              : "var(--foreground)",
                        }}
                      >
                        {formatTWD(spent)}
                      </span>
                    </div>

                    {/* Thick bar */}
                    <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-secondary mb-2">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: over
                            ? "var(--destructive)"
                            : pct >= 90
                              ? "var(--accent-warm)"
                              : accent,
                          transition: "width 600ms var(--ease-out-quint)",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-numeric">
                      <span>
                        {t("overview.of")} {formatTWD(b.budgetTWD)}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          over ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {over
                          ? `-${formatTWD(Math.abs(catRemaining))}`
                          : `${formatTWD(catRemaining)} ${t("budget.left").toLowerCase()}`}
                      </span>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Expenses as rows ────────────────────────────── */}
      <section
        className="animate-in"
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-xl tracking-tight">
            {t("budget.expenses")}
          </h2>
          <span className="eyebrow">
            {expenses.length} {t("budget.items")}
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
            <Wallet
              className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="font-heading text-base">{t("budget.noExpenses")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("budget.noExpensesHint")}
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden"
            data-reveal
          >
            <ul className="divide-y divide-border">
              {expenses.map((expense) => {
                const Icon = categoryIcons[expense.category] || Wallet;
                const accent = CATEGORY_COLORS[expense.category];
                return (
                  <li
                    key={expense.id}
                    className="group/expense px-5 py-4 sm:px-6 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                        style={{ backgroundColor: `${accent}15` }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: accent }}
                          strokeWidth={1.75}
                        />
                      </span>
                      <div className="flex-1 min-w-0 sm:flex-none sm:w-44">
                        <p className="font-medium text-sm truncate">
                          {expense.category}
                        </p>
                        <p className="text-xs text-muted-foreground font-numeric mt-0.5 truncate">
                          {[
                            expense.date,
                            expense.account !== "Combined"
                              ? expense.account
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      {/* Description column (own line below on mobile) */}
                      <p className="hidden sm:block flex-1 min-w-0 truncate text-sm text-muted-foreground">
                        {expense.description || "—"}
                      </p>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-semibold text-sm">
                          {expense.currency === "AUD"
                            ? `A$${expense.amount}`
                            : formatTWD(expense.amount)}
                        </p>
                        {expense.currency === "AUD" && (
                          <p className="text-xs text-muted-foreground font-numeric">
                            ≈ {formatTWD(expense.amountTWD)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-0.5 shrink-0 opacity-0 group-hover/expense:opacity-100 pointer-coarse:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => openEditDialog(expense)}
                          aria-label="Edit expense"
                        >
                          <PencilLine className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          onClick={() => {
                            removeExpense(expense.id);
                            toast(t("toast.expenseDeleted"), "deleted");
                          }}
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {/* Description as its own line on mobile */}
                    {expense.description && (
                      <p className="sm:hidden mt-1.5 pl-12 text-sm text-muted-foreground">
                        {expense.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
