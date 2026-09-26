import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Lifelog",
  description: "내 일상을 한 곳에서 기록하고 관리하는 개인 대시보드",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lifelog",
  },
  icons: {
    icon: "/icon-512.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3E6AE1",
  // viewport-fit=cover가 있어야 env(safe-area-inset-bottom)이 실제 값을 반환한다.
  // 설치된 PWA(홈 화면 앱)에서 하단 탭바가 홈 인디케이터 영역과 겹치지 않게 하는 데 필요하다.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="light"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t="light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
