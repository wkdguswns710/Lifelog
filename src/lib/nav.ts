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
    href: "/career/dev",
    label: "업무",
    icon: "💻",
    description: "일과 관련한 기록",
    children: [
      { href: "/career/dev", label: "개발", icon: "💻", description: "공부한 개발 정보 기록" },
    ],
  },
  {
    href: "/health/exercise",
    label: "건강",
    icon: "🏃",
    description: "운동/마음/피부/치아 건강 기록",
    children: [
      { href: "/health/exercise", label: "운동", icon: "🏃", description: "운동 기록 관리" },
      { href: "/health/mind", label: "마음", icon: "🧘", description: "마음 관리 기록" },
      { href: "/health/skin", label: "피부", icon: "🧴", description: "피부 관리 기록" },
      { href: "/health/teeth", label: "치아", icon: "🦷", description: "치아 관리 기록" },
    ],
  },
  {
    href: "/life/housing",
    label: "생활",
    icon: "🏡",
    description: "일상 생활 기록",
    children: [
      { href: "/life/housing", label: "주거", icon: "🏠", description: "주거 관련 기록" },
      { href: "/life/cooking", label: "요리", icon: "🍳", description: "요리 관련 기록" },
      { href: "/life/fashion", label: "패션", icon: "👗", description: "가지고 있는 옷 관리" },
    ],
  },
  {
    href: "/hobby/game",
    label: "취미",
    icon: "🎮",
    description: "게임 등 취미 기록",
    children: [
      { href: "/hobby/game", label: "게임", icon: "🎮", description: "플레이한 게임 기록" },
      { href: "/hobby/anime", label: "애니", icon: "🎬", description: "본 애니메이션 기록" },
    ],
  },
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
];
