"use client";

import { useMemo, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { sortTodos } from "@/lib/todos";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

type Filter = "all" | "active" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행중" },
  { key: "done", label: "완료" },
];

export default function TodoApp() {
  const { todos, loaded, add, toggle, update, remove, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState<Filter>("all");

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;

  const visible = useMemo(() => {
    const filtered = todos.filter((t) =>
      filter === "all" ? true : filter === "active" ? !t.done : t.done
    );
    return sortTodos(filtered);
  }, [todos, filter]);

  return (
    <div>
      <TodoForm onAdd={add} />

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                filter === f.key
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-foreground/50">
          <span>남은 일 {remaining}개</span>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              className="rounded px-2 py-1 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
            >
              완료 {doneCount}개 지우기
            </button>
          )}
        </div>
      </div>

      {!loaded ? (
        <p className="py-10 text-center text-sm text-foreground/40">
          불러오는 중…
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 py-12 text-center text-sm text-foreground/50 dark:border-white/15">
          {todos.length === 0
            ? "아직 할 일이 없어요. 위에서 하나 추가해보세요."
            : filter === "done"
              ? "완료한 일이 없어요."
              : "진행 중인 일이 없어요. 다 끝냈네요! 🎉"}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggle}
              onUpdate={update}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
