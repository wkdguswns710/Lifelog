"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[rgba(128,128,128,0.65)] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
        className={`fixed inset-x-0 top-0 z-50 max-h-[80vh] overflow-y-auto rounded-b-xl border-b border-border-strong bg-background transition-transform duration-300 md:hidden ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="flex flex-col p-2">
          {navItems.map((item) => {
            const targetHref = item.children ? item.children[0].href : item.href;
            const active = item.children
              ? item.children.some((child) => pathname.startsWith(child.href))
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <div
                key={item.label}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border-subtle px-2 py-2.5 last:border-b-0"
              >
                <Link
                  href={targetHref}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors duration-300 ${
                    active
                      ? "font-medium text-foreground"
                      : "text-text-secondary hover:bg-surface-alt"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>

                {item.children && (
                  <div className="flex flex-1 flex-wrap justify-end gap-1.5">
                    {item.children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`rounded px-2.5 py-1 text-xs transition-colors duration-300 ${
                            childActive
                              ? "bg-surface-alt font-medium text-foreground"
                              : "text-text-tertiary hover:bg-surface-alt"
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
          })}
        </nav>
      </div>
    </>
  );
}
