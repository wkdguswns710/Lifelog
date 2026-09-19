"use client";

import { useMemo, useRef, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useRawTransactions } from "@/hooks/useRawTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import {
  currentMonthKey,
  filterByMonth,
  formatMonth,
  formatWon,
  shiftMonth,
  sortTransactions,
  summarize,
  type Transaction,
} from "@/lib/budget";
import PageHeader from "@/components/PageHeader";
import TransactionForm from "./TransactionForm";
import TransactionItem from "./TransactionItem";
import BudgetFilters, { type BudgetFilterState } from "./BudgetFilters";
import BudgetCalendar from "./BudgetCalendar";
import ImportInboxDrawer from "./ImportInboxDrawer";
import AccountsDrawer from "./AccountsDrawer";

const DEFAULT_FILTERS: BudgetFilterState = {
  type: "all",
  accountId: "all",
  category: "all",
};

function applyFilters(txs: Transaction[], filters: BudgetFilterState) {
  return txs.filter((tx) => {
    if (filters.type !== "all" && tx.type !== filters.type) return false;
    if (filters.accountId !== "all" && tx.accountId !== filters.accountId)
      return false;
    if (filters.category !== "all" && tx.category !== filters.category)
      return false;
    return true;
  });
}

export default function BudgetApp() {
  const { transactions, loaded, error: txError, add, remove } =
    useTransactions();
  const rawTx = useRawTransactions();
  const rawTxError = rawTx.error;
  const accountsState = useAccounts();
  const [month, setMonth] = useState(currentMonthKey());
  const [filters, setFilters] = useState<BudgetFilterState>(DEFAULT_FILTERS);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  const firstRowRefs = useRef(new Map<string, HTMLLIElement>());

  const accountLabel = (accountId: number) =>
    accountsState.accounts.find((a) => a.id === accountId)?.alias ?? "-";

  const pendingCount = rawTx.items.filter((r) => r.status === "pending").length;

  function handleImport(ids: number[]) {
    const toImport = rawTx.items.filter((r) => ids.includes(r.id));
    for (const r of toImport) {
      add({
        accountId: r.accountId,
        type: r.type,
        amount: r.amount,
        category: r.category || (r.type === "income" ? "기타수입" : "기타지출"),
        memo: r.memo,
        spentAt: r.spentAt,
      });
    }
    rawTx.setStatus(ids, "imported");
  }

  const monthTxs = useMemo(
    () => applyFilters(filterByMonth(transactions, month), filters),
    [transactions, month, filters]
  );
  const sortedTxs = useMemo(() => sortTransactions(monthTxs), [monthTxs]);
  const summary = useMemo(() => summarize(monthTxs), [monthTxs]);

  function handleSelectDay(day: string) {
    setSelectedDay((prev) => (prev === day ? null : day));
    const el = firstRowRefs.current.get(day);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const seenDays = new Set<string>();
  const error = txError || accountsState.error || rawTxError;

  return (
    <div>
      <PageHeader
        title="가계부"
        description="수입·지출을 기록하고 월별 통계를 봅니다."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAccountsOpen(true)}
              aria-label="내 계좌 열기"
              className="flex size-9 items-center justify-center rounded border border-border-subtle text-base hover:bg-surface-alt"
            >
              🏦
            </button>
            <button
              type="button"
              onClick={() => setInboxOpen(true)}
              aria-label="가져오기함 열기"
              className="relative flex size-9 items-center justify-center rounded border border-border-subtle text-base hover:bg-surface-alt"
            >
              📥
              {pendingCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <ImportInboxDrawer
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        rawTransactions={rawTx.items}
        confirmedTransactions={transactions}
        accounts={accountsState.accounts}
        onImport={handleImport}
      />

      <AccountsDrawer
        open={accountsOpen}
        onClose={() => setAccountsOpen(false)}
        accounts={accountsState.accounts}
        error={accountsState.error}
        onAdd={accountsState.add}
        onUpdate={accountsState.update}
        onRemove={accountsState.remove}
        onReorder={accountsState.reorder}
      />

      <TransactionForm accounts={accountsState.accounts} onAdd={add} />

      {/* 월 이동 네비 */}
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            setMonth((m) => shiftMonth(m, -1));
            setSelectedDay(null);
          }}
          aria-label="이전 달"
          className="rounded px-2 py-1 text-text-secondary hover:bg-surface-alt"
        >
          ←
        </button>
        <span className="min-w-32 text-center text-sm font-medium">
          {formatMonth(month)}
        </span>
        <button
          type="button"
          onClick={() => {
            setMonth((m) => shiftMonth(m, 1));
            setSelectedDay(null);
          }}
          aria-label="다음 달"
          className="rounded px-2 py-1 text-text-secondary hover:bg-surface-alt"
        >
          →
        </button>
        {month !== currentMonthKey() && (
          <button
            type="button"
            onClick={() => {
              setMonth(currentMonthKey());
              setSelectedDay(null);
            }}
            className="rounded px-2 py-1 text-xs text-text-tertiary hover:bg-surface-alt"
          >
            이번 달
          </button>
        )}
      </div>

      {/* 월별 요약 */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryTile
          label="수입"
          value={summary.income}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryTile
          label="지출"
          value={summary.expense}
          className="text-rose-600 dark:text-rose-400"
        />
        <SummaryTile
          label="잔액"
          value={summary.balance}
          className={
            summary.balance < 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-foreground"
          }
          signed
        />
      </div>

      <BudgetFilters
        filters={filters}
        accounts={accountsState.accounts}
        onChange={setFilters}
      />

      {!loaded ? (
        <p className="py-10 text-center text-sm text-text-tertiary">
          불러오는 중…
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BudgetCalendar
            month={month}
            transactions={monthTxs}
            selectedDay={selectedDay}
            onSelectDay={handleSelectDay}
          />

          {sortedTxs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong py-12 text-center text-sm text-text-tertiary">
              조건에 맞는 거래가 없어요.
            </div>
          ) : (
            <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
              {sortedTxs.map((tx) => {
                const isFirstOfDay = !seenDays.has(tx.spentAt);
                if (isFirstOfDay) seenDays.add(tx.spentAt);
                return (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    accountLabel={accountLabel(tx.accountId)}
                    onRemove={remove}
                    highlighted={tx.spentAt === selectedDay}
                    rowRef={
                      isFirstOfDay
                        ? (el) => {
                            if (el) firstRowRefs.current.set(tx.spentAt, el);
                            else firstRowRefs.current.delete(tx.spentAt);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  className,
  signed,
}: {
  label: string;
  value: number;
  className: string;
  signed?: boolean;
}) {
  const text =
    signed && value > 0 ? `+${formatWon(value)}` : formatWon(value);
  return (
    <div className="rounded-xl border border-border-subtle p-4">
      <div className="text-xs text-text-tertiary">{label}</div>
      <div className={`mt-1 text-lg font-medium tabular-nums ${className}`}>
        {text}
      </div>
    </div>
  );
}
