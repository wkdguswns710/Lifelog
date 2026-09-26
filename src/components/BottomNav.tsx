"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  useEffect(() => {
    if (!openLabel) return;
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openLabel]);

  if (pathname === "/login") return null;

  return (
    <nav
      ref={navRef}
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
          const open = openLabel === item.label;
          return (
            <div key={item.label} className="relative flex flex-1">
              {open && (
                <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col gap-0.5 whitespace-nowrap rounded-lg border border-border-strong bg-background p-1">
                  {item.children.map((child) => {
                    const childActive = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpenLabel(null)}
                        className={`rounded px-4 py-2 text-left text-sm transition-colors duration-300 ${
                          childActive
                            ? "bg-surface-alt font-medium text-foreground"
                            : "text-text-secondary hover:bg-surface-alt"
                        }`}
                      >
                        {child.icon} {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
              <button
                type="button"
                onClick={() => setOpenLabel(open ? null : item.label)}
                aria-expanded={open}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-300 ${
                  active ? "text-foreground" : "text-text-tertiary"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            </div>
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
  );
}
