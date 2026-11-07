"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File, X, Check } from "lucide-react";
import { cn } from "@/utils";

export interface UploadPlaceholderProps {
  label?: string;
  hint?: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export function UploadPlaceholder({
  label = "Upload Asset or Manifest",
  hint = "SVG, PNG, JPG or PDF up to 25MB",
  accept,
  onFileSelect,
  className,
}: UploadPlaceholderProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelect?.(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "p-6 rounded-2xl bg-[#111827] border-2 border-dashed border-[#2A3445] hover:border-[#FBBF24]/50 transition-colors cursor-pointer text-center group",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="h-12 w-12 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto mb-3 group-hover:scale-105 transition-transform">
        <UploadCloud className="h-6 w-6" />
      </div>

      {selectedFileName ? (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
          <Check className="h-4 w-4" />
          <span>{selectedFileName}</span>
        </div>
      ) : (
        <>
          <div className="text-xs font-bold text-[#F9FAFB]">{label}</div>
          <p className="text-[11px] text-[#94A3B8] mt-1">{hint}</p>
        </>
      )}
    </div>
  );
}

