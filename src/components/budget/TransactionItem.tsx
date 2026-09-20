"use client";

import { useState } from "react";
import {
  categoryOptionsFor,
  formatWon,
  toLocalTimeStr,
  TX_TYPE_LABEL,
  type NewTransaction,
  type Transaction,
  type TxType,
} from "@/lib/budget";
import { formatAccountLabel, type Account } from "@/lib/accounts";

export default function TransactionItem({
  tx,
  accounts,
  accountLabel,
  onUpdate,
  onRemove,
  highlighted,
  rowRef,
}: {
  tx: Transaction;
  accounts: Account[];
  accountLabel: string;
  onUpdate: (id: number, input: NewTransaction) => void;
  onRemove: (id: number) => void;
  highlighted?: boolean;
  rowRef?: (el: HTMLLIElement | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const isIncome = tx.type === "income";
  const day = tx.spentAt.slice(5).replace("-", "/"); // MM/DD

  if (editing) {
    return (
      <EditRow
        tx={tx}
        accounts={accounts}
        rowRef={rowRef}
        onSave={(input) => {
          onUpdate(tx.id, input);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

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

      <span className="hidden max-w-[9rem] shrink-0 truncate text-xs text-text-tertiary sm:inline">
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

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="수정"
          title="수정"
          className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onRemove(tx.id)}
          aria-label="삭제"
          title="삭제"
          className="rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

function EditRow({
  tx,
  accounts,
  rowRef,
  onSave,
  onCancel,
}: {
  tx: Transaction;
  accounts: Account[];
  rowRef?: (el: HTMLLIElement | null) => void;
  onSave: (input: NewTransaction) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<TxType>(tx.type);
  const [amount, setAmount] = useState(String(tx.amount));
  const [category, setCategory] = useState(tx.category);
  const [accountId, setAccountId] = useState(tx.accountId);
  const [spentAt, setSpentAt] = useState(tx.spentAt);
  const [spentTime, setSpentTime] = useState(toLocalTimeStr(tx.occurredAt));
  const [memo, setMemo] = useState(tx.memo);

  function selectType(next: TxType) {
    setType(next);
    const options = categoryOptionsFor(next);
    if (!options.includes(category)) setCategory(options[0]);
  }

  function handleSave() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    onSave({
      accountId,
      type,
      amount: value,
      category,
      memo,
      spentAt,
      spentTime,
    });
  }

  return (
    <li
      ref={rowRef}
      className="flex flex-col gap-2 rounded-lg border border-accent px-3 py-3"
    >
      <div className="inline-flex w-fit rounded border border-border-subtle p-0.5">
        {(["expense", "income"] as TxType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => selectType(t)}
            className={`rounded px-3 py-1 text-xs transition-colors duration-300 ${
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

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="금액"
          className="w-full rounded border border-border-subtle bg-transparent px-2 py-1 text-right text-xs outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="분류"
          className="w-full rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          {categoryOptionsFor(type).map((c) => (
            <option key={c} value={c} className="bg-background">
              {c}
            </option>
          ))}
        </select>
        <select
          value={accountId}
          onChange={(e) => setAccountId(Number(e.target.value))}
          aria-label="계좌"
          className="w-full rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id} className="bg-background">
              {formatAccountLabel(a)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={spentAt}
          onChange={(e) => setSpentAt(e.target.value)}
          aria-label="날짜"
          className="w-full rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        />
        <input
          type="time"
          value={spentTime}
          onChange={(e) => setSpentTime(e.target.value)}
          aria-label="시각"
          className="w-full rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모"
          aria-label="메모"
          className="min-w-0 flex-1 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!(Number(amount) > 0)}
          className="shrink-0 rounded bg-accent px-3 py-1 text-xs font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded px-3 py-1 text-xs text-text-tertiary hover:bg-surface-alt"
        >
          취소
        </button>
      </div>
    </li>
  );
}
