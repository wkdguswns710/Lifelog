"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  TX_TYPE_LABEL,
  todayStr,
  type NewTransaction,
  type TxType,
} from "@/lib/budget";
import type { Account } from "@/lib/accounts";

export default function TransactionForm({
  accounts,
  onAdd,
}: {
  accounts: Account[];
  onAdd: (input: NewTransaction) => void;
}) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [accountId, setAccountId] = useState<number | "">(
    accounts[0]?.id ?? ""
  );
  const [spentAt, setSpentAt] = useState(todayStr());
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (accountId === "" && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  function selectType(next: TxType) {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    if (!accountId) return;
    onAdd({ accountId, type, amount: value, category, memo, spentAt });
    setAmount("");
    setMemo("");
    setSpentAt(todayStr());
  }

  if (accounts.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-border-strong p-4 text-center text-sm text-text-tertiary">
        거래를 기록하려면 먼저 계좌를 등록해주세요. 🏦 버튼으로 계좌를 추가할
        수 있어요.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-border-subtle p-4"
    >
      {/* 수입/지출 토글 */}
      <div className="mb-3 inline-flex rounded border border-border-subtle p-0.5">
        {(["expense", "income"] as TxType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectType(t)}
            className={`rounded px-4 py-1.5 text-sm transition-colors duration-300 ${
              type === t
                ? t === "income"
                  ? "bg-emerald-500 font-medium text-white"
                  : "bg-rose-500 font-medium text-white"
                : "text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {TX_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary">금액</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-label="금액"
            className="w-32 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-right text-sm outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary">분류</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="분류"
            className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c} className="bg-background">
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary">계좌</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            aria-label="계좌"
            className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id} className="bg-background">
                {a.alias}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary">날짜</span>
          <input
            type="date"
            value={spentAt}
            onChange={(e) => setSpentAt(e.target.value)}
            aria-label="날짜"
            className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
          />
        </label>

        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs text-text-tertiary">메모 (선택)</span>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="내용"
            aria-label="메모"
            className="min-w-0 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={!(Number(amount) > 0) || !accountId}
          className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
        >
          추가
        </button>
      </div>
    </form>
  );
}
