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
      className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-black/10 p-3 dark:border-white/10"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일을 입력하고 Enter"
        aria-label="할 일 제목"
        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-foreground/40"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        aria-label="우선순위"
        className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
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
        className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity disabled:opacity-40"
      >
        추가
      </button>
    </form>
  );
}
