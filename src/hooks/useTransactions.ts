"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchTransactions,
  insertTransaction,
  softDeleteTransaction,
  updateTransaction,
  type NewTransaction,
  type Transaction,
} from "@/lib/budget";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await fetchTransactions();
      setTransactions(rows);
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

  const add = useCallback(async (input: NewTransaction) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) return;
    if (!input.accountId) return;
    try {
      const created = await insertTransaction(input);
      setTransactions((prev) => [created, ...prev]);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const update = useCallback(async (id: number, input: NewTransaction) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) return;
    if (!input.accountId) return;
    try {
      const updated = await updateTransaction(id, input);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      await softDeleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  return { transactions, loaded, error, add, update, remove };
}
