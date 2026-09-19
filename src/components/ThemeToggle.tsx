"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  // 인라인 스크립트가 이미 <html data-theme>를 설정하므로, 마운트 후 그 값을 읽어와 동기화한다.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={
        compact
          ? "flex size-9 items-center justify-center rounded text-base text-text-secondary transition-colors duration-300 hover:bg-surface-alt"
          : "flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-text-secondary transition-colors duration-300 hover:bg-surface-alt"
      }
    >
      {/* 마운트 전에는 아이콘을 숨겨 서버/클라이언트 렌더 불일치를 피한다. */}
      <span className="text-base" aria-hidden>
        {theme === null ? "" : isDark ? "🌙" : "☀️"}
      </span>
      {!compact && (
        <span>{theme === null ? "" : isDark ? "다크 모드" : "라이트 모드"}</span>
      )}
    </button>
  );
}
