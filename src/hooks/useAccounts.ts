"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAccount,
  loadAccounts,
  saveAccounts,
  type Account,
  type NewAccount,
} from "@/lib/accounts";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAccounts(loadAccounts());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveAccounts(accounts);
  }, [accounts, loaded]);

  const add = useCallback((input: NewAccount) => {
    if (!input.bank) return;
    setAccounts((prev) => [createAccount(input), ...prev]);
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<Account, "id" | "createdAt">>) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      );
    },
    []
  );

  const remove = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { accounts, loaded, add, update, remove };
}
