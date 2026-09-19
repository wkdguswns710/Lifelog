"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAccountRow,
  fetchAccounts,
  insertAccount,
  persistAccountOrder,
  updateAccountRow,
  type Account,
  type NewAccount,
} from "@/lib/accounts";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await fetchAccounts();
      setAccounts(rows);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (input: NewAccount) => {
      if (!input.bank || !input.alias.trim()) return;
      try {
        const nextOrder =
          accounts.length === 0
            ? 0
            : Math.max(...accounts.map((a) => a.sortOrder)) + 1;
        const created = await insertAccount(input, nextOrder);
        setAccounts((prev) => [...prev, created]);
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [accounts]
  );

  const update = useCallback(
    async (id: number, patch: Partial<Pick<Account, "bank" | "alias" | "last4">>) => {
      try {
        const updated = await updateAccountRow(id, patch);
        setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    []
  );

  const remove = useCallback(async (id: number) => {
    try {
      await deleteAccountRow(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  /** 드래그로 새로 정렬된 전체 목록을 받아 화면엔 즉시 반영하고, DB엔 뒤이어 저장한다. */
  const reorder = useCallback(
    async (newOrder: Account[]) => {
      const previous = accounts;
      setAccounts(newOrder);
      try {
        await persistAccountOrder(newOrder.map((a) => a.id));
        setError(null);
      } catch (err) {
        setAccounts(previous);
        setError(errorMessage(err));
      }
    },
    [accounts]
  );

  return { accounts, loaded, error, add, update, remove, reorder };
}
