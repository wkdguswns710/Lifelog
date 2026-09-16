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

const PERIODS: ImportPeriod[] = ["month", "lastmonth", "week", "all"];

export default function ImportInboxDrawer({
  open,
  onClose,
  rawTransactions,
  confirmedTransactions,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  rawTransactions: RawTransaction[];
  confirmedTransactions: Transaction[];
  onImport: (ids: string[]) => void;
}) {
  const [period, setPeriod] = useState<ImportPeriod>("month");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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

  function toggle(id: string) {
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
      "h6s.ai 연동 전이에요. 연동되면 여기서 최신 거래를 가져올 수 있어요."
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
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-black/10 bg-background transition-transform duration-200 ease-out sm:max-w-md dark:border-white/10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">📥</span>
            <span className="font-medium">가져오기함</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1.5 text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSync}
              className="flex items-center gap-1.5 rounded-md border border-black/10 px-3 py-1.5 text-xs dark:border-white/15"
            >
              🔄 동기화
            </button>
            <span className="text-xs text-foreground/40">
              마지막 동기화: 아직 없음
            </span>
          </div>

          {syncNotice && (
            <p className="mb-3 rounded-md bg-black/[0.03] px-3 py-2 text-xs text-foreground/60 dark:bg-white/[0.06]">
              {syncNotice}
            </p>
          )}

          <div className="mb-3 flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as ImportPeriod)}
              aria-label="조회 기간"
              className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-xs outline-none dark:border-white/15"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p} className="bg-background">
                  {IMPORT_PERIOD_LABEL[p]}
                </option>
              ))}
            </select>
            <span className="text-xs text-foreground/40">
              조회된 {visible.length}건
              {alreadyImportedInPeriod > 0 &&
                ` (이미 가져온 ${alreadyImportedInPeriod}건 제외)`}
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/15 py-10 text-center text-sm text-foreground/50 dark:border-white/15">
              가져올 거래가 없어요. 동기화를 먼저 해보세요.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
              <label className="flex items-center gap-2 bg-black/[0.02] px-3 py-2 text-xs text-foreground/60 dark:bg-white/[0.04]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className="size-4 accent-foreground"
                />
                전체 선택
              </label>

              <ul className="divide-y divide-black/10 dark:divide-white/10">
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
                        className="size-4 shrink-0 accent-foreground"
                      />
                      <span className="w-10 shrink-0 text-xs text-foreground/40">
                        {r.spentAt.slice(5).replace("-", "/")}
                      </span>
                      <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] text-foreground/70 dark:bg-white/10">
                        {r.bank}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground/70">
                        {r.memo || r.category}
                      </span>
                      {dup && (
                        <span
                          title="날짜·금액·은행이 같은 직접입력 거래가 있어요"
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

        <div className="flex items-center justify-between border-t border-black/10 px-4 py-3 dark:border-white/10">
          <span className="text-sm text-foreground/60">
            {selected.size}건 선택됨
          </span>
          <button
            type="button"
            onClick={handleImport}
            disabled={selected.size === 0}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-40"
          >
            가계부에 추가
          </button>
        </div>
      </div>
    </>
  );
}
