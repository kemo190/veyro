"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/supabase/service";
import { Order, Restaurant } from "@/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export default function AdminAllOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const [rests, list] = await Promise.all([
      dbService.getRestaurants(),
      dbService.getOrders({
        restaurantId: selectedRestaurant || undefined,
        searchQuery: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    ]);
    setRestaurants(rests);
    setOrders(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedRestaurant, searchQuery, startDate, endDate]);

  const handleReset = () => {
    setSelectedRestaurant("");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="w-10 h-10 rounded-2xl bg-white border border-[#EFEAE0] shadow-xs flex items-center justify-center text-slate-800 hover:bg-[#F5F0E6] active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400">سجل المنصة</span>
          <h2 className="text-sm font-bold text-slate-900 font-heading">كافة طلبات المطاعم</h2>
        </div>
        <div className="w-10 h-10" />
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-3xl p-4 border border-[#EFEAE0] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Restaurant Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              المطعم:
            </label>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-[#EFEAE0] px-3 py-2 bg-[#FAF8F2] focus:bg-white"
            >
              <option value="">جميع المطاعم ({restaurants.length})</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              رقم الطلب:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="مثال: 1001..."
              className="w-full text-xs font-semibold rounded-xl border border-[#EFEAE0] px-3 py-2 bg-[#FAF8F2] focus:bg-white"
            />
          </div>
        </div>

        {(selectedRestaurant || searchQuery || startDate || endDate) && (
          <div className="flex items-center justify-between pt-1 border-t border-[#F7F3E9] text-[11px]">
            <span className="text-slate-400">فلاتر مطبقة</span>
            <button
              onClick={handleReset}
              className="text-[#141416] hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              مسح الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-[#EFEAE0] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 px-4 text-xs font-bold text-slate-400">
            جاري جلب الطلبات من السيرفر...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-xs font-bold text-slate-700">لا توجد طلبات مطابقة</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F7F3E9]">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleString("ar-SA", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F2] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FEF9D9] border border-[#F7EDB8] flex items-center justify-center text-slate-900 font-bold text-xs shrink-0 font-heading">
                      #{order.orderNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          طلب #{order.orderNumber}
                        </span>
                        <span className="text-[10px] font-bold bg-[#FAF8F2] border border-[#EFEAE0] px-2 py-0.2 rounded-full text-slate-600">
                          {order.restaurantName}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formattedDate} • بواسطة: {order.createdByName}
                      </p>
                    </div>
                  </div>

                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
