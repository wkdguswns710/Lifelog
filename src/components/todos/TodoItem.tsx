"use client";

import { useState } from "react";
import { PRIORITY_LABEL, type Priority, type Todo } from "@/lib/todos";

const priorityStyle: Record<Priority, string> = {
  high: "bg-red-500/15 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

function todayStr(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function dueMeta(dueDate: string | null, done: boolean) {
  if (!dueDate) return null;
  const today = todayStr();
  const overdue = dueDate < today && !done;
  const isToday = dueDate === today;
  const label = isToday ? "오늘" : dueDate.slice(5).replace("-", "/");
  return { overdue, isToday, label };
}

export default function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onRemove,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<Todo, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, { title: trimmed });
    } else {
      setDraft(todo.title);
    }
    setEditing(false);
  }

  const due = dueMeta(todo.dueDate, todo.done);

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-border-subtle px-3 py-2.5">
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.done ? "완료 취소" : "완료로 표시"}
        className="size-4 shrink-0 cursor-pointer accent-accent"
      />

      {editing ? (
        <input
          type="text"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(todo.title);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      ) : (
        <button
          type="button"
          onDoubleClick={() => setEditing(true)}
          onClick={() => onToggle(todo.id)}
          className={`min-w-0 flex-1 truncate text-left text-sm ${
            todo.done ? "text-text-tertiary line-through" : ""
          }`}
          title="클릭: 완료 토글 · 더블클릭: 수정"
        >
          {todo.title}
        </button>
      )}

      {due && (
        <span
          className={`shrink-0 text-xs ${
            due.overdue
              ? "font-medium text-red-500"
              : due.isToday
                ? "font-medium text-text-secondary"
                : "text-text-tertiary"
          }`}
        >
          {due.overdue ? "⚠ " : "📅 "}
          {due.label}
        </span>
      )}

      <span
        className={`shrink-0 rounded px-2 py-0.5 text-xs ${priorityStyle[todo.priority]}`}
      >
        {PRIORITY_LABEL[todo.priority]}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => {
            setDraft(todo.title);
            setEditing(true);
          }}
          aria-label="수정"
          title="수정"
          className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onRemove(todo.id)}
          aria-label="삭제"
          title="삭제"
          className="rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
