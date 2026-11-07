"use client";

import React, { useState } from "react";
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  acceptedFormats?: string[];
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  onFileSelect?: (file: File) => void;
}

/**
 * Enterprise File Upload Placeholder
 * Drag-and-drop zone with format tags, size limits, and progress representation.
 */
export function FileUpload({
  label = "Upload File Asset",
  helperText = "Drag & drop DCP keys, EDI 460 logs, or acoustic schematics",
  acceptedFormats = ["PDF", "XML", "CSV", "JSON"],
  maxSizeMb = 50,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className={cn("w-full space-y-1.5 text-left", className)}>
      {label && <label className="block text-xs font-semibold text-[#CBD5E1]">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          alert("File drop simulation triggered (Placeholder in this phase)");
        }}
        onClick={() => {
          if (!disabled) alert("File upload dialogue is a placeholder in this phase.");
        }}
        className={cn(
          "p-6 rounded-2xl border-2 border-dashed transition-all duration-150 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer",
          isDragging
            ? "border-[#FBBF24] bg-[#FBBF24]/5"
            : "border-[#2A3445] hover:border-[#FBBF24]/50 bg-[#111827]",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none"
        )}
      >
        <div className="h-10 w-10 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
          <UploadCloud className="h-5 w-5" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-white">
            Click to browse or drag & drop files here
          </div>
          <p className="text-[11px] text-[#94A3B8]">{helperText}</p>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          {acceptedFormats.map((fmt, i) => (
            <Badge key={i} variant="outline" size="sm">
              {fmt}
            </Badge>
          ))}
          <span className="text-[10px] text-[#64748B] font-mono">Max {maxSizeMb}MB</span>
        </div>
      </div>
    </div>
  );
}

