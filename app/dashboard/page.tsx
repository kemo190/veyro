"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { dbService } from "@/lib/supabase/service";
import { Order } from "@/types";
import {
  Camera,
  ChevronLeft,
  ClipboardList,
  BarChart2,
  Clock,
} from "lucide-react";

export default function RestaurantDashboard() {
  const router = useRouter();
  const { currentUser, currentRestaurant, isLoading: authLoading, isMounted } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      if (currentUser.role === "admin") {
        router.push("/admin");
        return;
      }
      if (currentRestaurant) {
        setIsLoadingOrders(true);
        dbService.getOrders({ restaurantId: currentRestaurant.id }).then((data) => {
          setOrders(data);
          setIsLoadingOrders(false);
        });
      }
    }
  }, [authLoading, currentUser, currentRestaurant, router]);

  if (authLoading || !isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-[#555B3D] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#85867D] font-medium">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  if (!currentRestaurant) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE6DC] p-8 text-center space-y-3 max-w-sm mx-auto mt-6 shadow-xs">
        <h3 className="text-base font-bold text-[#20251F] font-heading">حساب بدون مطعم</h3>
        <p className="text-xs text-[#85867D]">
          لم يتم ربط حسابك بأي فرع حتى الآن. يرجى مراجعة إدارة المنصة لربط حسابك.
        </p>
      </div>
    );
  }

  // Real KPI numbers calculated directly from Supabase live records
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === todayDateStr);
  const todayOrdersCount = todayOrders.length;
  const totalOrdersCount = orders.length;

  const rawName = currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Staff");
  const staffName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-3 text-[#20251F] pb-24 bg-[#F6F3EB]">
      {/* 1. Welcome Section with Olive Indicator Bar */}
      <div className="shrink-0 pt-0 text-right">
        <h2 className="text-2xl font-bold text-[#20251F] font-heading leading-tight">
          أهلاً بك، {staffName}
        </h2>
        <p className="text-xs text-[#85867D] font-medium mt-1">
          لوحة العمليات اليومية
        </p>
        <div className="w-12 h-[3.5px] bg-[#555B3D] rounded-full mt-2.5 mr-0" />
      </div>

      {/* 2. Daily Statistics Card with Vertical Divider */}
      <div className="bg-white rounded-3xl border border-[#EDE8DE] p-5 shadow-xs shrink-0">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center">
          {/* Column 1 (in RTL: Right Column): Today Orders */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#20251F]">
              <ClipboardList className="w-4 h-4 stroke-[1.8] text-[#555B3D]" />
              <span>طلبات اليوم</span>
            </div>
            <p className="text-4xl font-bold text-[#20251F] font-sans tracking-tight leading-none mt-1">
              {todayOrdersCount}
            </p>
          </div>

          {/* Center Divider Line */}
          <div className="w-[1px] h-11 bg-[#EAE5D9]" />

          {/* Column 2 (in RTL: Left Column): Total Archive */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-medium text-[#20251F]">
              <svg
                className="w-4 h-4 text-[#555B3D]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="4" />
                <line x1="9" y1="8" x2="9" y2="16" />
                <line x1="15" y1="8" x2="15" y2="16" />
              </svg>
              <span>إجمالي السجل</span>
            </div>
            <p className="text-4xl font-bold text-[#20251F] font-sans tracking-tight leading-none mt-1">
              {totalOrdersCount}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Action: Olive Green Hero Card with Camera Squircle on Right and Left Chevron */}
      <Link href="/orders/new" className="block group shrink-0">
        <div className="relative overflow-hidden bg-[#4A5338] hover:bg-[#434B32] active:scale-[0.99] text-white rounded-2xl p-4 shadow-xs transition-all flex items-center justify-between">
          {/* Subtle Topographic Contour Background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15]"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M-10,25 C60,5 130,50 210,30 C290,10 350,55 410,35"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
            <path
              d="M-10,48 C70,28 145,70 225,50 C305,30 365,75 410,55"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
            <path
              d="M-10,70 C80,50 160,92 240,72 C320,52 380,95 410,75"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
            <path
              d="M-10,92 C90,72 175,114 255,94 C335,74 395,118 410,98"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
          </svg>

          {/* In RTL: Right Side Group (Camera Squircle + Divider + Text) */}
          <div className="flex items-center relative z-10">
            {/* Camera Squircle on Far Right */}
            <div className="w-13 h-13 rounded-2xl border border-white/25 bg-white/12 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-xs">
              <Camera className="w-5.5 h-5.5 stroke-[1.8]" />
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-8 bg-white/20 mx-3.5 shrink-0" />

            {/* Text details in Middle */}
            <div className="text-right space-y-0.5">
              <h3 className="text-base font-bold text-white font-heading leading-tight tracking-wide">
                توثيق طلب جديد
              </h3>
              <p className="text-xs text-[#E0DDD5] font-medium">
                تصوير التذكرة وحفظ الطلب
              </p>
            </div>
          </div>

          {/* In RTL: Left Side Chevron */}
          <div className="relative z-10 pl-1">
            <ChevronLeft className="w-5 h-5 text-white/90 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
          </div>
        </div>
      </Link>

      {/* 4. Recent Orders Section */}
      <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
        {/* Header */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <h3 className="text-base font-bold text-[#20251F] font-heading">أحدث الطلبات</h3>
          <Link
            href="/orders"
            className="text-xs font-semibold text-[#85867D] hover:text-[#555B3D] transition-colors flex items-center gap-0.5"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders Card Container */}
        <div className="bg-white rounded-2xl border border-[#EAE6DC] shadow-xs overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#F0ECE1]">
            {isLoadingOrders ? (
              <div className="text-center py-10 px-4 space-y-2">
                <div className="w-6 h-6 border-2 border-[#555B3D] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#85867D] font-medium">جاري تحميل أحدث الطلبات من السيرفر...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10 px-5 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0ECE1] flex items-center justify-center mx-auto text-[#555B3D]">
                  <ClipboardList className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#20251F]">لا توجد طلبات مسجلة حتى الآن</p>
                  <p className="text-xs text-[#85867D] max-w-xs mx-auto leading-relaxed">
                    السجل السحابي جاهز بالكامل. يمكنك توثيق أول طلب الآن بالتقاط صورة التذكرة والإيصال.
                  </p>
                </div>
                <Link
                  href="/orders/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#555B3D] text-white text-xs font-bold rounded-xl hover:bg-[#434B32] transition-colors mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>توثيق أول طلب</span>
                </Link>
              </div>
            ) : (
              orders.slice(0, 10).map((order) => {
                const formattedTime = new Date(order.createdAt).toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const orderNum = order.orderNumber.startsWith("#") ? order.orderNumber : `#${order.orderNumber}`;

                return (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer group active:bg-[#F3EFE6]"
                  >
                    {/* Left: Chevron + Time + Status */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <ChevronLeft className="w-4 h-4 text-[#85867D] group-hover:text-[#555B3D] transition-colors" />
                      
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[11px] text-[#85867D] font-medium dir-ltr font-sans">
                          <span>{formattedTime}</span>
                          <Clock className="w-3 h-3 text-[#85867D]" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-[#EDF3EA] text-[#48603D]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#48603D]" />
                          <span>موثق سحابياً</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Real Order details */}
                    <div className="space-y-0.5 text-right">
                      <p className="text-sm font-bold text-[#20251F] font-sans">
                        {orderNum}
                      </p>
                      <p className="text-xs text-[#555B3D] font-medium truncate max-w-[170px] sm:max-w-[200px]">
                        {order.notes || "تذكرة وإيصال مسجلين"}
                      </p>
                      <p className="text-[11px] text-[#85867D] font-medium">
                        بواسطة: {order.createdByName || "الموظف"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
