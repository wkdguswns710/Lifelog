// 가계부(거래) 데이터 계층.
// 할 일과 동일하게 localStorage에 저장하며, 나중에 Supabase로 교체하기 쉽도록
// 저장소 접근을 이 파일의 함수들로 격리한다.

export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TxType;
  amount: number; // 원 단위 정수(양수)
  category: string;
  memo: string;
  bank: string;
  spentAt: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
};

export type NewTransaction = {
  type: TxType;
  amount: number;
  category: string;
  memo?: string;
  bank?: string;
  spentAt: string;
};

export type MonthSummary = {
  income: number;
  expense: number;
  balance: number;
};

const STORAGE_KEY = "lifelog:transactions";

export const TX_TYPE_LABEL: Record<TxType, string> = {
  income: "수입",
  expense: "지출",
};

export const BANKS = [
  "직접입력",
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "기업은행",
  "농협은행",
  "토스뱅크",
  "카카오뱅크",
  "케이뱅크",
];

export const CATEGORIES: Record<TxType, string[]> = {
  income: ["월급", "용돈", "이자", "환급", "기타수입"],
  expense: [
    "식비",
    "교통",
    "쇼핑",
    "주거/공과금",
    "문화/여가",
    "의료",
    "교육",
    "기타지출",
  ],
};

function isTxType(value: unknown): value is TxType {
  return value === "income" || value === "expense";
}

function normalize(raw: unknown): Transaction | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  if (typeof t.id !== "string") return null;
  if (!isTxType(t.type)) return null;
  const amount = Number(t.amount);
  if (!Number.isFinite(amount)) return null;
  return {
    id: t.id,
    type: t.type,
    amount: Math.abs(Math.round(amount)),
    category: typeof t.category === "string" ? t.category : "기타지출",
    memo: typeof t.memo === "string" ? t.memo : "",
    bank: typeof t.bank === "string" ? t.bank : BANKS[0],
    spentAt: typeof t.spentAt === "string" ? t.spentAt : todayStr(),
    createdAt:
      typeof t.createdAt === "string" ? t.createdAt : new Date().toISOString(),
  };
}

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalize)
      .filter((t): t is Transaction => t !== null);
  } catch {
    return [];
  }
}

export function saveTransactions(txs: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
  } catch {
    // 저장 실패는 조용히 무시한다.
  }
}

export function createTransaction(input: NewTransaction): Transaction {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: input.type,
    amount: Math.abs(Math.round(input.amount)),
    category: input.category,
    memo: input.memo?.trim() ?? "",
    bank: input.bank ?? BANKS[0],
    spentAt: input.spentAt,
    createdAt: new Date().toISOString(),
  };
}

/** 오늘 날짜를 YYYY-MM-DD (로컬 기준)로 반환 */
export function todayStr(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/** YYYY-MM-DD → YYYY-MM */
export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** 현재 달의 YYYY-MM */
export function currentMonthKey(): string {
  return monthKey(todayStr());
}

/** "YYYY-MM" → "YYYY년 M월" */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

/** "YYYY-MM" 에 delta 개월을 더한 값을 반환 */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM"에 해당하는 일수 */
export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** "YYYY-MM" 1일의 요일 (0=일 ~ 6=토) */
export function firstWeekday(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

export function filterByMonth(
  txs: Transaction[],
  month: string
): Transaction[] {
  return txs.filter((t) => monthKey(t.spentAt) === month);
}

export function summarize(txs: Transaction[]): MonthSummary {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

/** 최근 날짜 우선, 같은 날이면 최근 입력 우선 */
export function sortTransactions(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) => {
    if (a.spentAt !== b.spentAt) return a.spentAt < b.spentAt ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/** 1234567 → "₩1,234,567" */
export function formatWon(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
