"use client";

import { useState } from "react";
import { BANKS } from "@/lib/budget";
import type { Account, NewAccount } from "@/lib/accounts";

export default function AccountsDrawer({
  open,
  onClose,
  accounts,
  onAdd,
  onUpdate,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onAdd: (input: NewAccount) => void;
  onUpdate: (id: string, patch: Partial<Omit<Account, "id" | "createdAt">>) => void;
  onRemove: (id: string) => void;
}) {
  const [bank, setBank] = useState(BANKS[0]);
  const [alias, setAlias] = useState("");
  const [last4, setLast4] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

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
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-black/10 bg-background transition-transform duration-200 ease-out sm:max-w-md dark:border-white/10 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏦</span>
            <span className="font-medium">내 계좌</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1.5 text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="mb-4 rounded-lg border border-black/10 p-3 dark:border-white/15"
          >
            <div className="mb-2 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-foreground/50">은행</span>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  aria-label="은행"
                  className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
                >
                  {BANKS.map((b) => (
                    <option key={b} value={b} className="bg-background">
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs text-foreground/50">별명</span>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="예: 생활비 통장"
                  aria-label="별명"
                  className="min-w-0 rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-foreground/50">뒷 4자리</span>
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
                  className="w-20 rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm outline-none dark:border-white/15"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!alias.trim()}
              className="w-full rounded-md bg-foreground py-1.5 text-sm font-medium text-background transition-opacity disabled:opacity-40"
            >
              계좌 추가
            </button>
          </form>

          {accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/15 py-10 text-center text-sm text-foreground/50 dark:border-white/15">
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
                    className="group flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2.5 dark:border-white/10"
                  >
                    <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-xs text-foreground/70 dark:bg-white/10">
                      {a.bank}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {a.alias}
                    </span>
                    {a.last4 && (
                      <span className="shrink-0 text-xs text-foreground/40">
                        ••{a.last4}
                      </span>
                    )}
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(a.id)}
                        aria-label="수정"
                        title="수정"
                        className="rounded p-1 text-foreground/50 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(a.id)}
                        aria-label="삭제"
                        title="삭제"
                        className="rounded p-1 text-foreground/50 hover:bg-red-500/10 hover:text-red-500"
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
  onSave: (patch: Partial<Omit<Account, "id" | "createdAt">>) => void;
  onCancel: () => void;
}) {
  const [bank, setBank] = useState(account.bank);
  const [alias, setAlias] = useState(account.alias);
  const [last4, setLast4] = useState(account.last4);

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-lg border border-foreground/30 px-3 py-2.5">
      <select
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        aria-label="은행"
        className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/15"
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
        className="min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/15"
      />
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={last4}
        onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
        aria-label="계좌번호 뒷 4자리"
        className="w-16 rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/15"
      />
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => alias.trim() && onSave({ bank, alias, last4 })}
          className="rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-xs text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
        >
          취소
        </button>
      </div>
    </li>
  );
}
