"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTransaction,
  loadTransactions,
  saveTransactions,
  type NewTransaction,
  type Transaction,
} from "@/lib/budget";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTransactions(transactions);
  }, [transactions, loaded]);

  const add = useCallback((input: NewTransaction) => {
    if (!Number.isFinite(input.amount) || input.amount <= 0) return;
    setTransactions((prev) => [createTransaction(input), ...prev]);
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<Transaction, "id" | "createdAt">>) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const remove = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { transactions, loaded, add, update, remove };
}
