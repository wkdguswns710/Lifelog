"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openChildLabel, setOpenChildLabel] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  function closeAll() {
    setOpen(false);
    setOpenChildLabel(null);
  }

  useEffect(() => {
    closeAll();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeAll();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? closeAll() : setOpen(true))}
        aria-label="전체 메뉴"
        aria-expanded={open}
        className="rounded p-1.5 text-foreground hover:bg-surface-alt"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <nav
          aria-label="전체 메뉴"
          className="absolute left-0 top-full z-50 mt-2 w-44 rounded-lg border border-border-strong bg-background p-1 md:hidden"
        >
          {navItems.map((item) => {
            const targetHref = item.children ? item.children[0].href : item.href;
            const active = item.children
              ? item.children.some((child) => pathname.startsWith(child.href))
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const childOpen = openChildLabel === item.label;

            return (
              <div key={item.label} className="relative">
                {item.children ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenChildLabel((prev) => (prev === item.label ? null : item.label))
                    }
                    aria-expanded={childOpen}
                    className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-sm transition-colors duration-300 ${
                      active || childOpen
                        ? "bg-surface-alt font-medium text-foreground"
                        : "text-text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span aria-hidden="true" className="text-xs text-text-tertiary">
                      ▸
                    </span>
                  </button>
                ) : (
                  <Link
                    href={targetHref}
                    className={`flex items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors duration-300 ${
                      active
                        ? "bg-surface-alt font-medium text-foreground"
                        : "text-text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                )}

                {item.children && childOpen && (
                  <div className="absolute left-full top-0 z-50 ml-1 w-36 rounded-lg border border-border-strong bg-background p-1">
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 rounded px-2.5 py-2 text-sm transition-colors duration-300 ${
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
                )}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}
