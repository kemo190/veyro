"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { dbService } from "@/lib/supabase/service";
import { validateOrderInput } from "@/lib/validation";
import { ImageUploadCapture } from "@/components/ui/ImageUploadCapture";
import {
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
} from "lucide-react";

export default function NewOrderPage() {
  const router = useRouter();
  const { currentRestaurant, currentUser } = useAuth();

  const [orderNumber, setOrderNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [orderTicketImage, setOrderTicketImage] = useState("");
  const [receiptImage, setReceiptImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) {
      setErrors({ form: "يجب تسجيل الدخول بمطعم صالح لحفظ الطلب" });
      return;
    }

    setErrors({});
    setSuccessMessage(null);

    const validation = validateOrderInput({
      orderNumber,
      orderTicketImage,
      receiptImage,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Real database insert in Supabase
      const created = await dbService.createOrder(
        currentRestaurant.id,
        {
          orderNumber,
          orderTicketImage,
          receiptImage,
          notes,
        },
        currentUser?.id
      );

      setSuccessMessage(`تم حفظ وتوثيق الطلب (#${created.orderNumber}) في السيرفر بنجاح!`);

      setTimeout(() => {
        router.push(`/orders/${created.id}`);
      }, 900);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrors({ form: err.message || "حدث خطأ أثناء حفظ الطلب في قاعدة البيانات" });
      setIsSubmitting(false);
    }
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
          <span className="text-[11px] font-medium text-[#85867D]">لوحة العمليات</span>
          <h2 className="text-base font-bold text-[#20251F] font-heading leading-tight">توثيق طلب جديد</h2>
        </div>
        <div className="w-10 h-10" />
      </div>

      {successMessage && (
        <div className="bg-[#EDF3EA] border border-[#555B3D]/30 text-[#48603D] p-4 rounded-3xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#48603D] shrink-0" />
          <div>
            <p className="text-xs font-bold font-heading">{successMessage}</p>
            <p className="text-[11px] text-[#48603D]/80">جاري نقلك لتفاصيل الطلب...</p>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="bg-[#FCEFE3] border border-[#C05C1D]/30 text-[#C05C1D] p-4 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#C05C1D] shrink-0" />
          <p className="text-xs font-bold">{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
            <div className="w-7 h-7 rounded-xl bg-[#EDF3EA] text-[#555B3D] flex items-center justify-center">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-xs font-bold text-[#20251F] font-heading">١. بيانات الطلب الأساسية</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#20251F]">
              رقم الطلب (Order Number) <span className="text-[#C05C1D]">*</span>
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="مثال: 0242 أو #ORD-88"
              className="w-full text-xs font-bold rounded-2xl border border-[#EAE6DC] px-3.5 py-3 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D] transition-all placeholder:text-[#85867D] placeholder:font-normal font-heading"
            />
            {errors.orderNumber && (
              <p className="text-[11px] font-bold text-red-600">{errors.orderNumber}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#20251F]">
              ملاحظات أو تفاصيل الوجبة (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: 2 كباب لحم + رز + مشروب"
              className="w-full text-xs font-medium rounded-2xl border border-[#EAE6DC] px-3.5 py-3 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D] transition-all placeholder:text-[#85867D]"
            />
          </div>
        </div>

        {/* Photos Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE6DC] shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[#F0ECE1] pb-3">
            <div className="w-7 h-7 rounded-xl bg-[#EDF3EA] text-[#555B3D] flex items-center justify-center">
              <Receipt className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="text-xs font-bold text-[#20251F] font-heading">٢. صور التوثيق الإلزامية</h3>
          </div>

          {/* Ticket Image */}
          <ImageUploadCapture
            label="صورة تذكرة المطبخ (Kitchen Ticket)"
            required
            helperText="التقط صورة واضحة لتذكرة التحضير أو اخترها من الهاتف"
            value={orderTicketImage}
            onChange={setOrderTicketImage}
            error={errors.orderTicketImage}
          />

          <div className="border-t border-[#F0ECE1] pt-4">
            <ImageUploadCapture
              label="صورة فاتورة الدفع (Receipt)"
              required
              helperText="التقط صورة الإيصال الضريبي الصادر من الكاشير"
              value={receiptImage}
              onChange={setReceiptImage}
              error={errors.receiptImage}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#555B3D] hover:bg-[#484E33] text-white text-sm font-bold py-3.5 px-6 rounded-2xl shadow-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 font-heading"
        >
          {isSubmitting ? (
            <span>جاري حفظ وتوثيق الطلب...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ وتوثيق الطلب الآن</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
