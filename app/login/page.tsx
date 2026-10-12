"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { supabase } from "@/lib/supabase/client";
import { dbService } from "@/lib/supabase/service";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Wifi,
  CloudCheck,
  Zap,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message || "فشل تسجيل الدخول");
      }

      await refreshAuth();
      const profile = await dbService.getCurrentProfile();

      setIsLoading(false);

      const targetUrl = profile?.role === "admin" ? "/admin" : "/dashboard";
      router.replace(targetUrl);
    } catch (err: any) {
      setIsLoading(false);
      setError(
        err.message.includes("Invalid login")
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : err.message || "حدث خطأ أثناء الاتصال بسيرفر الدخول"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#141A12] flex flex-col justify-between overflow-y-auto selection:bg-[#555B3D] selection:text-white">
      {/* 1. Background Cinematic Veyro Platform Atmosphere */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src="/images/veyro-brand-hero.jpg?v=1"
          alt="Veyro Platform Atmosphere"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141A12]/90 via-[#141A12]/75 to-[#141A12]/95" />
      </div>

      {/* 2. Main Container */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md mx-auto px-5 py-6 sm:py-8 flex flex-col justify-between min-h-screen">
        {/* Top Header Row */}
        <div className="space-y-6 pt-2 sm:pt-4">
          <div className="flex items-center justify-between">
            {/* Logo: Brand Veyro */}
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center p-2 shadow-sm">
                <UtensilsCrossed className="w-5 h-5 text-white stroke-[2]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-white font-bold text-lg tracking-wide font-heading">
                  Veyro
                </span>
                <p className="text-[11px] text-white/70 font-medium">نظام توثيق عمليات المطاعم</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/90 text-[11px] font-medium backdrop-blur-md shadow-xs">
              <Wifi className="w-3.5 h-3.5 text-[#8FA882]" />
              <span>جاهز للعمل سحابياً</span>
            </div>
          </div>

          {/* Large Hero Arabic Headings */}
          <div className="text-right space-y-1 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-tight tracking-wide">
              منصة Veyro
            </h1>
            <p className="text-xs sm:text-sm text-white/75 font-medium leading-relaxed">
              بوابة توثيق التذاكر والفواتير لعمليات المطاعم
            </p>
          </div>
        </div>

        {/* 3. The Warm Minimalist Ivory Login Card */}
        <div className="my-auto py-4">
          <div className="bg-[#F6F3EB] rounded-3xl border border-[#EAE6DC] p-6 shadow-xl text-[#20251F] space-y-4">
            <div className="border-b border-[#EAE6DC] pb-3 text-right">
              <h2 className="text-base font-bold text-[#20251F] font-heading">تسجيل دخول طاقم العمل</h2>
              <p className="text-xs text-[#85867D] mt-0.5">أدخل البريد الإلكتروني وكلمة المرور الخاصة بحسابك</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-[#20251F] font-heading block">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@restaurant.com"
                    className="w-full text-xs font-bold rounded-2xl border border-[#EAE6DC] px-4 py-3 bg-[#FAF8F5] text-[#20251F] placeholder:text-[#85867D] placeholder:font-normal focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D] transition-all font-sans"
                  />
                  <Mail className="w-4 h-4 text-[#85867D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-[#20251F] font-heading block">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-bold rounded-2xl border border-[#EAE6DC] pr-4 pl-10 py-3 bg-[#FAF8F5] text-[#20251F] placeholder:text-[#85867D] focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-[#555B3D] transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85867D] hover:text-[#20251F] transition-colors cursor-pointer p-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FCEFE3] border border-[#C05C1D]/30 rounded-2xl text-xs font-bold text-[#C05C1D] animate-in fade-in text-center">
                  {error}
                </div>
              )}

              {/* Deep Olive Green Primary Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#555B3D] hover:bg-[#484E33] active:scale-[0.99] text-white text-sm font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 font-heading shadow-xs mt-1"
              >
                {isLoading ? (
                  <span>جاري التحقق والدخول...</span>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 4. Bottom Features */}
        <div className="space-y-3 pb-2 text-center">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
                <Wifi className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[10px] font-medium text-white/80">مزامنة سحابية</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
                <Zap className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[10px] font-medium text-white/80">التقاط فوري</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90">
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[10px] font-medium text-white/80">أمان وحماية</span>
            </div>
          </div>

          <p className="text-[10px] text-white/60 font-medium">
            منظومة Veyro السحابية لإدارة وتوثيق عمليات وتذاكر المطاعم
          </p>
        </div>
      </div>
    </div>
  );
}
