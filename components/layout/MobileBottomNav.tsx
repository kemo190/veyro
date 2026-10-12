"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import {
  Home,
  Plus,
  FileText,
  Building2,
  ListOrdered,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Hide bottom navigation completely on login screen or if unauthenticated
  if (pathname === "/login" || !currentUser) {
    return null;
  }

  const isAdmin = currentUser?.role === "admin";

  if (isAdmin) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 px-4 pointer-events-none">
        <nav className="pointer-events-auto max-w-[330px] mx-auto bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-black/8 rounded-full px-3 py-2">
          <div className="grid grid-cols-3 items-center text-center">
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center transition-all ${
                pathname === "/admin"
                  ? "text-[#555B3D] font-bold"
                  : "text-[#85867D] hover:text-[#555B3D]"
              }`}
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">الإدارة</span>
              {pathname === "/admin" && (
                <div className="w-8 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
              )}
            </Link>

            <Link
              href="/admin/restaurants"
              className={`flex flex-col items-center justify-center transition-all ${
                pathname.startsWith("/admin/restaurants")
                  ? "text-[#555B3D] font-bold"
                  : "text-[#85867D] hover:text-[#555B3D]"
              }`}
            >
              <Building2 className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">المطاعم</span>
              {pathname.startsWith("/admin/restaurants") && (
                <div className="w-8 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
              )}
            </Link>

            <Link
              href="/admin/orders"
              className={`flex flex-col items-center justify-center transition-all ${
                pathname.startsWith("/admin/orders")
                  ? "text-[#555B3D] font-bold"
                  : "text-[#85867D] hover:text-[#555B3D]"
              }`}
            >
              <ListOrdered className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] mt-0.5">الطلبات</span>
              {pathname.startsWith("/admin/orders") && (
                <div className="w-8 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
              )}
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  // Restaurant Staff Bottom Nav: Floating Translucent Glass Capsule
  return (
    <div className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 px-4 pointer-events-none">
      <nav className="pointer-events-auto max-w-[330px] mx-auto bg-white/80 backdrop-blur-xl border border-white/70 shadow-xl shadow-black/8 rounded-full px-3 py-2">
        <div className="grid grid-cols-3 items-center text-center">
          {/* 1. Home / Dashboard */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center transition-all ${
              pathname === "/dashboard"
                ? "text-[#555B3D] font-bold"
                : "text-[#85867D] hover:text-[#555B3D]"
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] mt-0.5">الرئيسية</span>
            {pathname === "/dashboard" && (
              <div className="w-6 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
            )}
          </Link>

          {/* 2. Add Order Center Action */}
          <Link
            href="/orders/new"
            className={`flex flex-col items-center justify-center transition-all ${
              pathname === "/orders/new"
                ? "text-[#555B3D] font-bold"
                : "text-[#85867D] hover:text-[#555B3D]"
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.4]" />
            <span className="text-[11px] mt-0.5">طلب جديد</span>
            {pathname === "/orders/new" && (
              <div className="w-8 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
            )}
          </Link>

          {/* 3. Orders History */}
          <Link
            href="/orders"
            className={`flex flex-col items-center justify-center transition-all ${
              pathname.startsWith("/orders") && pathname !== "/orders/new"
                ? "text-[#555B3D] font-bold"
                : "text-[#85867D] hover:text-[#555B3D]"
            }`}
          >
            <FileText className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] mt-0.5">الطلبات</span>
            {pathname.startsWith("/orders") && pathname !== "/orders/new" && (
              <div className="w-8 h-[2.5px] bg-[#555B3D] rounded-full mx-auto mt-0.5" />
            )}
          </Link>
        </div>
      </nav>
    </div>
  );
}
