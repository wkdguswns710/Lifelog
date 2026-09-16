"use client";

import { useState } from "react";

type Mode = "login" | "signup";

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    // Supabase Auth 연동 전 화면 검증용 자리표시자.
    setSubmitting(true);
    setNotice(null);
    setTimeout(() => {
      setSubmitting(false);
      setNotice("화면만 먼저 만들었어요. 다음 단계에서 실제 로그인 기능을 연결할게요.");
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-black/10 p-8 dark:border-white/10">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl">🗂️</span>
          <h1 className="text-lg font-semibold tracking-tight">Lifelog</h1>
          <p className="text-sm text-foreground/50">
            내 일상을 한 곳에서 기록하고 관리하세요.
          </p>
        </div>

        <div className="mb-6 flex rounded-lg border border-black/10 p-0.5 dark:border-white/15">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setNotice(null);
              }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
                mode === m
                  ? "bg-foreground font-medium text-background"
                  : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-foreground/50">이메일</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="이메일"
              className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-foreground/50">비밀번호</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              aria-label="비밀번호"
              minLength={6}
              className="rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/15"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="mt-2 rounded-md bg-foreground py-2 text-sm font-medium text-background transition-opacity disabled:opacity-40"
          >
            {submitting
              ? "처리 중…"
              : mode === "login"
                ? "로그인"
                : "계정 만들기"}
          </button>
        </form>

        {notice && (
          <p className="mt-4 rounded-md bg-black/[0.03] px-3 py-2 text-center text-xs text-foreground/60 dark:bg-white/[0.06]">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
