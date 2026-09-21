"use client";

import { useState } from "react";
import {
  todosByPurpose,
  type Purpose,
  type Todo,
  type TodoCategory,
  type TodoDetailPatch,
} from "@/lib/todos";
import TodoItem from "./TodoItem";

export default function TodoColumn({
  purpose,
  label,
  todos,
  categories,
  dragId,
  setDragId,
  onToggle,
  onUpdate,
  onRemove,
  onReorder,
}: {
  purpose: Purpose;
  label: string;
  todos: Todo[];
  categories: TodoCategory[];
  dragId: number | null;
  setDragId: (id: number | null) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, patch: TodoDetailPatch) => void;
  onRemove: (id: number) => void;
  onReorder: (purpose: Purpose, newOrder: Todo[]) => void;
}) {
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [columnDragOver, setColumnDragOver] = useState(false);

  const items = todosByPurpose(todos, purpose);
  const categoryName = (id: number | null) =>
    id == null ? null : categories.find((c) => c.id === id)?.name ?? null;

  function withDragged(targetIndex: number) {
    if (dragId === null) return null;
    const draggedTodo = todos.find((t) => t.id === dragId);
    if (!draggedTodo) return null;

    const next = items.filter((t) => t.id !== dragId);
    const insertAt = Math.min(targetIndex, next.length);
    next.splice(insertAt, 0, draggedTodo);
    return next;
  }

  function handleDrop(targetId: number) {
    setDragOverId(null);
    setColumnDragOver(false);
    if (dragId === null || dragId === targetId) return;
    const targetIndex = items.findIndex((t) => t.id === targetId);
    if (targetIndex === -1) return;
    const next = withDragged(targetIndex);
    if (!next) return;
    onReorder(purpose, next);
    setDragId(null);
  }

  function handleDropAtEnd() {
    setDragOverId(null);
    setColumnDragOver(false);
    if (dragId === null) return;
    const next = withDragged(items.length);
    if (!next) return;
    onReorder(purpose, next);
    setDragId(null);
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-text-tertiary">{items.length}개</span>
      </div>

      {items.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!columnDragOver) setColumnDragOver(true);
          }}
          onDragLeave={() => setColumnDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            handleDropAtEnd();
          }}
          className={`rounded-xl border border-dashed py-10 text-center text-sm transition-colors duration-300 ${
            columnDragOver
              ? "border-accent bg-surface-alt text-text-secondary"
              : "border-border-strong text-text-tertiary"
          }`}
        >
          {columnDragOver ? "여기에 놓기" : "아직 없어요."}
        </div>
      ) : (
        <ul
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDropAtEnd();
          }}
          className="flex flex-col gap-2"
        >
          {items.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              categories={categories}
              categoryName={categoryName(todo.categoryId)}
              draggable
              dragging={dragId === todo.id}
              dragOver={dragOverId === todo.id}
              onDragStart={() => setDragId(todo.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverId !== todo.id) setDragOverId(todo.id);
              }}
              onDragLeave={() =>
                setDragOverId((prev) => (prev === todo.id ? null : prev))
              }
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDrop(todo.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
                setColumnDragOver(false);
              }}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
