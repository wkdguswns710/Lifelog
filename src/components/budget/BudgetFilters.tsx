"use client";

import { BANKS, CATEGORIES, TX_TYPE_LABEL, type TxType } from "@/lib/budget";

export type BudgetFilterState = {
  type: TxType | "all";
  bank: string | "all";
  category: string | "all";
};

const TYPE_OPTIONS: (TxType | "all")[] = ["all", "expense", "income"];

export default function BudgetFilters({
  filters,
  onChange,
}: {
  filters: BudgetFilterState;
  onChange: (next: BudgetFilterState) => void;
}) {
  const categoryOptions =
    filters.type === "all"
      ? [...CATEGORIES.expense, ...CATEGORIES.income]
      : CATEGORIES[filters.type];

  function setType(type: TxType | "all") {
    onChange({ ...filters, type, category: "all" });
  }

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-lg bg-black/[0.02] px-3 py-2.5 dark:bg-white/[0.03]">
      <div className="flex shrink-0 rounded-md border border-black/10 p-0.5 dark:border-white/15">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs transition-colors ${
              filters.type === t
                ? "bg-foreground font-medium text-background"
                : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {t === "all" ? "전체" : TX_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <select
        value={filters.bank}
        onChange={(e) => onChange({ ...filters, bank: e.target.value })}
        aria-label="은행 필터"
        className="shrink-0 rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/15"
      >
        <option value="all" className="bg-background">
          은행 전체
        </option>
        {BANKS.map((b) => (
          <option key={b} value={b} className="bg-background">
            {b}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        aria-label="분류 필터"
        className="shrink-0 rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/15"
      >
        <option value="all" className="bg-background">
          분류 전체
        </option>
        {categoryOptions.map((c) => (
          <option key={c} value={c} className="bg-background">
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
