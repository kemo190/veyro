"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { dbService } from "@/lib/supabase/service";
import { Restaurant, Order } from "@/types";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  FileText,
  Clock,
  TrendingUp,
  PlusCircle,
  ChevronLeft,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setIsLoading(true);
      Promise.all([
        dbService.getRestaurants(),
        dbService.getOrders(),
      ]).then(([rests, allOrders]) => {
        setRestaurants(rests);
        setRecentOrders(allOrders.slice(0, 5));
        setIsLoading(false);
      });
    }
  }, [authLoading, currentUser, router]);

  if (authLoading || isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-bold">
        جاري تحميل بيانات لوحة الإدارة...
      </div>
    );
  }

  const activeRestaurantsCount = restaurants.filter((r) => r.isActive).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrdersCount = recentOrders.filter((o) => o.createdAt.slice(0, 10) === todayStr).length;

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">
            لوحة الإدارة المركزية
          </h2>
          <p className="text-xs text-slate-500">إشراف شامل على جميع المطاعم والعمليات</p>
        </div>

        <Link href="/admin/restaurants/new">
          <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
            إضافة مطعم
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#FFEFE8] rounded-3xl p-4 border border-[#FCDFD2] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C4331]">المطاعم النشطة</span>
          <p className="text-2xl font-bold text-[#4F1E12] font-heading mt-1">
            {activeRestaurantsCount} / {restaurants.length}
          </p>
        </div>

        <div className="bg-[#FEF9D9] rounded-3xl p-4 border border-[#F7EDB8] shadow-xs">
          <span className="text-[11px] font-bold text-[#735E10]">كافة الطلبات</span>
          <p className="text-2xl font-bold text-[#423606] font-heading mt-1">
            {recentOrders.length}
          </p>
        </div>
      </div>

      {/* Restaurants List Overview */}
      <div className="bg-white rounded-3xl border border-[#EFEAE0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F7F3E9] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 font-heading">المطاعم المشتركة</h3>
          <Link href="/admin/restaurants" className="text-xs font-bold text-slate-500 hover:text-slate-900">
            إدارة الكل ←
          </Link>
        </div>

        <div className="divide-y divide-[#F7F3E9]">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              onClick={() => router.push(`/admin/restaurants/${rest.id}`)}
              className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F2] transition-colors cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{rest.nameAr}</p>
                <p className="text-[10px] text-slate-400">{rest.branch || "الفرع الرئيسي"}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rest.isActive
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {rest.isActive ? "نشط" : "معطل"}
                </span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
