"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running as standalone app
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if device is iOS (Safari doesn't support beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If dismissed recently, don't nag
    const dismissed = sessionStorage.getItem("pwa_dismissed");
    if (!dismissed) {
      // On iOS Safari, show the install helper banner
      if (isIosDevice) {
        setShowBanner(true);
      }
    }

    // 3. Android / Chromium install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!sessionStorage.getItem("pwa_dismissed")) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      alert("لتثبيت التطبيق على جهازك: اضغط على خيارات المتصفح (⋮) ثم اختر 'إضافة إلى الشاشة الرئيسية'.");
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Modern Install Banner */}
      <div className="bg-[#1D241A] text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-white/10 shadow-lg relative z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#555B3D] flex items-center justify-center shrink-0 shadow-xs border border-white/15">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight font-heading">
              تثبيت تطبيق Veyro على الشاشة الرئيسية
            </p>
            <p className="text-[11px] text-[#A6AEA0] leading-tight">
              تشغيل سريع بكامل الشاشة ومزامنة سحابية مباشرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-[#555B3D] hover:bg-[#484E33] active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
          <button
            onClick={handleDismiss}
            title="إغلاق"
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-sm rounded-3xl p-5 border border-[#EAE6DC] shadow-2xl space-y-4 text-right animate-in fade-in slide-in-from-bottom">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#EDF3EA] text-[#555B3D] flex items-center justify-center">
                <Share className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-[#20251F] text-sm font-heading">طريقة التثبيت على الآيفون (Safari)</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-[#85867D] hover:text-[#20251F]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-[#20251F]">
              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border border-[#EDE8DE]">
                <span className="font-bold text-[#555B3D] font-sans">1.</span>
                <span>اضغط على زر المشاركة <strong>(Share)</strong> في أسفل متصفح Safari.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border border-[#EDE8DE]">
                <span className="font-bold text-[#555B3D] font-sans">2.</span>
                <span>مرر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Add to Home Screen).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-2xl border border-[#EDE8DE]">
                <span className="font-bold text-[#555B3D] font-sans">3.</span>
                <span>اضغط على <strong>«إضافة»</strong> (Add) في الزاوية العلوية.</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#555B3D] text-white font-bold rounded-2xl text-xs text-center cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </>
  );
}

