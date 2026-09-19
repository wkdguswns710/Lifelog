"use client";

import { useState } from "react";
import { BANKS } from "@/lib/budget";
import type { Account, NewAccount } from "@/lib/accounts";

export default function AccountsDrawer({
  open,
  onClose,
  accounts,
  error,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  error?: string | null;
  onAdd: (input: NewAccount) => void;
  onUpdate: (id: number, patch: Partial<Pick<Account, "bank" | "alias" | "last4">>) => void;
  onRemove: (id: number) => void;
  onReorder: (newOrder: Account[]) => void;
}) {
  const [bank, setBank] = useState(BANKS[0]);
  const [alias, setAlias] = useState("");
  const [last4, setLast4] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  function handleDrop(targetId: number) {
    setDragOverId(null);
    if (dragId === null || dragId === targetId) return;
    const fromIndex = accounts.findIndex((a) => a.id === dragId);
    const toIndex = accounts.findIndex((a) => a.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = [...accounts];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder(next);
    setDragId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!alias.trim()) return;
    onAdd({ bank, alias, last4 });
    setBank(BANKS[0]);
    setAlias("");
    setLast4("");
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="내 계좌"
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border-subtle bg-background transition-transform duration-200 ease-out sm:max-w-md ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏦</span>
            <span className="font-medium">내 계좌</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1.5 text-text-tertiary hover:bg-surface-alt"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {error && (
            <p className="mb-3 rounded bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="mb-4 rounded-lg border border-border-subtle p-3"
          >
            <div className="mb-2 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-text-tertiary">은행</span>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  aria-label="은행"
                  className="rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
                >
                  {BANKS.map((b) => (
                    <option key={b} value={b} className="bg-background">
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs text-text-tertiary">별명</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="예: 생활비 통장"
                  aria-label="별명"
                  className="min-w-0 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-text-tertiary">뒷 4자리</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={last4}
                  onChange={(e) =>
                    setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="선택"
                  aria-label="계좌번호 뒷 4자리"
                  className="w-20 rounded border border-border-subtle bg-transparent px-2 py-1.5 text-sm outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!alias.trim()}
              className="w-full rounded bg-accent py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
            >
              계좌 추가
            </button>
          </form>

          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong py-10 text-center text-sm text-text-tertiary">
              등록된 계좌가 없어요. 위에서 추가해보세요.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {accounts.map((a) =>
                editingId === a.id ? (
                  <EditRow
                    key={a.id}
                    account={a}
                    onSave={(patch) => {
                      onUpdate(a.id, patch);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <li
                    key={a.id}
                    draggable
                    onDragStart={() => setDragId(a.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOverId !== a.id) setDragOverId(a.id);
                    }}
                    onDragLeave={() =>
                      setDragOverId((prev) => (prev === a.id ? null : prev))
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(a.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverId(null);
                    }}
                    className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
                      dragOverId === a.id
                        ? "border-border-strong bg-surface-alt"
                        : "border-border-subtle"
                    } ${dragId === a.id ? "opacity-40" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 cursor-grab select-none text-text-tertiary active:cursor-grabbing"
                      title="드래그해서 순서 변경"
                    >
                      ⠿
                    </span>
                    <span className="shrink-0 rounded bg-surface-alt px-2 py-0.5 text-xs text-text-secondary">
                      {a.bank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {a.alias}
                    </span>
                    {a.last4 && (
                      <span className="shrink-0 text-xs text-text-tertiary">
                        ••{a.last4}
                      </span>
                    )}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(a.id)}
                        aria-label="수정"
                        title="수정"
                        className="rounded p-1 text-text-tertiary hover:bg-surface-alt hover:text-foreground"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(a.id)}
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
      </div>
    </>
  );
}

function EditRow({
  account,
  onSave,
  onCancel,
}: {
  account: Account;
  onSave: (patch: Partial<Pick<Account, "bank" | "alias" | "last4">>) => void;
  onCancel: () => void;
}) {
  const [bank, setBank] = useState(account.bank);
  const [alias, setAlias] = useState(account.alias);
  const [last4, setLast4] = useState(account.last4 ?? "");

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-lg border border-accent px-3 py-2.5">
      <select
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        aria-label="은행"
        className="rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
      >
        {BANKS.map((b) => (
          <option key={b} value={b} className="bg-background">
            {b}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        aria-label="별명"
        className="min-w-0 flex-1 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
      />
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={last4}
        onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
        aria-label="계좌번호 뒷 4자리"
        className="w-16 rounded border border-border-subtle bg-transparent px-2 py-1 text-xs outline-none"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => alias.trim() && onSave({ bank, alias, last4 })}
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
