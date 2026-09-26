"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { useSession } from "@/hooks/useSession";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loaded } = useSession();
  const hideChrome = pathname === "/login";

  useEffect(() => {
    if (!loaded) return;
    if (!session && !hideChrome) {
      router.replace("/login");
    } else if (session && hideChrome) {
      router.replace("/");
    }
  }, [loaded, session, hideChrome, router]);

  // 로그인 상태 확인 전이거나, 리다이렉트가 곧 일어날 상태라면
  // 보호된 화면이 잠깐이라도 비치지 않게 빈 화면을 보여준다.
  if (!loaded || (!session && !hideChrome) || (session && hideChrome)) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {!hideChrome && (
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 md:hidden">
          <div className="flex items-center gap-1">
            <MobileMenu />
            <Link href="/" className="flex items-center gap-2 px-1">
              <img src="/icon.svg" alt="" width={22} height={22} className="rounded-[5px]" />
              <span className="text-base font-medium tracking-tight">
                Lifelog
              </span>
            </Link>
          </div>
          <ThemeToggle compact />
        </div>
      )}

      <Sidebar />

      <main className="flex-1 px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
