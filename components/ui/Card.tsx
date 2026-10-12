"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "navy" | "neutral";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles = {
    success: "bg-[#EBFDF2] text-[#16803C] border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-[#FEF3F2] text-[#C62828] border-red-200",
    navy: "bg-blue-50 text-[#0B2646] border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E4E7EC] shadow-xs p-4 sm:p-5 transition-all ${
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-sm" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
