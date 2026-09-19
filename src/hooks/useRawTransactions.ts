"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchRawTransactions,
  markRawTransactionsStatus,
  type RawStatus,
  type RawTransaction,
} from "@/lib/rawTransactions";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
}

export function useRawTransactions() {
  const [items, setItems] = useState<RawTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await fetchRawTransactions();
      setItems(rows);
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

  const setStatus = useCallback(async (ids: number[], status: RawStatus) => {
    if (ids.length === 0) return;
    try {
      await markRawTransactionsStatus(ids, status);
      setItems((prev) =>
        prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
      );
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  return { items, loaded, error, setStatus };
}
