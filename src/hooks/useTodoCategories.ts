"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteTodoCategoryRow,
  fetchTodoCategories,
  insertTodoCategory,
  updateTodoCategoryRow,
  type NewTodoCategory,
  type TodoCategory,
} from "@/lib/todos";
import { withRetry } from "@/lib/retry";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
}

export function useTodoCategories() {
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await withRetry(fetchTodoCategories);
      setCategories(rows);
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

  const add = useCallback(async (input: NewTodoCategory) => {
    if (!input.name.trim()) return;
    try {
      const created = await insertTodoCategory(input);
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const update = useCallback(async (id: number, name: string) => {
    if (!name.trim()) return;
    try {
      const updated = await updateTodoCategoryRow(id, name);
      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? updated : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const remove = useCallback(async (id: number) => {
    try {
      await deleteTodoCategoryRow(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  return { categories, loaded, error, add, update, remove };
}
