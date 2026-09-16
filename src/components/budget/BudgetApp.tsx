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
  bank: "all",
  category: "all",
};

function applyFilters(txs: Transaction[], filters: BudgetFilterState) {
  return txs.filter((tx) => {
    if (filters.type !== "all" && tx.type !== filters.type) return false;
    if (filters.bank !== "all" && tx.bank !== filters.bank) return false;
    if (filters.category !== "all" && tx.category !== filters.category)
      return false;
    return true;
  });
}

export default function BudgetApp() {
  const { transactions, loaded, add, remove } = useTransactions();
  const rawTx = useRawTransactions();
  const accountsState = useAccounts();
  const [month, setMonth] = useState(currentMonthKey());
  const [filters, setFilters] = useState<BudgetFilterState>(DEFAULT_FILTERS);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);

  const firstRowRefs = useRef(new Map<string, HTMLLIElement>());

  const pendingCount = rawTx.items.filter((r) => r.status === "pending").length;

  function handleImport(ids: string[]) {
    const toImport = rawTx.items.filter((r) => ids.includes(r.id));
    for (const r of toImport) {
      add({
        type: r.type,
        amount: r.amount,
        category: r.category || (r.type === "income" ? "기타수입" : "기타지출"),
        bank: r.bank,
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
              className="flex size-9 items-center justify-center rounded-md border border-black/10 text-base hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              🏦
            </button>
            <button
              type="button"
              onClick={() => setInboxOpen(true)}
              aria-label="가져오기함 열기"
              className="relative flex size-9 items-center justify-center rounded-md border border-black/10 text-base hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
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

      <ImportInboxDrawer
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        rawTransactions={rawTx.items}
        confirmedTransactions={transactions}
        onImport={handleImport}
      />

      <AccountsDrawer
        open={accountsOpen}
        onClose={() => setAccountsOpen(false)}
        accounts={accountsState.accounts}
        onAdd={accountsState.add}
        onUpdate={accountsState.update}
        onRemove={accountsState.remove}
      />

      <TransactionForm onAdd={add} />

      {/* 월 이동 네비 */}
      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            setMonth((m) => shiftMonth(m, -1));
            setSelectedDay(null);
          }}
          aria-label="이전 달"
          className="rounded-md px-2 py-1 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
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
          className="rounded-md px-2 py-1 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
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
            className="rounded-md px-2 py-1 text-xs text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
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

      <BudgetFilters filters={filters} onChange={setFilters} />

      {!loaded ? (
        <p className="py-10 text-center text-sm text-foreground/40">
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
            <div className="rounded-xl border border-dashed border-black/15 py-12 text-center text-sm text-foreground/50 dark:border-white/15">
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
    <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="text-xs text-foreground/50">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${className}`}>
        {text}
      </div>
    </div>
  );
}
