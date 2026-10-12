"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/supabase/service";
import { validateRestaurantInput } from "@/lib/validation";
import { ChevronRight, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [nameAr, setNameAr] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateRestaurantInput({ nameAr, name });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const created = await dbService.createRestaurant({
        nameAr: nameAr.trim(),
        name: name.trim(),
        slug: generatedSlug,
        branch: branch.trim(),
        phone: phone.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/restaurants/${created.id}`);
      }, 1000);
    } catch (err: any) {
      setErrors({ form: err.message || "حدث خطأ أثناء إضافة المطعم في قاعدة البيانات" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/restaurants"
          className="w-10 h-10 rounded-2xl bg-white border border-[#EFEAE0] shadow-xs flex items-center justify-center text-slate-800 hover:bg-[#F5F0E6] active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-400">إدارة المنصة</span>
          <h2 className="text-sm font-bold text-slate-900 font-heading">إضافة مطعم جديد</h2>
        </div>
        <div className="w-10 h-10" />
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-3xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">تم تسجيل المطعم في قاعدة البيانات بنجاح!</p>
        </div>
      )}

      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-3xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-bold">{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-[#EFEAE0] shadow-xs space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-800">
              اسم المطعم بالعربية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: شاورما ومشاوي الأصيل"
              className="w-full text-xs font-bold rounded-2xl border border-[#EFEAE0] px-3.5 py-3 bg-[#FAF8F2] focus:bg-white"
            />
            {errors.nameAr && <p className="text-[10px] font-bold text-red-600">{errors.nameAr}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-800">
              اسم المطعم بالإنجليزية <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Al-Aseel Grill"
              className="w-full text-xs font-bold rounded-2xl border border-[#EFEAE0] px-3.5 py-3 bg-[#FAF8F2] focus:bg-white"
            />
            {errors.name && <p className="text-[10px] font-bold text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-800">الفرع أو المدينة</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="مثال: الرياض - الملقا"
              className="w-full text-xs font-semibold rounded-2xl border border-[#EFEAE0] px-3.5 py-3 bg-[#FAF8F2] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-800">رقم الهاتف للتواصل</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: +966500000000"
              className="w-full text-xs font-semibold rounded-2xl border border-[#EFEAE0] px-3.5 py-3 bg-[#FAF8F2] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#141416] hover:bg-black text-white text-xs font-bold py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وإنشاء المطعم في السيرفر</span>
          </button>
        </div>
      </form>
    </div>
  );
}
