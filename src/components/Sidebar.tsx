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
          if (item.children) {
            const groupActive = item.children.some((child) =>
              pathname.startsWith(child.href)
            );

            return (
              <div key={item.label}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 text-sm ${
                    groupActive
                      ? "font-medium text-foreground"
                      : "text-text-secondary"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </div>
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
