"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setNotice(null);
    setError(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setSubmitting(false);
      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않아요.");
        return;
      }
      router.push("/");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setSubmitting(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/");
      } else {
        setNotice("가입 확인 이메일을 보냈어요. 메일함을 확인한 뒤 로그인해주세요.");
        setMode("login");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-border-subtle p-8">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl">🗂️</span>
          <h1 className="text-lg font-medium tracking-tight">Lifelog</h1>
          <p className="text-sm text-text-tertiary">
            내 일상을 한 곳에서 기록하고 관리하세요.
          </p>
        </div>

        <div className="mb-6 flex rounded border border-border-subtle p-0.5">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setNotice(null);
                setError(null);
              }}
              className={`flex-1 rounded px-3 py-1.5 text-sm transition-colors duration-300 ${
                mode === m
                  ? "bg-surface-alt font-medium text-foreground"
                  : "text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">이메일</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="이메일"
              className="rounded border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary">비밀번호</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              aria-label="비밀번호"
              minLength={6}
              className="rounded border border-border-subtle bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="mt-2 rounded bg-accent py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent/90 disabled:opacity-40"
          >
            {submitting
              ? "처리 중…"
              : mode === "login"
                ? "로그인"
                : "계정 만들기"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {notice && (
          <p className="mt-4 rounded bg-surface-alt px-3 py-2 text-center text-xs text-text-secondary">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
