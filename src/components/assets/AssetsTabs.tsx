"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/assets/budget", label: "가계부" },
  { href: "/assets/stats", label: "통계" },
];

export default function AssetsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 inline-flex rounded border border-border-subtle p-0.5">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded px-4 py-1.5 text-sm transition-colors duration-300 ${
              active
                ? "bg-surface-alt font-medium text-foreground"
                : "text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
