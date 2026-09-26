"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [displayGroup, setDisplayGroup] = useState<NavItem | null>(null);

  const openGroup = navItems.find((item) => item.label === openLabel) ?? null;

  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  useEffect(() => {
    // 닫히는 애니메이션 중에도 내용이 안 사라지도록, 열려 있던 그룹을 계속 기억해둔다.
    if (openGroup) setDisplayGroup(openGroup);
  }, [openGroup]);

  if (pathname === "/login") return null;

  const open = openGroup !== null;

  return (
    <>
      <div
        onClick={() => setOpenLabel(null)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[rgba(128,128,128,0.65)] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-subtle bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="주 메뉴"
      >
        {navItems.map((item) => {
          const active = item.children
            ? item.children.some((child) => pathname.startsWith(child.href))
            : item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.children) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  setOpenLabel((prev) => (prev === item.label ? null : item.label))
                }
                aria-expanded={openLabel === item.label}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-300 ${
                  active ? "text-foreground" : "text-text-tertiary"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-300 ${
                active ? "text-foreground" : "text-text-tertiary"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={displayGroup?.label}
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-border-strong bg-background pb-[env(safe-area-inset-bottom)] transition-transform duration-300 md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <span className="text-sm font-medium">{displayGroup?.label}</span>
          <button
            type="button"
            onClick={() => setOpenLabel(null)}
            aria-label="닫기"
            className="rounded p-1 text-text-tertiary hover:bg-surface-alt"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col p-2">
          {displayGroup?.children?.map((child) => {
            const childActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpenLabel(null)}
                className={`flex items-center gap-3 rounded px-3 py-3 text-sm transition-colors duration-300 ${
                  childActive
                    ? "bg-surface-alt font-medium text-foreground"
                    : "text-text-secondary hover:bg-surface-alt"
                }`}
              >
                <span className="text-base">{child.icon}</span>
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
