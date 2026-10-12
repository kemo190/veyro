"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { dbService } from "@/lib/supabase/service";
import { Order } from "@/types";
import {
  ChevronRight,
  Calendar,
  User,
  Building2,
  FileText,
  Receipt,
  Maximize2,
  AlertTriangle,
} from "lucide-react";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { currentUser, currentRestaurant } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    dbService.getOrderById(orderId).then((item) => {
      if (item) {
        if (currentUser?.role !== "admin" && currentRestaurant && item.restaurantId !== currentRestaurant.id) {
          setOrder(null);
        } else {
          setOrder(item);
        }
      }
      setIsLoading(false);
    });
  }, [orderId, currentUser, currentRestaurant]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-bold">
        جاري جلب تفاصيل الطلب من السيرفر...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-heading">الطلب غير موجود أو غير مصرح بعرضه</h3>
        <p className="text-xs text-slate-500">
          تأكد من رقم الطلب أو أن حسابك ينتمي لنفس المطعم.
        </p>
        <Link href="/orders">
          <button className="bg-[#141416] text-white text-xs font-bold px-4 py-2 rounded-xl">
            العودة لسجل الطلبات
          </button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4 pb-24 text-[#20251F]">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href={currentUser?.role === "admin" ? "/admin/orders" : "/orders"}
          className="w-10 h-10 rounded-2xl bg-white border border-[#EAE6DC] shadow-xs flex items-center justify-center text-[#20251F] hover:bg-[#FAF8F5] active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </Link>

        <span className="text-xs font-bold text-[#48603D] bg-[#EDF3EA] border border-[#555B3D]/20 px-3.5 py-1 rounded-full shadow-xs">
          طلب موثق ومؤرشف ✓
        </span>

        <div className="w-10 h-10" />
      </div>

      {/* Main Order Identity Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EAE6DC] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
          <div>
            <span className="text-[10px] font-medium text-[#85867D] block">رقم الطلب</span>
            <h2 className="text-2xl font-bold text-[#20251F] font-sans">
              #{order.orderNumber}
            </h2>
          </div>

          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-medium text-[#85867D] block">المطعم</span>
            <span className="text-xs font-bold text-[#555B3D] bg-[#EDF3EA] px-2.5 py-1 rounded-xl border border-[#555B3D]/15 inline-block font-heading">
              {order.restaurantName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#20251F] pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#85867D]" />
            <span>التاريخ: <strong className="font-sans">{formattedDate}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#85867D]" />
            <span>الموظف: <strong>{order.createdByName || "غير محدد"}</strong></span>
          </div>
        </div>

        {order.notes && (
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE6DC] text-xs">
            <span className="font-bold text-[#555B3D] block mb-0.5 font-heading">تفاصيل وملاحظات الطلب:</span>
            <p className="text-[#20251F] font-medium">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        {/* Ticket Card */}
        <div className="bg-white rounded-3xl p-4.5 border border-[#EAE6DC] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#EDF3EA] text-[#555B3D] flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#20251F] font-heading">تذكرة الطلب (Kitchen Ticket)</h3>
            </div>
            <button
              onClick={() => setActivePreviewImage(order.orderTicketImage)}
              className="text-[11px] text-[#555B3D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              تكبير
            </button>
          </div>

          <div
            onClick={() => setActivePreviewImage(order.orderTicketImage)}
            className="cursor-pointer relative h-64 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EAE6DC] flex items-center justify-center group"
          >
            <img
              src={order.orderTicketImage}
              alt="تذكرة الطلب"
              className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform"
            />
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-3xl p-4.5 border border-[#EAE6DC] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#EDF3EA] text-[#555B3D] flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#20251F] font-heading">فاتورة الدفع (Receipt)</h3>
            </div>
            <button
              onClick={() => setActivePreviewImage(order.receiptImage)}
              className="text-[11px] text-[#555B3D] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              تكبير
            </button>
          </div>

          <div
            onClick={() => setActivePreviewImage(order.receiptImage)}
            className="cursor-pointer relative h-64 rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EAE6DC] flex items-center justify-center group"
          >
            <img
              src={order.receiptImage}
              alt="فاتورة الطلب"
              className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform"
            />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {activePreviewImage && (
        <div
          onClick={() => setActivePreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <button
              onClick={() => setActivePreviewImage(null)}
              className="mb-3 text-white font-bold text-xs bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl self-end cursor-pointer"
            >
              إغلاق [✕]
            </button>
            <img
              src={activePreviewImage}
              alt="معاينة مكبرة"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
