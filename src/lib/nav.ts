export type NavItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "대시보드", icon: "🏠", description: "오늘 한눈에 보기" },
  { href: "/todos", label: "할 일", icon: "✅", description: "오늘/최근 해야 할 일" },
  { href: "/budget", label: "가계부", icon: "💰", description: "수입·지출 기록과 통계" },
  { href: "/closet", label: "옷장", icon: "👕", description: "가지고 있는 옷 관리" },
  { href: "/devlog", label: "개발노트", icon: "📝", description: "공부한 개발 정보 기록" },
];
