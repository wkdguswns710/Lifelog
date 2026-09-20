import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { navItems } from "@/lib/nav";

export default function DashboardPage() {
  const cards = navItems.filter((item) => item.href !== "/");

  return (
    <div className="mx-auto max-w-[1383px]">
      <PageHeader
        title="대시보드"
        description="오늘의 Lifelog를 한눈에. 아래 카드에서 각 메뉴로 이동하세요."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border-subtle p-5 transition-colors duration-300 hover:border-border-strong hover:bg-surface-alt"
          >
            <div className="mb-3 text-2xl">{item.icon}</div>
            <div className="font-medium">{item.label}</div>
            <div className="mt-1 text-sm text-text-secondary">
              {item.description}
            </div>
            <div className="mt-4 text-sm text-text-tertiary group-hover:text-text-secondary">
              바로가기 →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
