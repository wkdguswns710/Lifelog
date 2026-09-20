"use client";

import { useTodos } from "@/hooks/useTodos";
import { CATEGORY_LABEL } from "@/lib/todos";
import TodoForm from "./TodoForm";
import TodoColumn from "./TodoColumn";

export default function TodoApp() {
  const { todos, loaded, error, add, toggle, update, remove, reorder } = useTodos();

  return (
    <div>
      <TodoForm onAdd={add} />

      {error && (
        <p className="mb-4 rounded bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      {!loaded ? (
        <p className="py-10 text-center text-sm text-text-tertiary">
          불러오는 중…
        </p>
      ) : (
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <TodoColumn
            category="need"
            label={CATEGORY_LABEL.need}
            todos={todos}
            onToggle={toggle}
            onUpdate={update}
            onRemove={remove}
            onReorder={reorder}
          />
          <TodoColumn
            category="want"
            label={CATEGORY_LABEL.want}
            todos={todos}
            onToggle={toggle}
            onUpdate={update}
            onRemove={remove}
            onReorder={reorder}
          />
        </div>
      )}
    </div>
  );
}
