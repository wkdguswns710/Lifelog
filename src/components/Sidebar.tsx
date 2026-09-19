"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-alt px-4 py-6 md:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <span className="text-xl">🗂️</span>
        <span className="text-lg font-medium tracking-tight">Lifelog</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
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
