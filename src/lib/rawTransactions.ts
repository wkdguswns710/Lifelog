// API 동기화로 받아온 원본 거래 스테이징 데이터 계층.
// 은행 API(h6s.ai 등) 연동 전까지는 항상 빈 상태이며, 연동 후 이 저장소에 쌓인 걸
// 사용자가 가져오기함에서 검토해서 선택한 것만 실제 가계부(transactions)로 반영한다.

import { todayStr, type Transaction, type TxType } from "./budget";

export type RawStatus = "pending" | "imported";

export type RawTransaction = {
  id: string;
  externalId: string;
  bank: string;
  type: TxType;
  amount: number;
  category: string;
  memo: string;
  spentAt: string; // YYYY-MM-DD
  fetchedAt: string; // ISO 8601
  status: RawStatus;
};

const STORAGE_KEY = "lifelog:raw_transactions";

function isTxType(value: unknown): value is TxType {
  return value === "income" || value === "expense";
}

function isStatus(value: unknown): value is RawStatus {
  return value === "pending" || value === "imported";
}

function normalize(raw: unknown): RawTransaction | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string") return null;
  if (!isTxType(t.type)) return null;
  const amount = Number(t.amount);
  if (!Number.isFinite(amount)) return null;
  return {
    id: t.id,
    externalId: typeof t.externalId === "string" ? t.externalId : t.id,
    bank: typeof t.bank === "string" ? t.bank : "직접입력",
    type: t.type,
    amount: Math.abs(Math.round(amount)),
    category: typeof t.category === "string" ? t.category : "",
    memo: typeof t.memo === "string" ? t.memo : "",
    spentAt: typeof t.spentAt === "string" ? t.spentAt : todayStr(),
    fetchedAt:
      typeof t.fetchedAt === "string" ? t.fetchedAt : new Date().toISOString(),
    status: isStatus(t.status) ? t.status : "pending",
  };
}

export function loadRawTransactions(): RawTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalize)
      .filter((t): t is RawTransaction => t !== null);
  } catch {
    return [];
  }
}

export function saveRawTransactions(items: RawTransaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 저장 실패는 조용히 무시한다.
  }
}

export type ImportPeriod = "month" | "lastmonth" | "week" | "all";

export const IMPORT_PERIOD_LABEL: Record<ImportPeriod, string> = {
  month: "이번 달",
  lastmonth: "지난 달",
  week: "최근 1주",
  all: "전체 기간",
};

export function filterByPeriod(
  items: RawTransaction[],
  period: ImportPeriod
): RawTransaction[] {
  if (period === "all") return items;

  if (period === "week") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const today = todayStr();
    return items.filter((r) => r.spentAt >= cutoffStr && r.spentAt <= today);
  }

  const now = new Date();
  const target =
    period === "lastmonth"
      ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
      : now;
  const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
  return items.filter((r) => r.spentAt.slice(0, 7) === key);
}

/** 은행·날짜·금액·유형이 모두 같은 확정 거래가 있으면 중복 의심으로 본다. */
export function isLikelyDuplicate(
  raw: RawTransaction,
  confirmed: Transaction[]
): boolean {
  return confirmed.some(
    (t) =>
      t.bank === raw.bank &&
      t.spentAt === raw.spentAt &&
      t.amount === raw.amount &&
      t.type === raw.type
  );
}
