"use client";

import { useState } from "react";
import {
  PRIORITY_LABEL,
  PURPOSE_LABEL,
  type Priority,
  type Purpose,
  type Todo,
  type TodoCategory,
  type TodoDetailPatch,
} from "@/lib/todos";

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

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function TodoItem({
  todo,
  purpose,
  categories,
  categoryName,
  dragging,
  dragOffsetY,
  dragOver,
  startDrag,
  onToggle,
  onUpdate,
  onRemove,
}: {
  todo: Todo;
  purpose: Purpose;
  categories: TodoCategory[];
  categoryName: string | null;
  dragging: boolean;
  dragOffsetY: number;
  dragOver: boolean;
  startDrag: (e: React.PointerEvent, id: number) => void;
  onToggle: (id: number) => void;
  onUpdate: (id: number, patch: TodoDetailPatch) => void;
  onRemove: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const due = dueMeta(todo.dueDate, todo.status === "done");
  const done = todo.status === "done";

  if (editing) {
    return (
      <EditRow
        todo={todo}
        categories={categories}
        onSave={(patch) => {
          onUpdate(todo.id, patch);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <li
      data-todo-id={todo.id}
      data-drop-purpose={purpose}
      style={
        dragging
          ? {
              transform: `translateY(${dragOffsetY}px)`,
              position: "relative",
              zIndex: 10,
              // 손끝을 따라오는 항목 자신이 elementFromPoint에 계속 잡혀서(항상 최상단),
              // 드롭 위치 판정이 매번 "자기 자신"으로 나와 맨 끝으로 튕기던 원인이었다.
              pointerEvents: "none",
            }
          : undefined
      }
      className={`group rounded-lg border bg-background transition-colors duration-300 ${
        dragOver ? "border-border-strong bg-surface-alt" : "border-border-subtle"
      } ${dragging ? "opacity-90 shadow-[0_2px_8px_rgba(0,0,0,0.12)]" : ""}`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span
          aria-hidden="true"
          onPointerDown={(e) => startDrag(e, todo.id)}
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
          className="-m-2 shrink-0 cursor-grab touch-none select-none p-2 text-text-tertiary active:cursor-grabbing"
          title="드래그해서 순서 변경"
        >
          ⠿
        </span>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`min-w-0 flex-1 truncate text-left text-sm ${
            done ? "text-text-tertiary line-through" : ""
          }`}
          title="클릭: 상세정보"
        >
          {todo.title}
        </button>

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

        <div className="flex shrink-0 items-center gap-1">
          {categoryName && (
            <span className="rounded bg-surface-alt px-2 py-0.5 text-xs text-text-secondary">
              {categoryName}
            </span>
          )}
          <span
            className={`rounded px-2 py-0.5 text-xs ${priorityStyle[todo.priority]}`}
          >
            {PRIORITY_LABEL[todo.priority]}
          </span>
        </div>

      </div>

      {expanded && (
        <div className="flex flex-col gap-1 border-t border-border-subtle px-3 py-2.5 text-xs text-text-secondary">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-text-tertiary">메모</span>{" "}
              {todo.memo ? todo.memo : <span className="text-text-tertiary">없음</span>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onToggle(todo.id)}
                aria-label={done ? "완료 취소" : "완료로 표시"}
                title={done ? "완료 취소" : "완료로 표시"}
                className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
              >
                {done ? "↩️" : "✅"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="수정"
                title="수정"
                className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`"${todo.title}"을(를) 삭제할까요?`)) onRemove(todo.id);
                }}
                aria-label="삭제"
                title="삭제"
                className="rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
              >
                🗑️
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-tertiary">
            <span>등록일 {formatDateTime(todo.createdAt)}</span>
            <span>수정일 {formatDateTime(todo.updatedAt)}</span>
            {done && <span>완료일 {formatDateTime(todo.completedAt)}</span>}
          </div>
        </div>
      )}
    </li>
  );
}

function EditRow({
  todo,
  categories,
  onSave,
  onCancel,
}: {
  todo: Todo;
  categories: TodoCategory[];
  onSave: (patch: TodoDetailPatch) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(todo.title);
  const [purpose, setPurpose] = useState<Purpose>(todo.purpose);
  const [categoryId, setCategoryId] = useState<string>(
    todo.categoryId != null ? String(todo.categoryId) : ""
  );
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate ?? "");
  const [memo, setMemo] = useState(todo.memo);

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-accent px-3 py-2.5">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="할 일 제목"
        className="min-w-0 rounded border border-border-subtle bg-transparent px-2 py-1 text-sm outline-none"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as Purpose)}
          aria-label="구분"
          className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          {(Object.keys(PURPOSE_LABEL) as Purpose[]).map((p) => (
            <option key={p} value={p} className="bg-background">
              {PURPOSE_LABEL[p]}
            </option>
          ))}
        </select>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="카테고리"
          className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          <option value="" className="bg-background">
            카테고리 없음
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-background">
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          aria-label="중요도"
          className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
            <option key={p} value={p} className="bg-background">
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="기한"
          className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        />
      </div>
      <input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모(선택)"
        aria-label="메모"
        className="min-w-0 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none placeholder:text-text-tertiary"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() =>
            title.trim() &&
            onSave({
              title,
              purpose,
              categoryId: categoryId ? Number(categoryId) : null,
              priority,
              dueDate: dueDate || null,
              memo,
            })
          }
          className="rounded bg-accent px-2 py-1 text-xs font-medium text-white transition-colors duration-300 hover:bg-accent/90"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-2 py-1 text-xs text-text-tertiary hover:bg-surface-alt"
        >
          취소
        </button>
      </div>
    </li>
  );
}
