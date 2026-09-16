"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadRawTransactions,
  saveRawTransactions,
  type RawStatus,
  type RawTransaction,
} from "@/lib/rawTransactions";

export function useRawTransactions() {
  const [items, setItems] = useState<RawTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadRawTransactions());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveRawTransactions(items);
  }, [items, loaded]);

  const setStatus = useCallback((ids: string[], status: RawStatus) => {
    setItems((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
    );
  }, []);

  return { items, loaded, setStatus };
}
