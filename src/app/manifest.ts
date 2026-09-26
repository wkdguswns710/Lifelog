import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lifelog",
    short_name: "Lifelog",
    description: "내 일상을 한 곳에서 기록하고 관리하는 개인 대시보드",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#3E6AE1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
