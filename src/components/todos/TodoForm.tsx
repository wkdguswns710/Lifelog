"use client";

import { useState } from "react";
import { PRIORITY_LABEL, type NewTodo, type Priority } from "@/lib/todos";

export default function TodoForm({ onAdd }: { onAdd: (input: NewTodo) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, priority, dueDate: dueDate || null });
    setTitle("");
    setPriority("medium");
    setDueDate("");
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
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="우선순위"
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
        aria-label="마감일"
        className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
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
