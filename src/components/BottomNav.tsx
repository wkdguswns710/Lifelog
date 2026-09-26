"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/lib/nav";

type Anchor = { item: NavItem; left: number; align: "left" | "right" | "center" };

export default function BottomNav() {
  const pathname = usePathname();
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnchor(null);
  }, [pathname]);

  useEffect(() => {
    if (!anchor) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        navRef.current &&
        !navRef.current.contains(target) &&
        !(menuRef.current && menuRef.current.contains(target))
      ) {
        setAnchor(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchor]);

  if (pathname === "/login") return null;

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, item: NavItem, index: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    const align = index === 0 ? "left" : index === navItems.length - 1 ? "right" : "center";
    setAnchor((prev) =>
      prev?.item.label === item.label
        ? null
        : { item, left: align === "right" ? rect.right : align === "center" ? rect.left + rect.width / 2 : rect.left, align }
    );
  }

  return (
    <>
      <nav
        ref={navRef}
        className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-border-subtle bg-background pb-[env(safe-area-inset-bottom)] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
        aria-label="주 메뉴"
      >
        {navItems.map((item, index) => {
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
                onClick={(e) => openMenu(e, item, index)}
                aria-expanded={anchor?.item.label === item.label}
                className={`flex w-16 shrink-0 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-300 ${
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
              className={`flex w-16 shrink-0 flex-col items-center gap-0.5 py-2 text-[11px] transition-colors duration-300 ${
                active ? "text-foreground" : "text-text-tertiary"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {anchor?.item.children && (
        <div
          ref={menuRef}
          style={{
            left: anchor.left,
            transform:
              anchor.align === "right"
                ? "translateX(-100%)"
                : anchor.align === "center"
                  ? "translateX(-50%)"
                  : undefined,
          }}
          className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] z-50 flex flex-col gap-0.5 whitespace-nowrap rounded-lg border border-border-strong bg-background p-1 md:hidden"
        >
          {anchor.item.children.map((child) => {
            const childActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setAnchor(null)}
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
    </>
  );
}
