"use client";

import { useState } from "react";
import {
  PRIORITY_LABEL,
  PURPOSE_LABEL,
  type NewTodo,
  type Priority,
  type Purpose,
  type TodoCategory,
} from "@/lib/todos";

export default function TodoForm({
  categories,
  onAdd,
}: {
  categories: TodoCategory[];
  onAdd: (input: NewTodo) => void;
}) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("need");
  const [categoryId, setCategoryId] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      purpose,
      categoryId: categoryId ? Number(categoryId) : null,
      priority,
      dueDate: dueDate || null,
      memo,
    });
    setTitle("");
    setPurpose("need");
    setCategoryId("");
    setPriority("medium");
    setDueDate("");
    setMemo("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border-subtle p-3"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일을 입력하고 Enter"
        aria-label="할 일 제목"
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-tertiary"
      />
      <select
        value={purpose}
        onChange={(e) => setPurpose(e.target.value as Purpose)}
        aria-label="구분"
        className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
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
        className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
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
        className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
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
        className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
      />
      <input
        type="text"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모(선택)"
        aria-label="메모"
        className="min-w-0 flex-1 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-tertiary"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
      >
        추가
      </button>
    </form>
  );
}
