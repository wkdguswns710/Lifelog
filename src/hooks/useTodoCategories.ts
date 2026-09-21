"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteTodoCategoryRow,
  fetchTodoCategories,
  insertTodoCategory,
  persistTodoCategoryOrder,
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

  const add = useCallback(
    async (input: NewTodoCategory) => {
      if (!input.name.trim()) return;
      try {
        const nextOrder =
          categories.length === 0
            ? 0
            : Math.max(...categories.map((c) => c.sortOrder)) + 1;
        const created = await insertTodoCategory(input, nextOrder);
        setCategories((prev) => [...prev, created]);
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [categories]
  );

  const update = useCallback(async (id: number, name: string) => {
    if (!name.trim()) return;
    try {
      const updated = await updateTodoCategoryRow(id, name);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
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

  /** 드래그로 새로 정렬된 전체 목록을 받아 화면엔 즉시 반영하고, DB엔 뒤이어 저장한다. */
  const reorder = useCallback(
    async (newOrder: TodoCategory[]) => {
      const previous = categories;
      setCategories(newOrder);
      try {
        await persistTodoCategoryOrder(newOrder.map((c) => c.id));
        setError(null);
      } catch (err) {
        setCategories(previous);
        setError(errorMessage(err));
      }
    },
    [categories]
  );

  return { categories, loaded, error, add, update, remove, reorder };
}
