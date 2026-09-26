"use client";

import { useCallback, useState } from "react";
import type { TodoCategory } from "@/lib/todos";
import { usePointerReorder } from "@/hooks/usePointerReorder";

export default function TodoCategoryPanel({
  categories,
  loaded,
  error,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: {
  categories: TodoCategory[];
  loaded: boolean;
  error?: string | null;
  onAdd: (name: string) => void;
  onUpdate: (id: number, name: string) => void;
  onRemove: (id: number) => void;
  onReorder: (newOrder: TodoCategory[]) => void;
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const getId = useCallback((c: TodoCategory) => c.id, []);
  const { dragId, overId, dragOffsetY, startDrag } = usePointerReorder(
    categories,
    getId,
    onReorder
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  }

  return (
    <div className="rounded-xl border border-border-subtle p-3 md:w-56 md:shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">🏷️</span>
        <span className="font-medium">카테고리</span>
      </div>

      {error && (
        <p className="mb-3 rounded bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mb-3 flex gap-1.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 운동"
          aria-label="새 카테고리 이름"
          className="min-w-0 flex-1 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-tertiary"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="shrink-0 rounded bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
        >
          추가
        </button>
      </form>

      {!loaded ? (
        <p className="py-8 text-center text-xs text-text-tertiary">
          불러오는 중…
        </p>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong py-8 text-center text-xs text-text-tertiary">
          아직 카테고리가 없어요.
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {categories.map((c) =>
            editingId === c.id ? (
              <li key={c.id} className="flex items-center gap-1">
                <input
                  type="text"
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (draft.trim()) onUpdate(c.id, draft);
                      setEditingId(null);
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="min-w-0 flex-1 rounded border border-accent bg-transparent px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (draft.trim()) onUpdate(c.id, draft);
                    setEditingId(null);
                  }}
                  aria-label="저장"
                  title="저장"
                  className="shrink-0 rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
                >
                  ✓
                </button>
              </li>
            ) : (
              <li
                key={c.id}
                data-drag-id={c.id}
                style={
                  dragId === c.id
                    ? {
                        transform: `translateY(${dragOffsetY}px)`,
                        position: "relative",
                        zIndex: 10,
                        pointerEvents: "none",
                      }
                    : undefined
                }
                className={`group flex items-center gap-2 rounded bg-background px-2 py-1.5 transition-colors duration-300 ${
                  overId === c.id ? "bg-surface-alt" : "hover:bg-surface-alt"
                } ${dragId === c.id ? "opacity-90 shadow-[0_2px_8px_rgba(0,0,0,0.12)]" : ""}`}
              >
                <span
                  aria-hidden="true"
                  onPointerDown={(e) => startDrag(e, c.id)}
                  style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
                  className="-m-2 shrink-0 cursor-grab touch-none select-none p-2 text-text-tertiary active:cursor-grabbing"
                  title="드래그해서 순서 변경"
                >
                  ⠿
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(c.name);
                      setEditingId(c.id);
                    }}
                    aria-label="수정"
                    title="수정"
                    className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `"${c.name}" 카테고리를 삭제할까요? 이 카테고리를 쓰던 할 일은 지워지지 않고 카테고리만 없어져요.`
                        )
                      )
                        onRemove(c.id);
                    }}
                    aria-label="삭제"
                    title="삭제"
                    className="rounded p-1 text-text-tertiary hover:bg-red-500/10 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
