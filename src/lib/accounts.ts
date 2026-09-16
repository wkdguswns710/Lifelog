// 사용자가 등록해둔 내 계좌 관리 데이터 계층.
// 지금은 정보 정리용이고, 나중에 bankapi.co.kr 같은 자동 동기화를 붙이면
// 이 목록이 "어떤 계좌를 동기화할지" 기준이 된다.

import { BANKS } from "./budget";

export type Account = {
  id: string;
  bank: string;
  alias: string;
  last4: string; // 계좌번호 뒷자리(선택), 식별용
  memo: string;
  createdAt: string;
};

export type NewAccount = {
  bank: string;
  alias: string;
  last4?: string;
  memo?: string;
};

const STORAGE_KEY = "lifelog:accounts";

function normalize(raw: unknown): Account | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.id !== "string") return null;
  const bank = typeof a.bank === "string" ? a.bank : BANKS[0];
  return {
    id: a.id,
    bank,
    alias: typeof a.alias === "string" && a.alias.trim() ? a.alias : bank,
    last4: typeof a.last4 === "string" ? a.last4 : "",
    memo: typeof a.memo === "string" ? a.memo : "",
    createdAt:
      typeof a.createdAt === "string" ? a.createdAt : new Date().toISOString(),
  };
}

export function loadAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalize).filter((a): a is Account => a !== null);
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: Account[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // 저장 실패는 조용히 무시한다.
  }
}

export function createAccount(input: NewAccount): Account {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    bank: input.bank,
    alias: input.alias.trim() || input.bank,
    last4: (input.last4 ?? "").replace(/\D/g, "").slice(-4),
    memo: input.memo?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
}
