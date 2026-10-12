"use client";

import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#182230] select-none"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#182230] placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B2646] focus:border-[#0B2646] disabled:bg-slate-50 disabled:text-slate-400 ${
            leftIcon ? "pr-10" : ""
          } ${
            error
              ? "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]"
              : "border-[#E4E7EC]"
          } ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-[#C62828]">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#667085]">{helperText}</p>
      ) : null}
    </div>
  );
}
