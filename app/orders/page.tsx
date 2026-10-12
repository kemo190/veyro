"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { dbService } from "@/lib/supabase/service";
import { Order } from "@/types";
import {
  Search,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  Plus,
  RotateCcw,
  FileText,
  ChevronRight,
} from "lucide-react";

export default function RestaurantOrdersPage() {
  const router = useRouter();
  const { currentRestaurant, currentUser, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadOrders = async () => {
    if (!currentRestaurant) return;
    setIsLoading(true);
    const list = await dbService.getOrders({
      restaurantId: currentRestaurant.id,
      searchQuery: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setOrders(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!authLoading && currentRestaurant) {
      loadOrders();
    }
  }, [authLoading, currentRestaurant, searchQuery, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-4 pb-24 text-[#20251F]">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-white border border-[#EAE6DC] shadow-xs flex items-center justify-center text-[#20251F] hover:bg-[#FAF8F5] active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </Link>
        <div className="text-center">
          <span className="text-[11px] font-medium text-[#85867D]">سجل العمليات</span>
          <h2 className="text-base font-bold text-[#20251F] font-heading leading-tight">أرشيف الطلبات</h2>
        </div>
        <Link
          href="/orders/new"
          className="w-10 h-10 rounded-2xl bg-[#555B3D] text-white shadow-xs flex items-center justify-center hover:bg-[#484E33] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.4]" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#EAE6DC] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#85867D] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم الطلب..."
            className="w-full text-xs font-bold rounded-2xl border border-[#EAE6DC] pr-10 pl-3 py-2.5 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D] transition-all placeholder:text-[#85867D] placeholder:font-normal font-heading"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-medium text-[#85867D] block mb-1">من تاريخ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-[#EAE6DC] px-2.5 py-2 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D]"
            />
          </div>
          <div>
            <span className="text-[10px] font-medium text-[#85867D] block mb-1">إلى تاريخ:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-[#EAE6DC] px-2.5 py-2 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D]"
            />
          </div>
        </div>

        {(searchQuery || startDate || endDate) && (
          <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE1] text-[11px]">
            <span className="text-[#85867D] font-medium">فلاتر نشطة</span>
            <button
              onClick={handleResetFilters}
              className="text-[#555B3D] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              إعادة تعيين
            </button>
          </div>
        )}
      </div>

      {/* Orders List Card */}
      <div className="bg-white rounded-3xl border border-[#EAE6DC] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 px-4 text-xs font-medium text-[#85867D]">
            جاري جلب الطلبات من السيرفر...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-xs font-bold text-[#20251F]">لا توجد طلبات مطابقة</p>
            <p className="text-[11px] text-[#85867D]">جرب مسح فلاتر البحث أو إضافة طلب جديد</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0ECE1]">
            {orders.map((order, idx) => {
              const formattedDate = new Date(order.createdAt).toLocaleString("ar-SA", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              const statusLabel = "موثق سحابياً";
              const statusClass = "bg-[#EDF3EA] text-[#48603D]";
              const dotClass = "bg-[#48603D]";

              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer group active:bg-[#F3EFE6]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EDF3EA] border border-[#555B3D]/15 flex items-center justify-center text-[#555B3D] font-bold text-xs shrink-0 group-hover:scale-105 transition-transform font-sans">
                      #{order.orderNumber}
                    </div>

                    <div className="space-y-0.5 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#20251F] font-sans">
                          طلب #{order.orderNumber}
                        </span>
                        {order.notes && (
                          <span className="text-[10px] font-medium text-[#555B3D] bg-[#EDF3EA] px-2 py-0.5 rounded-full truncate max-w-[130px]">
                            {order.notes}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#85867D] font-medium flex items-center gap-2">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4 text-[#85867D] group-hover:text-[#555B3D] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
