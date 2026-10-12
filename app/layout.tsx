import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/context/auth-context";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PwaInstallPrompt } from "@/components/layout/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "Veyro | نظام توثيق طلبات وفواتير المطاعم",
  description: "Veyro - تطبيق ويب تقدمي احترافي لتوثيق تذاكر وإيصالات طلبات المطاعم ومزامنتها سحابياً",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.svg",
    apple: "/icons/icon-192x192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#141A12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="bg-[#141A12] text-[#20251F]">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#141A12" />
        <meta name="color-scheme" content="light" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#141A12] text-[#20251F] antialiased selection:bg-[#555B3D] selection:text-white relative flex flex-col pb-[env(safe-area-inset-bottom)]">
        <div className="relative z-10 flex flex-col h-full w-full overflow-hidden bg-[#141A12]">
          <AuthProvider>
            <Suspense fallback={null}>
              <PwaInstallPrompt />
              <HeaderNav />
            </Suspense>
            <main className="flex-1 w-full max-w-md mx-auto px-4 py-1.5 overflow-hidden flex flex-col min-h-0 bg-[#F6F3EB]">
              <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">جاري التحميل...</div>}>
                {children}
              </Suspense>
            </main>
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
