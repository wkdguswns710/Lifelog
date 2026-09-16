"use client";

import { useState } from "react";
import {
  BANKS,
  CATEGORIES,
  TX_TYPE_LABEL,
  todayStr,
  type NewTransaction,
  type TxType,
} from "@/lib/budget";

export default function TransactionForm({
  onAdd,
}: {
  onAdd: (input: NewTransaction) => void;
}) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [bank, setBank] = useState(BANKS[0]);
  const [spentAt, setSpentAt] = useState(todayStr());
  const [memo, setMemo] = useState("");

  function selectType(next: TxType) {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    onAdd({ type, amount: value, category, bank, memo, spentAt });
    setAmount("");
    setMemo("");
    setSpentAt(todayStr());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-black/10 p-4 dark:border-white/10"
    >
      {/* 수입/지출 토글 */}
      <div className="mb-3 inline-flex rounded-lg border border-black/10 p-0.5 dark:border-white/15">
        {(["expense", "income"] as TxType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectType(t)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              type === t
                ? t === "income"
                  ? "bg-emerald-500 font-medium text-white"
                  : "bg-rose-500 font-medium text-white"
                : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            {TX_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-foreground/50">금액</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-label="금액"
            className="w-32 rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-right text-sm outline-none dark:border-white/15"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-foreground/50">분류</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="분류"
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c} className="bg-background">
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-foreground/50">은행</span>
          <select
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            aria-label="은행"
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
          >
            {BANKS.map((b) => (
              <option key={b} value={b} className="bg-background">
                {b}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-foreground/50">날짜</span>
          <input
            type="date"
            value={spentAt}
            onChange={(e) => setSpentAt(e.target.value)}
            aria-label="날짜"
            className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs text-foreground/50">메모 (선택)</span>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="내용"
            aria-label="메모"
            className="min-w-0 rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
          />
        </label>

        <button
          type="submit"
          disabled={!(Number(amount) > 0)}
          className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity disabled:opacity-40"
        >
          추가
        </button>
      </div>
    </form>
  );
}
