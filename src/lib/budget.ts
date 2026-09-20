// 가계부(확정 거래) 데이터 계층 — Supabase tb_transactions 테이블.
// RLS가 created_by = auth.uid() 조건으로 걸려 있어, 로그인한 사용자 본인 행만 오간다.
// 삭제는 하드 삭제가 아니라 deleted_yn 소프트 삭제이며(테이블 설계), 조회 시 항상 제외한다.

import { supabase } from "./supabase/client";

export type TxType = "income" | "expense";

export type Transaction = {
  id: number;
  accountId: number;
  type: TxType;
  amount: number; // 원 단위 정수(양수)
  category: string;
  memo: string;
  occurredAt: string; // ISO 8601 (시분초 포함)
  spentAt: string; // YYYY-MM-DD, occurredAt에서 로컬 기준으로 뽑아낸 날짜(달력/월별 집계용)
  createdAt: string; // ISO 8601
};

export type NewTransaction = {
  accountId: number;
  type: TxType;
  amount: number;
  category: string;
  memo?: string;
  spentAt: string; // 사용자가 고른 날짜 (YYYY-MM-DD)
  spentTime: string; // 사용자가 고른 시각 (HH:mm)
};

export type MonthSummary = {
  income: number;
  expense: number;
  balance: number;
};

export const TX_TYPE_LABEL: Record<TxType, string> = {
  income: "수입",
  expense: "지출",
};

export const BANKS = [
  "토스뱅크",
  "카카오뱅크",
  "신한은행",
  "국민은행",
  "농협은행",
  "우리은행",
  "미래에셋증권",
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

/** 분류 선택지를 한 곳에서만 계산한다 — 입력 폼과 필터가 서로 다른 목록을
 *  보여주는 일이 없도록, 둘 다 이 함수만 호출한다. */
export function categoryOptionsFor(type: TxType | "all"): string[] {
  if (type === "all") return [...CATEGORIES.expense, ...CATEGORIES.income];
  return CATEGORIES[type];
}

const SELECT_COLUMNS =
  "id, account_id, type, amount, category, memo, occurred_at, created_at";

type TransactionRow = {
  id: number;
  account_id: number;
  type: TxType;
  amount: number;
  category: string;
  memo: string | null;
  occurred_at: string;
  created_at: string;
};

/** 오늘 날짜를 YYYY-MM-DD (로컬 기준)로 반환 */
export function todayStr(): string {
  return toLocalDateStr(new Date().toISOString());
}

/** 현재 시각을 HH:mm (로컬 기준)로 반환 */
export function nowTimeStr(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

/** ISO 타임스탬프(UTC) → YYYY-MM-DD (로컬 기준) */
export function toLocalDateStr(isoString: string): string {
  const d = new Date(isoString);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

/** ISO 타임스탬프(UTC) → HH:mm (로컬 기준) */
export function toLocalTimeStr(isoString: string): string {
  const d = new Date(isoString);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(11, 16);
}

/** 사용자가 고른 날짜(YYYY-MM-DD) + 시각(HH:mm)을 합쳐 timestamptz용 ISO 문자열을 만든다. */
function combineDateAndTime(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, h || 0, min || 0, 0).toISOString();
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    memo: row.memo ?? "",
    occurredAt: row.occurred_at,
    spentAt: toLocalDateStr(row.occurred_at),
    createdAt: row.created_at,
  };
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("tb_transactions")
    .select(SELECT_COLUMNS)
    .eq("deleted_yn", "N")
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toTransaction);
}

export async function insertTransaction(
  input: NewTransaction
): Promise<Transaction> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("tb_transactions")
    .insert({
      account_id: input.accountId,
      type: input.type,
      amount: Math.abs(Math.round(input.amount)),
      category: input.category,
      memo: input.memo?.trim() || null,
      occurred_at: combineDateAndTime(input.spentAt, input.spentTime),
      created_by: userData.user.id,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransaction(
  id: number,
  input: NewTransaction
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("tb_transactions")
    .update({
      account_id: input.accountId,
      type: input.type,
      amount: Math.abs(Math.round(input.amount)),
      category: input.category,
      memo: input.memo?.trim() || null,
      occurred_at: combineDateAndTime(input.spentAt, input.spentTime),
    })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toTransaction(data);
}

/** 하드 삭제가 아니라 deleted_yn = 'Y'로 표시한다(테이블 설계상 소프트 삭제). */
export async function softDeleteTransaction(id: number): Promise<void> {
  const { error } = await supabase
    .from("tb_transactions")
    .update({ deleted_yn: "Y", deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
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
