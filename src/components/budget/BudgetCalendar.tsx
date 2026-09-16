"use client";

import { daysInMonth, firstWeekday, type Transaction } from "@/lib/budget";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function BudgetCalendar({
  month,
  transactions,
  selectedDay,
  onSelectDay,
}: {
  month: string; // YYYY-MM
  transactions: Transaction[];
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
}) {
  const totalDays = daysInMonth(month);
  const leadingBlanks = firstWeekday(month);

  const netByDay = new Map<string, number>();
  for (const tx of transactions) {
    const signed = tx.type === "income" ? tx.amount : -tx.amount;
    netByDay.set(tx.spentAt, (netByDay.get(tx.spentAt) ?? 0) + signed);
  }

  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
      <div className="grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-black/[0.02] py-1.5 text-center text-xs text-foreground/40 dark:bg-white/[0.03]"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return (
              <div
                key={i}
                className="min-h-14 border-t border-r border-black/10 dark:border-white/10"
              />
            );
          }
          const dateStr = `${month}-${String(day).padStart(2, "0")}`;
          const net = netByDay.get(dateStr);
          const hasTx = net !== undefined;
          const selected = selectedDay === dateStr;

          return (
            <button
              key={i}
              type="button"
              disabled={!hasTx}
              onClick={() => onSelectDay(dateStr)}
              className={`min-h-14 border-t border-r border-black/10 p-1.5 text-left transition-colors dark:border-white/10 ${
                selected
                  ? "bg-black/[0.06] dark:bg-white/[0.1]"
                  : hasTx
                    ? "cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    : "cursor-default"
              }`}
            >
              <div className="text-xs text-foreground/50">{day}</div>
              {hasTx && (
                <div
                  className={`mt-0.5 text-xs font-medium tabular-nums ${
                    net! >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {net! >= 0 ? "+" : "-"}
                  {Math.round(Math.abs(net!) / 10000)}만
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
