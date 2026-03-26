export const AUD_TO_TWD_RATE = 20.5;

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

export interface Expense {
  id: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  currency: Currency;
  amountTWD: number;
  date: string;
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
