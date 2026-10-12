"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import {
  LogOut,
  MapPin,
} from "lucide-react";

export function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, currentRestaurant, isMounted, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide top header entirely on login page
  if (pathname === "/login") {
    return null;
  }

  const isAdmin = currentUser?.role === "admin";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push("/login");
  };

  const initialLetter = currentUser?.displayName
    ? currentUser.displayName.slice(0, 1).toUpperCase()
    : currentUser?.email
    ? currentUser.email.slice(0, 1).toUpperCase()
    : "S";

  return (
    <header className="relative w-full z-50 transition-all bg-[#141A12]">
      {/* 1. Background Layer (extended upward to guarantee photo covers notch/status-bar, overflow-hidden contained here only) */}
      <div className="absolute -top-24 inset-x-0 bottom-0 overflow-hidden pointer-events-none">
        {/* Veyro Platform Brand Background */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('/images/veyro-brand-hero.jpg?v=1')` }}
        />
        {/* Dark Cinematic Gradient Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/85" />

        {/* Organic Curved Wave Transition to Ivory Page with 2px overlap to eliminate any line */}
        <div className="absolute -bottom-[2px] inset-x-0 w-full overflow-hidden leading-none z-10">
          <svg
            viewBox="0 0 375 54"
            fill="none"
            preserveAspectRatio="none"
            className="w-full h-11 text-[#F6F3EB] fill-current block"
          >
            <path d="M0,28 C80,28 130,8 210,8 C275,8 315,22 355,22 C365,22 370,18 375,16 L375,56 L0,56 Z" />
          </svg>
        </div>
      </div>

      {/* 2. Interactive Foreground Layer (NO overflow-hidden so profile dropdown menu floats freely above main content) */}
      <div className="relative z-30 pt-[calc(env(safe-area-inset-top,0px)+2.75rem)] pb-8 px-5">
        <div className="max-w-md mx-auto relative flex items-center justify-between">
          {/* 1. In RTL: First child is placed on the RIGHT (Frosted Staff Avatar with Online Dot) */}
          {currentUser ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="الملف الشخصي"
                className="relative w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white font-bold text-lg shadow-sm hover:bg-black/40 active:scale-95 transition-all cursor-pointer font-sans"
              >
                {initialLetter}
                {/* Green Status Indicator Dot at bottom corner */}
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#8FA882] border-2 border-[#1E2718] shadow-xs" />
              </button>

              {/* Clean Dropdown Menu - High Z-Index & No Parent Clipping */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setIsMenuOpen(false)}
                  />

                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl border border-[#EAE6DC] p-2.5 shadow-2xl shadow-black/25 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-[#F0ECE1] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDF3EA] text-[#555B3D]">
                          {isAdmin ? "مدير" : "كاشير"}
                        </span>
                        <p className="text-xs font-bold text-[#20251F]">
                          {currentUser.displayName || "المستخدم"}
                        </p>
                      </div>
                      <p className="text-[11px] text-[#85867D] truncate mt-1 dir-ltr text-right">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full mt-1.5 flex items-center justify-end gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-right"
                    >
                      <span>{isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
                      <LogOut className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-white hover:underline px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-sm"
            >
              تسجيل الدخول
            </Link>
          )}

          {/* 2. In RTL: Second child is placed on the LEFT (Restaurant Brand Info & Location) */}
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight font-heading tracking-wide">
              {isMounted && isAdmin
                ? "لوحة الإدارة المركزية"
                : isMounted && currentRestaurant
                ? currentRestaurant.nameAr
                : "منصة Veyro"}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/85 mt-1 font-medium">
              <span>
                {isMounted && isAdmin
                  ? "مدير المنصة"
                  : currentRestaurant?.branch || "نظام التوثيق السحابي"}
              </span>
              <MapPin className="w-3.5 h-3.5 stroke-[2.2] text-white/80 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
