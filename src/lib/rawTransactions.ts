// API 동기화 원본 거래 스테이징 데이터 계층 (Supabase tb_api_transactions 테이블).
// 은행 API(h6s.ai 등) 연동 전까지는 항상 빈 상태이며, 연동 후 이 테이블에 쌓인 걸
// 사용자가 가져오기함에서 검토해서 선택한 것만 실제 가계부(tb_transactions)로 반영한다.

import { supabase } from "./supabase/client";
import { toLocalDateStr, type Transaction, type TxType } from "./budget";

export type RawStatus = "pending" | "imported";

export type RawTransaction = {
  id: number;
  accountId: number;
  externalId: string;
  type: TxType;
  amount: number;
  category: string;
  memo: string;
  occurredAt: string; // ISO 8601 (시분초 포함)
  spentAt: string; // occurredAt에서 뽑아낸 로컬 날짜 — 기간 필터/표시용
  fetchedAt: string; // ISO 8601 (수집일)
  status: RawStatus;
};

type RawTransactionRow = {
  id: number;
  account_id: number;
  external_id: string;
  type: TxType;
  amount: number;
  category: string | null;
  memo: string | null;
  occurred_at: string;
  created_at: string;
  status: RawStatus;
};

const SELECT_COLUMNS =
  "id, account_id, external_id, type, amount, category, memo, occurred_at, created_at, status";

function toRawTransaction(row: RawTransactionRow): RawTransaction {
  return {
    id: row.id,
    accountId: row.account_id,
    externalId: row.external_id,
    type: row.type,
    amount: row.amount,
    category: row.category ?? "",
    memo: row.memo ?? "",
    occurredAt: row.occurred_at,
    spentAt: toLocalDateStr(row.occurred_at),
    fetchedAt: row.created_at,
    status: row.status,
  };
}

export async function fetchRawTransactions(): Promise<RawTransaction[]> {
  const { data, error } = await supabase
    .from("tb_api_transactions")
    .select(SELECT_COLUMNS)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toRawTransaction);
}

/** 여러 건을 한 번에 같은 상태로 바꾼다(가져오기 확정 시 사용). */
export async function markRawTransactionsStatus(
  ids: number[],
  status: RawStatus
): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("tb_api_transactions")
    .update({ status })
    .in("id", ids);
  if (error) throw error;
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
    const cutoffStr = toLocalDateStr(cutoff.toISOString());
    const today = toLocalDateStr(new Date().toISOString());
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

/** 같은 계좌·날짜·금액·유형의 확정 거래가 있으면 중복 의심으로 본다. */
export function isLikelyDuplicate(
  raw: RawTransaction,
  confirmed: Transaction[]
): boolean {
  return confirmed.some(
    (t) =>
      t.accountId === raw.accountId &&
      t.spentAt === raw.spentAt &&
      t.amount === raw.amount &&
      t.type === raw.type
  );
}
