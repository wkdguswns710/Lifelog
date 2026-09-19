"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IMPORT_PERIOD_LABEL,
  filterByPeriod,
  isLikelyDuplicate,
  type ImportPeriod,
  type RawTransaction,
} from "@/lib/rawTransactions";
import { formatWon, type Transaction } from "@/lib/budget";
import type { Account } from "@/lib/accounts";

const PERIODS: ImportPeriod[] = ["month", "lastmonth", "week", "all"];

export default function ImportInboxDrawer({
  open,
  onClose,
  rawTransactions,
  confirmedTransactions,
  accounts,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  rawTransactions: RawTransaction[];
  confirmedTransactions: Transaction[];
  accounts: Account[];
  onImport: (ids: number[]) => void;
}) {
  const [period, setPeriod] = useState<ImportPeriod>("month");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const accountLabel = (accountId: number) =>
    accounts.find((a) => a.id === accountId)?.alias ?? "알 수 없는 계좌";

  const pending = useMemo(
    () => rawTransactions.filter((r) => r.status === "pending"),
    [rawTransactions]
  );
  const visible = useMemo(
    () => filterByPeriod(pending, period),
    [pending, period]
  );
  const alreadyImportedInPeriod = useMemo(
    () =>
      filterByPeriod(
        rawTransactions.filter((r) => r.status === "imported"),
        period
      ).length,
    [rawTransactions, period]
  );

  // 조회 결과가 바뀌면 기본은 전체 선택 상태로 맞춘다.
  useEffect(() => {
    setSelected(new Set(visible.map((r) => r.id)));
  }, [visible]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(visible.map((r) => r.id)) : new Set());
  }

  function handleImport() {
    if (selected.size === 0) return;
    onImport([...selected]);
  }

  function handleSync() {
    setSyncNotice(
      "은행 API가 아직 연결되지 않았어요. 연결되면 여기서 최신 거래를 가져올 수 있어요."
    );
  }

  const allSelected = visible.length > 0 && selected.size === visible.length;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="가져오기함"
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border-subtle bg-background transition-transform duration-200 ease-out sm:max-w-md ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📥</span>
            <span className="font-medium">가져오기함</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1.5 text-text-tertiary hover:bg-surface-alt"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSync}
              className="flex items-center gap-1.5 rounded border border-border-subtle px-3 py-1.5 text-xs"
            >
              🔄 동기화
            </button>
            <span className="text-xs text-text-tertiary">
              마지막 동기화: 아직 없음
            </span>
          </div>

          {syncNotice && (
            <p className="mb-3 rounded bg-surface-alt px-3 py-2 text-xs text-text-secondary">
              {syncNotice}
            </p>
          )}

          <div className="mb-3 flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as ImportPeriod)}
              aria-label="조회 기간"
              className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-xs outline-none"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p} className="bg-background">
                  {IMPORT_PERIOD_LABEL[p]}
                </option>
              ))}
            </select>
            <span className="text-xs text-text-tertiary">
              조회된 {visible.length}건
              {alreadyImportedInPeriod > 0 &&
                ` (이미 가져온 ${alreadyImportedInPeriod}건 제외)`}
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong py-10 text-center text-sm text-text-tertiary">
              가져올 거래가 없어요. 동기화를 먼저 해보세요.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border-subtle">
              <label className="flex items-center gap-2 bg-surface-alt px-3 py-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="size-4 accent-accent"
                />
                전체 선택
              </label>

              <ul className="divide-y divide-border-subtle">
                {visible.map((r) => {
                  const dup = isLikelyDuplicate(r, confirmedTransactions);
                  return (
                    <li
                      key={r.id}
                      className="flex items-center gap-2 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                        className="size-4 shrink-0 accent-accent"
                      />
                      <span className="w-10 shrink-0 text-xs text-text-tertiary">
                        {r.spentAt.slice(5).replace("-", "/")}
                      </span>
                      <span className="shrink-0 rounded bg-surface-alt px-2 py-0.5 text-[11px] text-text-secondary">
                        {accountLabel(r.accountId)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
                        {r.memo || r.category}
                      </span>
                      {dup && (
                        <span
                          title="같은 계좌·날짜·금액의 직접입력 거래가 있어요"
                          className="shrink-0 text-[11px] text-amber-600 dark:text-amber-400"
                        >
                          ⚠ 중복 의심
                        </span>
                      )}
                      <span
                        className={`shrink-0 text-xs font-medium tabular-nums ${
                          r.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {r.type === "income" ? "+" : "-"}
                        {formatWon(r.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3">
          <span className="text-sm text-text-secondary">
            {selected.size}건 선택됨
          </span>
          <button
            type="button"
            onClick={handleImport}
            disabled={selected.size === 0}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
          >
            가계부에 추가
          </button>
        </div>
      </div>
    </>
  );
}
