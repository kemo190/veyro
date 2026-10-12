"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, RefreshCw, X, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/utils/image-compression";

interface ImageUploadCaptureProps {
  label: string;
  required?: boolean;
  helperText?: string;
  value: string;
  onChange: (base64OrUrl: string) => void;
  error?: string;
  id?: string;
}

export function ImageUploadCapture({
  label,
  required = false,
  helperText,
  value,
  onChange,
  error,
  id,
}: ImageUploadCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalKb: number;
    compressedKb: number;
    ratio: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      setFileError("الملف المختار ليس صورة صالحة. يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.");
      return;
    }

    try {
      setIsCompressing(true);

      // Compress client-side automatically preserving high thermal text sharpness
      const result = await compressImage(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.82,
        mimeType: "image/jpeg",
      });

      setCompressionStats({
        originalKb: result.originalSizeKb,
        compressedKb: result.compressedSizeKb,
        ratio: result.compressionRatio,
      });

      onChange(result.dataUrl);
    } catch (err: any) {
      console.error("Compression error:", err);
      // Fallback to basic file reader if canvas compression encounters an issue
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setCompressionStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerInput = () => {
    if (isCompressing) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#20251F] select-none flex items-center gap-1 font-heading">
          {label}
          {required && <span className="text-[#C05C1D] font-bold">*</span>}
        </label>
        {value && !isCompressing && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-[#C05C1D] hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            إزالة الصورة
          </button>
        )}
      </div>

      {helperText && <p className="text-xs text-[#85867D]">{helperText}</p>}

      {/* Hidden input supporting mobile camera capture or photo library */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {isCompressing ? (
        <div className="rounded-3xl border border-[#555B3D]/30 bg-[#EDF3EA]/50 p-8 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#555B3D]/20 flex items-center justify-center text-[#555B3D] shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin stroke-[2]" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#20251F] font-heading flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#555B3D]" />
              <span>جاري ضغط وتحسين الصورة تلقائياً...</span>
            </p>
            <p className="text-[11px] text-[#85867D]">
              تقليص الحجم مع الحفاظ على وضوح أرقام التذكرة لضمان سرعة الرفع الفورية
            </p>
          </div>
        </div>
      ) : value ? (
        <div className="relative group rounded-3xl overflow-hidden border border-[#EAE6DC] bg-[#FAF8F2] shadow-xs transition-all">
          <div className="relative h-64 w-full bg-black/5 flex items-center justify-center">
            {/* Visual preview */}
            <img
              src={value}
              alt={label}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="p-3 bg-white border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#48603D] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#48603D] inline-block"></span>
                تم التقاط وتحسين الصورة
              </span>
              {compressionStats && (
                <p className="text-[10px] text-[#85867D] font-medium dir-ltr text-right">
                  {compressionStats.compressedKb} KB (وفّر {compressionStats.ratio}% من الحجم)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleTriggerInput}
              className="text-xs font-bold text-[#555B3D] hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EDF3EA] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              استبدال الصورة
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerInput}
          className={`cursor-pointer rounded-3xl border border-dashed transition-all p-6 sm:p-7 flex flex-col items-center justify-center gap-3 bg-[#FAF8F5] hover:bg-white active:scale-[0.99] ${
            error || fileError
              ? "border-red-400 bg-red-50/20"
              : "border-[#DCD7CA] hover:border-[#555B3D]"
          }`}
        >
          <div className="w-13 h-13 rounded-2xl bg-[#EDF3EA] border border-[#555B3D]/15 flex items-center justify-center text-[#555B3D] group-hover:scale-105 transition-transform shadow-xs">
            <Camera className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm font-bold text-[#20251F] font-heading">
              اضغط لفتح الكاميرا أو اختيار صورة
            </p>
            <p className="text-[11px] text-[#85867D]">
              يتم ضغط الصورة تلقائياً لرفع فوري فائق السرعة
            </p>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] px-3 py-1 bg-white border border-[#EAE6DC] rounded-full font-bold text-[#555B3D] flex items-center gap-1 shadow-xs">
              <Camera className="w-3.5 h-3.5 stroke-[2]" />
              التقاط فوري
            </span>
            <span className="text-[11px] px-3 py-1 bg-white border border-[#EAE6DC] rounded-full font-bold text-[#85867D] flex items-center gap-1 shadow-xs">
              <ImageIcon className="w-3.5 h-3.5 stroke-[2]" />
              من المعرض
            </span>
          </div>
        </div>
      )}

      {(error || fileError) && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 pt-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || fileError}</span>
        </div>
      )}
    </div>
  );
}
