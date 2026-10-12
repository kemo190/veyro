"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbService } from "@/lib/supabase/service";
import { Restaurant } from "@/types";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  PlusCircle,
  Search,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react";

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const list = await dbService.getRestaurants();
    setRestaurants(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (e: React.MouseEvent, id: string, currentState: boolean) => {
    e.stopPropagation();
    try {
      await dbService.toggleRestaurantActive(id, currentState);
      loadData();
      setFeedback("تم تغيير حالة المطعم في قاعدة البيانات بنجاح");
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      alert(err.message || "فشل تغيير الحالة");
    }
  };

  const filtered = restaurants.filter((r) =>
    r.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span className="text-[10px] font-bold text-slate-400">إدارة المنصة</span>
          <h2 className="text-sm font-bold text-slate-900 font-heading">المطاعم المشتركة</h2>
        </div>
        <Link
          href="/admin/restaurants/new"
          className="w-10 h-10 rounded-2xl bg-[#141416] text-white shadow-xs flex items-center justify-center hover:bg-black active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
        </Link>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold animate-in fade-in">
          {feedback}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-3 border border-[#EFEAE0] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مطعم..."
            className="w-full text-xs font-semibold rounded-2xl border border-[#EFEAE0] pr-10 pl-3 py-2 bg-[#FAF8F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Restaurants List */}
      <div className="bg-white rounded-3xl border border-[#EFEAE0] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 px-4 text-xs font-bold text-slate-400">
            جاري جلب المطاعم من قاعدة البيانات...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <p className="text-xs font-bold text-slate-700">لا توجد مطاعم مسجلة</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F7F3E9]">
            {filtered.map((rest) => (
              <div
                key={rest.id}
                onClick={() => router.push(`/admin/restaurants/${rest.id}`)}
                className="p-4 flex items-center justify-between hover:bg-[#FAF8F2] transition-colors cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading">{rest.nameAr}</h4>
                  <p className="text-[10px] text-slate-400">{rest.branch || "الفرع الرئيسي"} • {rest.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(e, rest.id, rest.isActive)}
                    className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border transition-colors ${
                      rest.isActive
                        ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                        : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                  >
                    {rest.isActive ? "تعطيل" : "تفعيل"}
                  </button>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
