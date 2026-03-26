import { useState, useCallback, useEffect } from "react";
import type {
  Expense,
  BudgetAllocation,
  BudgetCategory,
  Currency,
} from "@/data/budget";
import { AUD_TO_TWD_RATE, defaultBudgets } from "@/data/budget";
import {
  getAllBudgets,
  getAllExpenses,
  upsertBudget,
  insertExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense,
} from "@/lib/api";

export function useBudget() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetAllocation[]>(defaultBudgets);
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dbBudgets, dbExpenses] = await Promise.all([
          getAllBudgets(),
          getAllExpenses(),
        ]);
        if (cancelled) return;

        if (dbBudgets.length > 0) {
          setBudgets(
            dbBudgets.map((b) => ({
              category: b.category as BudgetCategory,
              budgetTWD: b.budget_twd,
            }))
          );
        }

        setExpenses(
          dbExpenses.map((e) => ({
            id: e.id,
            category: e.category as BudgetCategory,
            description: e.description,
            amount: e.amount,
            currency: e.currency as Currency,
            amountTWD: e.amount_twd,
            date: e.date,
          }))
        );
      } catch (err) {
        console.error("Failed to load from API:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addExpense = useCallback(
    async (data: {
      category: BudgetCategory;
      description: string;
      amount: number;
      currency: Currency;
      date: string;
    }) => {
      const amountTWD =
        data.currency === "AUD"
          ? Math.round(data.amount * AUD_TO_TWD_RATE)
          : data.amount;

      const created = await insertExpense({
        category: data.category,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        amount_twd: amountTWD,
        date: data.date,
      });

      const expense: Expense = {
        id: created.id,
        ...data,
        amountTWD,
      };

      setExpenses((prev) => [expense, ...prev]);
    },
    []
  );

  const editExpense = useCallback(
    async (
      id: string,
      data: {
        category: BudgetCategory;
        description: string;
        amount: number;
        currency: Currency;
        date: string;
      }
    ) => {
      const amountTWD =
        data.currency === "AUD"
          ? Math.round(data.amount * AUD_TO_TWD_RATE)
          : data.amount;

      await apiUpdateExpense(id, {
        category: data.category,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        amount_twd: amountTWD,
        date: data.date,
      });

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...data, amountTWD }
            : e
        )
      );
    },
    []
  );

  const removeExpense = useCallback(async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpense(id);
  }, []);

  const updateBudget = useCallback(
    async (category: BudgetCategory, budgetTWD: number) => {
      setBudgets((prev) =>
        prev.map((b) =>
          b.category === category ? { ...b, budgetTWD } : b
        )
      );
      await upsertBudget(category, budgetTWD);
    },
    []
  );

  const getSpentByCategory = useCallback(
    (category: BudgetCategory) => {
      return expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amountTWD, 0);
    },
    [expenses]
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetTWD, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amountTWD, 0);

  return {
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
  };
}
