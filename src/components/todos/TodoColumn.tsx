"use client";

import { useState } from "react";
import { todosByCategory, type Category, type Todo, type TodoDetailPatch } from "@/lib/todos";
import TodoItem from "./TodoItem";

export default function TodoColumn({
  category,
  label,
  todos,
  onToggle,
  onUpdate,
  onRemove,
  onReorder,
}: {
  category: Category;
  label: string;
  todos: Todo[];
  onToggle: (id: number) => void;
  onUpdate: (id: number, patch: TodoDetailPatch) => void;
  onRemove: (id: number) => void;
  onReorder: (category: Category, newOrder: Todo[]) => void;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const items = todosByCategory(todos, category);

  function handleDrop(targetId: number) {
    setDragOverId(null);
    if (dragId === null || dragId === targetId) return;
    const fromIndex = items.findIndex((t) => t.id === dragId);
    const toIndex = items.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder(category, next);
    setDragId(null);
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-text-tertiary">{items.length}개</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong py-10 text-center text-sm text-text-tertiary">
          아직 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
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
                handleDrop(todo.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
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
