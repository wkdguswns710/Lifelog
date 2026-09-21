"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchTodos,
  insertTodo,
  persistTodoPurposeAndOrder,
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

  /**
   * 드래그로 새로 정렬된 컬럼(purpose) 전체 목록을 받아 화면엔 즉시 반영하고, DB엔 뒤이어 저장한다.
   * 같은 컬럼 안에서의 순서 변경은 물론, 다른 컬럼에서 넘어온 항목(구분이 바뀌는 경우)도 처리한다 —
   * 넘어온 항목이 있으면 전달된 배열에 이미 포함돼 있고, purpose는 이 컬럼 값으로 맞춰 저장한다.
   */
  const reorder = useCallback(
    async (purpose: Purpose, newOrderForPurpose: Todo[]) => {
      const previous = todos;
      const reindexed = newOrderForPurpose.map((t, index) => ({
        ...t,
        purpose,
        sortOrder: index,
      }));
      setTodos((prev) => {
        const movedIds = new Set(reindexed.map((t) => t.id));
        const others = prev.filter((t) => !movedIds.has(t.id));
        return [...others, ...reindexed];
      });
      try {
        await persistTodoPurposeAndOrder(purpose, reindexed.map((t) => t.id));
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
