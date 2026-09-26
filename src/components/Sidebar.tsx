"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/lib/nav";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  if (pathname === "/login") return null;

  function isGroupOpen(item: NavItem) {
    if (item.label in openGroups) return openGroups[item.label];
    // 기본값: 지금 보고 있는 페이지가 속한 그룹만 펼쳐진 상태로 시작한다.
    return item.children!.some((child) => pathname.startsWith(child.href));
  }

  function toggleGroup(item: NavItem) {
    setOpenGroups((prev) => ({ ...prev, [item.label]: !isGroupOpen(item) }));
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-alt px-4 py-6 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <img src="/icon.svg" alt="" width={24} height={24} className="rounded-[5px]" />
        <span className="text-lg font-medium tracking-tight">Lifelog</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          if (item.children) {
            const groupActive = item.children.some((child) =>
              pathname.startsWith(child.href)
            );
            const open = isGroupOpen(item);

            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item)}
                  aria-expanded={open}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300 hover:bg-background ${
                    groupActive
                      ? "font-medium text-foreground"
                      : "text-text-secondary"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={`text-xs text-text-tertiary transition-transform duration-300 ${
                      open ? "rotate-90" : ""
                    }`}
                  >
                    ▸
                  </span>
                </button>
                {open && (
                  <div className="ml-3.5 flex flex-col gap-1 border-l border-border-subtle pl-3">
                    {item.children.map((child) => {
                      const active = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`rounded px-3 py-1.5 text-sm transition-colors duration-300 ${
                            active
                              ? "bg-background font-medium text-foreground"
                              : "text-text-secondary hover:bg-background"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-300 ${
                active
                  ? "bg-background font-medium text-foreground"
                  : "text-text-secondary hover:bg-background"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border-subtle pt-3">
        <ThemeToggle />
      </div>
    </aside>
  );
}
