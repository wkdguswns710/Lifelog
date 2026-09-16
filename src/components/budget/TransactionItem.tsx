"use client";

import { formatWon, type Transaction } from "@/lib/budget";

export default function TransactionItem({
  tx,
  onRemove,
  highlighted,
  rowRef,
}: {
  tx: Transaction;
  onRemove: (id: string) => void;
  highlighted?: boolean;
  rowRef?: (el: HTMLLIElement | null) => void;
}) {
  const isIncome = tx.type === "income";
  const day = tx.spentAt.slice(5).replace("-", "/"); // MM/DD

  return (
    <li
      ref={rowRef}
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
        highlighted
          ? "border-foreground/30 bg-black/[0.03] dark:bg-white/[0.06]"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <span className="w-12 shrink-0 text-center text-xs text-foreground/40">
        {day}
      </span>

      <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-xs text-foreground/70 dark:bg-white/10">
        {tx.category}
      </span>

      <span className="min-w-0 flex-1 truncate text-sm text-foreground/70">
        {tx.memo || <span className="text-foreground/30">—</span>}
      </span>

      <span className="hidden shrink-0 text-xs text-foreground/40 sm:inline">
        {tx.bank}
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
        className="shrink-0 rounded p-1 text-foreground/40 opacity-0 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100 focus:opacity-100"
      >
        🗑️
      </button>
    </li>
  );
}
