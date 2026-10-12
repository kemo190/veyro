"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { dbService } from "@/lib/supabase/service";
import { Restaurant, Order } from "@/types";
import {
  Building2,
  Calendar,
  Phone,
  MapPin,
  Power,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export default function AdminRestaurantDetailPage() {
  const params = useParams();
  const restId = params?.id as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    if (!restId) return;
    setIsLoading(true);
    const [item, restOrders] = await Promise.all([
      dbService.getRestaurantById(restId),
      dbService.getOrders({ restaurantId: restId }),
    ]);
    setRestaurant(item);
    setOrders(restOrders);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [restId]);

  const handleToggle = async () => {
    if (!restaurant) return;
    try {
      const newState = await dbService.toggleRestaurantActive(restaurant.id, restaurant.isActive);
      setRestaurant({ ...restaurant, isActive: newState });
      setFeedback(`تم تحديث حالة المطعم في السيرفر إلى (${newState ? "نشط" : "معطل"})`);
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      alert(err.message || "حدث خطأ");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-bold">
        جاري تحميل تفاصيل المطعم من السيرفر...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-heading">المطعم غير موجود</h3>
        <Link href="/admin/restaurants">
          <button className="bg-[#141416] text-white text-xs font-bold px-4 py-2 rounded-xl">
            العودة للمطاعم
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/restaurants"
          className="w-10 h-10 rounded-2xl bg-white border border-[#EFEAE0] shadow-xs flex items-center justify-center text-slate-800 hover:bg-[#F5F0E6] active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </Link>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            restaurant.isActive
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {restaurant.isActive ? "نشط ومفعل" : "معطل وموقوف"}
        </span>

        <div className="w-10 h-10" />
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold">
          {feedback}
        </div>
      )}

      {/* Restaurant Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#EFEAE0] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F7F3E9] pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">{restaurant.nameAr}</h2>
            <p className="text-xs text-slate-400">{restaurant.name} • slug: {restaurant.slug}</p>
          </div>

          <button
            onClick={handleToggle}
            className={`text-xs px-3 py-2 rounded-xl font-bold border transition-colors ${
              restaurant.isActive
                ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            }`}
          >
            {restaurant.isActive ? "تعطيل الحساب مؤقتاً" : "تفعيل الحساب الآن"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px]">الفرع:</span>
            <strong>{restaurant.branch || "الفرع الرئيسي"}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">الهاتف:</span>
            <strong>{restaurant.phone || "غير محدد"}</strong>
          </div>
        </div>
      </div>

      {/* Orders specific to this restaurant */}
      <div className="bg-white rounded-3xl border border-[#EFEAE0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F7F3E9]">
          <h3 className="text-xs font-bold text-slate-900 font-heading">
            طلبات هذا المطعم ({orders.length})
          </h3>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            لم يقم هذا المطعم بتوثيق أي طلبات بعد في قاعدة البيانات.
          </div>
        ) : (
          <div className="divide-y divide-[#F7F3E9]">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F2] transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 font-heading">
                    طلب #{order.orderNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    بواسطة: {order.createdByName}
                  </p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs font-bold bg-[#FAF8F2] border border-[#EFEAE0] px-3 py-1 rounded-xl hover:bg-white"
                >
                  عرض التفاصيل
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
