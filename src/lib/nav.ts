export type NavItem = {
  href: string;
  label: string;
  icon: string;
  description: string;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { href: "/", label: "대시보드", icon: "🏠", description: "오늘 한눈에 보기" },
  { href: "/todos", label: "할 일", icon: "✅", description: "오늘/최근 해야 할 일" },
  {
    href: "/assets/budget",
    label: "자산",
    icon: "💰",
    description: "가계부와 통계",
    children: [
      {
        href: "/assets/budget",
        label: "가계부",
        icon: "📒",
        description: "수입·지출 기록과 계좌 관리",
      },
      {
        href: "/assets/stats",
        label: "통계",
        icon: "📊",
        description: "수입·지출 흐름 통계",
      },
    ],
  },
  { href: "/closet", label: "옷장", icon: "👕", description: "가지고 있는 옷 관리" },
  { href: "/devlog", label: "개발노트", icon: "📝", description: "공부한 개발 정보 기록" },
];
