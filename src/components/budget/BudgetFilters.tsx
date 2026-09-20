"use client";

import { CATEGORIES, TX_TYPE_LABEL, type TxType } from "@/lib/budget";
import { formatAccountLabel, type Account } from "@/lib/accounts";

export type BudgetFilterState = {
  type: TxType | "all";
  accountId: number | "all";
  category: string | "all";
};

const TYPE_OPTIONS: (TxType | "all")[] = ["all", "expense", "income"];

export default function BudgetFilters({
  filters,
  accounts,
  onChange,
}: {
  filters: BudgetFilterState;
  accounts: Account[];
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
    <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded bg-surface-alt px-3 py-2.5">
      <div className="flex shrink-0 rounded border border-border-subtle p-0.5">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs transition-colors duration-300 ${
              filters.type === t
                ? "bg-background font-medium text-foreground"
                : "text-text-secondary hover:bg-background"
            }`}
          >
            {t === "all" ? "전체" : TX_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <select
        value={filters.accountId}
        onChange={(e) =>
          onChange({
            ...filters,
            accountId: e.target.value === "all" ? "all" : Number(e.target.value),
          })
        }
        aria-label="계좌 필터"
        className="shrink-0 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
      >
        <option value="all" className="bg-background">
          계좌 전체
        </option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id} className="bg-background">
            {formatAccountLabel(a)}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        aria-label="분류 필터"
        className="shrink-0 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
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
