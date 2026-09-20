"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchTodos,
  insertTodo,
  persistTodoOrder,
  setTodoStatus,
  softDeleteTodo,
  updateTodoDetail,
  type NewTodo,
  type Purpose,
  type Todo,
  type TodoDetailPatch,
} from "@/lib/todos";
import { withRetry } from "@/lib/retry";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.";
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const rows = await withRetry(fetchTodos);
      setTodos(rows);
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
    async (input: NewTodo) => {
      if (!input.title.trim()) return;
      try {
        const samePurpose = todos.filter((t) => t.purpose === input.purpose);
        const nextOrder =
          samePurpose.length === 0
            ? 0
            : Math.max(...samePurpose.map((t) => t.sortOrder)) + 1;
        const created = await insertTodo(input, nextOrder);
        setTodos((prev) => [...prev, created]);
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [todos]
  );

  const update = useCallback(async (id: number, patch: TodoDetailPatch) => {
    try {
      const updated = await updateTodoDetail(id, patch);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const toggle = useCallback(
    async (id: number) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;
      try {
        const updated = await setTodoStatus(
          id,
          target.status === "done" ? "pending" : "done"
        );
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      }
    },
    [todos]
  );

  const remove = useCallback(async (id: number) => {
    try {
      await softDeleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  /** 같은 축(purpose) 안에서 드래그로 새로 정렬된 목록을 받아 화면엔 즉시 반영하고, DB엔 뒤이어 저장한다. */
  const reorder = useCallback(
    async (purpose: Purpose, newOrderForPurpose: Todo[]) => {
      const previous = todos;
      setTodos((prev) => {
        const others = prev.filter((t) => t.purpose !== purpose);
        return [...others, ...newOrderForPurpose];
      });
      try {
        await persistTodoOrder(newOrderForPurpose.map((t) => t.id));
        setError(null);
      } catch (err) {
        setTodos(previous);
        setError(errorMessage(err));
      }
    },
    [todos]
  );

  return { todos, loaded, error, add, toggle, update, remove, reorder };
}
