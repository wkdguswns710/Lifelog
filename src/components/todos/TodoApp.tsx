"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useTodoCategories } from "@/hooks/useTodoCategories";
import { PURPOSE_LABEL, todosByPurpose, type Purpose } from "@/lib/todos";
import TodoForm from "./TodoForm";
import TodoColumn from "./TodoColumn";
import TodoCategoryPanel from "./TodoCategoryPanel";

const PURPOSE_ORDER: Purpose[] = ["need", "life", "want"];

type DropTarget = { purpose: Purpose; beforeId: number | null };

export default function TodoApp() {
  const { todos, loaded, error: todoError, add, toggle, update, remove, reorder } =
    useTodos();
  const categoriesState = useTodoCategories();
  const [dragId, setDragId] = useState<number | null>(null);
  const [overTarget, setOverTarget] = useState<DropTarget | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const dragStartYRef = useRef(0);
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const error = todoError || categoriesState.error;

  const startDrag = useCallback((e: React.PointerEvent, id: number) => {
    e.preventDefault();
    dragStartYRef.current = e.clientY;
    setDragOffsetY(0);
    setDragId(id);
  }, []);

  // 마우스/터치를 통일해서 다룬다 — HTML5 네이티브 드래그는 모바일 터치에서 동작하지 않는다.
  useEffect(() => {
    if (dragId === null) return;

    function handleMove(e: PointerEvent) {
      setDragOffsetY(e.clientY - dragStartYRef.current);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest<HTMLElement>("[data-drop-purpose]");
      if (!target) {
        setOverTarget(null);
        return;
      }
      const purpose = target.dataset.dropPurpose as Purpose;
      const todoId = target.dataset.todoId;
      setOverTarget({
        purpose,
        beforeId: todoId ? Number(todoId) : null,
      });
    }

    function finishDrag() {
      setOverTarget((target) => {
        if (target) {
          const currentItems = todosByPurpose(todosRef.current, target.purpose).filter(
            (t) => t.id !== dragId
          );
          const draggedTodo = todosRef.current.find((t) => t.id === dragId);
          if (draggedTodo) {
            const insertAt =
              target.beforeId === null
                ? currentItems.length
                : currentItems.findIndex((t) => t.id === target.beforeId);
            const next = [...currentItems];
            next.splice(insertAt === -1 ? currentItems.length : insertAt, 0, draggedTodo);
            reorder(target.purpose, next);
          }
        }
        return null;
      });
      setDragId(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [dragId, reorder]);

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
          loaded={categoriesState.loaded}
          onAdd={(name) => categoriesState.add({ name })}
          onUpdate={categoriesState.update}
          onRemove={categoriesState.remove}
          onReorder={categoriesState.reorder}
        />

        <div className="min-w-0 flex-1">
          <TodoForm categories={categoriesState.categories} onAdd={add} />

          {!loaded ? (
            <p className="py-10 text-center text-sm text-text-tertiary">
              불러오는 중…
            </p>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              {PURPOSE_ORDER.map((purpose) => (
                <TodoColumn
                  key={purpose}
                  purpose={purpose}
                  label={PURPOSE_LABEL[purpose]}
                  todos={todos}
                  categories={categoriesState.categories}
                  dragId={dragId}
                  dragOffsetY={dragOffsetY}
                  overTarget={overTarget}
                  startDrag={startDrag}
                  onToggle={toggle}
                  onUpdate={update}
                  onRemove={remove}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
