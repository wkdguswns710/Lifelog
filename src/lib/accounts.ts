// 사용자가 등록해둔 내 계좌 관리 데이터 계층 (Supabase tb_accounts 테이블).
// RLS가 created_by = auth.uid() 조건으로 걸려 있어, 로그인한 사용자 본인 행만 오간다.

import { supabase } from "./supabase/client";

export type Account = {
  id: number;
  bank: string;
  last4: string | null;
  alias: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type NewAccount = {
  bank: string;
  alias: string;
  last4?: string;
};

type AccountRow = {
  id: number;
  bank: string;
  last4: string | null;
  alias: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const SELECT_COLUMNS =
  "id, bank, last4, alias, sort_order, created_at, updated_at";

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    bank: row.bank,
    last4: row.last4,
    alias: row.alias,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** 은행/뒷자리까지 포함한 표기. 콤보박스처럼 별명만으로 구분이 안 되는 곳에 쓴다. */
export function formatAccountLabel(account: Account): string {
  const suffix = account.last4 ? ` ${account.last4}` : "";
  return `${account.alias} · ${account.bank}${suffix}`;
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from("tb_accounts")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toAccount);
}

export async function insertAccount(
  input: NewAccount,
  sortOrder: number
): Promise<Account> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("tb_accounts")
    .insert({
      bank: input.bank,
      alias: input.alias.trim() || input.bank,
      last4: input.last4 || null,
      sort_order: sortOrder,
      created_by: userData.user.id,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toAccount(data);
}

export async function updateAccountRow(
  id: number,
  patch: Partial<Pick<Account, "bank" | "alias" | "last4">>
): Promise<Account> {
  const { data, error } = await supabase
    .from("tb_accounts")
    .update({
      ...(patch.bank !== undefined ? { bank: patch.bank } : {}),
      ...(patch.alias !== undefined ? { alias: patch.alias } : {}),
      ...(patch.last4 !== undefined ? { last4: patch.last4 || null } : {}),
    })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return toAccount(data);
}

export async function deleteAccountRow(id: number): Promise<void> {
  const { error } = await supabase.from("tb_accounts").delete().eq("id", id);
  if (error) throw error;
}

/** 드래그로 정한 새 순서(id 배열)를 0부터 순서대로 저장한다. */
export async function persistAccountOrder(orderedIds: number[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("tb_accounts").update({ sort_order: index }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
