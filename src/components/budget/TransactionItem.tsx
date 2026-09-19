"use client";

import { formatWon, type Transaction } from "@/lib/budget";

export default function TransactionItem({
  tx,
  accountLabel,
  onRemove,
  highlighted,
  rowRef,
}: {
  tx: Transaction;
  accountLabel: string;
  onRemove: (id: number) => void;
  highlighted?: boolean;
  rowRef?: (el: HTMLLIElement | null) => void;
}) {
  const isIncome = tx.type === "income";
  const day = tx.spentAt.slice(5).replace("-", "/"); // MM/DD

  return (
    <li
      ref={rowRef}
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
        highlighted
          ? "border-border-strong bg-surface-alt"
          : "border-border-subtle"
      }`}
    >
      <span className="w-12 shrink-0 text-center text-xs text-text-tertiary">
        {day}
      </span>

      <span className="shrink-0 rounded bg-surface-alt px-2 py-0.5 text-xs text-text-secondary">
        {tx.category}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">
        {tx.memo || <span className="text-text-tertiary">—</span>}
      </span>

      <span className="hidden shrink-0 text-xs text-text-tertiary sm:inline">
        {accountLabel}
      </span>

      <span
        className={`shrink-0 text-sm font-medium tabular-nums ${
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatWon(tx.amount)}
      </span>

      <button
        type="button"
        onClick={() => onRemove(tx.id)}
        aria-label="삭제"
        title="삭제"
        className="shrink-0 rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100 focus:opacity-100"
      >
        🗑️
      </button>
    </li>
  );
}
