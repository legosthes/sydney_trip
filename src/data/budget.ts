export const AUD_TO_TWD_FALLBACK = 20.5;
export const RATE_REFRESH_MS = 4 * 60 * 60 * 1000; // 4 hours

let _cachedRate: number | null = null;
let _cachedAt = 0;
let _fetchPromise: Promise<number> | null = null;

export async function fetchAudToTwdRate(forceRefresh = false): Promise<number> {
  const expired = Date.now() - _cachedAt > RATE_REFRESH_MS;
  if (_cachedRate !== null && !expired && !forceRefresh) return _cachedRate;
  if (_fetchPromise && !forceRefresh) return _fetchPromise;
  _fetchPromise = (async (): Promise<number> => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/AUD");
      const data = await res.json();
      const rate: number = data.rates?.TWD ?? AUD_TO_TWD_FALLBACK;
      _cachedRate = rate;
      _cachedAt = Date.now();
      return rate;
    } catch {
      if (_cachedRate !== null) return _cachedRate;
      _cachedRate = AUD_TO_TWD_FALLBACK;
      _cachedAt = Date.now();
      return AUD_TO_TWD_FALLBACK;
    } finally {
      _fetchPromise = null;
    }
  })();
  return _fetchPromise;
}

export function getRateUpdatedAt(): number {
  return _cachedAt;
}

export type Currency = "TWD" | "AUD";

export type BudgetCategory =
  | "Flights"
  | "Transportation"
  | "Accommodation"
  | "Food"
  | "SIM Card"
  | "Tickets";

export const CATEGORY_ICONS: Record<BudgetCategory, string> = {
  Flights: "plane",
  Transportation: "car",
  Accommodation: "hotel",
  Food: "utensils",
  "SIM Card": "smartphone",
  Tickets: "ticket",
};

export const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  Flights: "#264653",
  Transportation: "#219ebc",
  Accommodation: "#2d6a4f",
  Food: "#e76f51",
  "SIM Card": "#8338ec",
  Tickets: "#f4a261",
};

export interface BudgetAllocation {
  category: BudgetCategory;
  budgetTWD: number;
}

export type ExpenseAccount = "Combined" | "Samuel" | "Ruth";

export const EXPENSE_ACCOUNTS: ExpenseAccount[] = ["Combined", "Samuel", "Ruth"];

export interface Expense {
  id: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  currency: Currency;
  amountTWD: number;
  date: string;
  account: ExpenseAccount;
}

export const defaultBudgets: BudgetAllocation[] = [
  { category: "Flights", budgetTWD: 100000 },
  { category: "Transportation", budgetTWD: 6200 },
  { category: "Accommodation", budgetTWD: 30000 },
  { category: "Food", budgetTWD: 10000 },
  { category: "SIM Card", budgetTWD: 1500 },
  { category: "Tickets", budgetTWD: 5000 },
];

export const sampleExpenses: Expense[] = [];
