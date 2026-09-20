"use client";

import { useState } from "react";
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  type Category,
  type Priority,
  type Todo,
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
  draggable,
  dragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onToggle,
  onUpdate,
  onRemove,
}: {
  todo: Todo;
  draggable: boolean;
  dragging: boolean;
  dragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
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
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`group rounded-lg border transition-colors duration-300 ${
        dragOver ? "border-border-strong bg-surface-alt" : "border-border-subtle"
      } ${dragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span
          aria-hidden="true"
          className="shrink-0 cursor-grab select-none text-text-tertiary active:cursor-grabbing"
          title="드래그해서 순서 변경"
        >
          ⠿
        </span>

        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(todo.id)}
          aria-label={done ? "완료 취소" : "완료로 표시"}
          className="size-4 shrink-0 cursor-pointer accent-accent"
        />

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

        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs ${priorityStyle[todo.priority]}`}
        >
          {PRIORITY_LABEL[todo.priority]}
        </span>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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
            onClick={() => onRemove(todo.id)}
            aria-label="삭제"
            title="삭제"
            className="rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
          >
            🗑️
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-1 border-t border-border-subtle px-3 py-2.5 text-xs text-text-secondary">
          <div>
            <span className="text-text-tertiary">메모</span>{" "}
            {todo.memo ? todo.memo : <span className="text-text-tertiary">없음</span>}
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
  onSave,
  onCancel,
}: {
  todo: Todo;
  onSave: (patch: TodoDetailPatch) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(todo.title);
  const [category, setCategory] = useState<Category>(todo.category);
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
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          aria-label="카테고리"
          className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
        >
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <option key={c} value={c} className="bg-background">
              {CATEGORY_LABEL[c]}
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
            onSave({ title, category, priority, dueDate: dueDate || null, memo })
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
