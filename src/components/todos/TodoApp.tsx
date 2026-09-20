"use client";

import { useTodos } from "@/hooks/useTodos";
import { useTodoCategories } from "@/hooks/useTodoCategories";
import { PURPOSE_LABEL } from "@/lib/todos";
import TodoForm from "./TodoForm";
import TodoColumn from "./TodoColumn";
import TodoCategoryPanel from "./TodoCategoryPanel";

export default function TodoApp() {
  const { todos, loaded, error: todoError, add, toggle, update, remove, reorder } =
    useTodos();
  const categoriesState = useTodoCategories();

  const error = todoError || categoriesState.error;

  return (
    <div>
      {error && (
        <p className="mb-4 rounded bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <TodoCategoryPanel
          categories={categoriesState.categories}
          onAdd={(name) => categoriesState.add({ name })}
          onUpdate={categoriesState.update}
          onRemove={categoriesState.remove}
        />

        <div className="min-w-0 flex-1">
          <TodoForm categories={categoriesState.categories} onAdd={add} />

          {!loaded ? (
            <p className="py-10 text-center text-sm text-text-tertiary">
              불러오는 중…
            </p>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <TodoColumn
                purpose="need"
                label={PURPOSE_LABEL.need}
                todos={todos}
                categories={categoriesState.categories}
                onToggle={toggle}
                onUpdate={update}
                onRemove={remove}
                onReorder={reorder}
              />
              <TodoColumn
                purpose="want"
                label={PURPOSE_LABEL.want}
                todos={todos}
                categories={categoriesState.categories}
                onToggle={toggle}
                onUpdate={update}
                onRemove={remove}
                onReorder={reorder}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
