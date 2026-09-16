"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {!hideChrome && (
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:hidden dark:border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🗂️</span>
            <span className="text-base font-semibold tracking-tight">
              Lifelog
            </span>
          </Link>
          <ThemeToggle compact />
        </div>
      )}

      <Sidebar />

      <main className="flex-1 px-6 py-8 pb-24 sm:px-10 md:pb-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
