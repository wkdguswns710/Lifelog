"use client";

import {
  todosByPurpose,
  type Purpose,
  type Todo,
  type TodoCategory,
  type TodoDetailPatch,
} from "@/lib/todos";
import TodoItem from "./TodoItem";

type DropTarget = { purpose: Purpose; beforeId: number | null };

export default function TodoColumn({
  purpose,
  label,
  todos,
  categories,
  dragId,
  overTarget,
  startDrag,
  onToggle,
  onUpdate,
  onRemove,
}: {
  purpose: Purpose;
  label: string;
  todos: Todo[];
  categories: TodoCategory[];
  dragId: number | null;
  overTarget: DropTarget | null;
  startDrag: (e: React.PointerEvent, id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, patch: TodoDetailPatch) => void;
  onRemove: (id: number) => void;
}) {
  const items = todosByPurpose(todos, purpose);
  const categoryName = (id: number | null) =>
    id == null ? null : categories.find((c) => c.id === id)?.name ?? null;

  const columnOverEnd = overTarget?.purpose === purpose && overTarget.beforeId === null;
  // 목록 마지막 항목 아래엔 드롭할 공간이 거의 없어서, 드래그 중에만 나타나는 전용 존을 둔다.
  const showEndZone = dragId !== null && items.length > 0;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-text-tertiary">{items.length}개</span>
      </div>

      {items.length === 0 ? (
        <div
          data-drop-purpose={purpose}
          className={`rounded-xl border border-dashed py-10 text-center text-sm transition-colors duration-300 ${
            columnOverEnd
              ? "border-accent bg-surface-alt text-text-secondary"
              : "border-border-strong text-text-tertiary"
          }`}
        >
          {columnOverEnd ? "여기에 놓기" : "아직 없어요."}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              purpose={purpose}
              categories={categories}
              categoryName={categoryName(todo.categoryId)}
              dragging={dragId === todo.id}
              dragOver={overTarget?.purpose === purpose && overTarget.beforeId === todo.id}
              startDrag={startDrag}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}

      {showEndZone && (
        <div
          data-drop-purpose={purpose}
          className={`mt-2 rounded-lg border border-dashed py-3 text-center text-xs transition-colors duration-300 ${
            columnOverEnd
              ? "border-accent bg-surface-alt text-text-secondary"
              : "border-border-subtle text-text-tertiary"
          }`}
        >
          맨 아래로 옮기기
        </div>
      )}
    </div>
  );
}
