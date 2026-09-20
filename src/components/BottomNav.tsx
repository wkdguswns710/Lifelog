"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-subtle bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="주 메뉴"
    >
      {navItems.map((item) => {
        const targetHref = item.children ? item.children[0].href : item.href;
        const active = item.children
          ? item.children.some((child) => pathname.startsWith(child.href))
          : item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={targetHref}
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
