"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTodo,
  loadTodos,
  saveTodos,
  type NewTodo,
  type Todo,
} from "@/lib/todos";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 최초 마운트 시 localStorage에서 불러온다. (SSR/CSR 렌더 불일치 방지)
  useEffect(() => {
    setTodos(loadTodos());
    setLoaded(true);
  }, []);

  // 변경될 때마다 저장한다. 초기 로드 전에는 저장하지 않는다.
  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  const add = useCallback((input: NewTodo) => {
    if (!input.title.trim()) return;
    setTodos((prev) => [createTodo(input), ...prev]);
  }, []);

  const toggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const remove = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, []);

  return { todos, loaded, add, toggle, update, remove, clearCompleted };
}
