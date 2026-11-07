"use client";

import React, { useState } from "react";
import { Bold, Italic, Link, List, ListOrdered, Quote, Code, Heading } from "lucide-react";
import { cn } from "@/utils";

export interface RichTextPlaceholderProps {
  label?: string;
  helperText?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Enterprise Rich Text Editor Placeholder
 * Markdown & WYSIWYG editor toolbar for film synopsis, distributor terms, and release notes.
 */
export function RichTextPlaceholder({
  label = "Rich Text Description",
  helperText = "Supports standard formatting and cinematic HTML tags",
  placeholder = "Draft detailed cinema synopsis, technical notes, or legal disclaimers...",
  defaultValue = "",
  disabled = false,
  className,
}: RichTextPlaceholderProps) {
  const [content, setContent] = useState(defaultValue);

  return (
    <div className={cn("w-full space-y-1.5 text-left", className)}>
      {label && <label className="block text-xs font-semibold text-[#CBD5E1]">{label}</label>}

      <div
        className={cn(
          "rounded-2xl border border-[#2A3445] bg-[#111827] overflow-hidden focus-within:border-[#FBBF24]/50 transition-colors",
          disabled && "opacity-40 cursor-not-allowed pointer-events-none"
        )}
      >
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0B1220] border-b border-[#2A3445] text-[#94A3B8]">
          {[
            { icon: Bold, label: "Bold" },
            { icon: Italic, label: "Italic" },
            { icon: Heading, label: "Header" },
            { icon: Link, label: "Link" },
            { icon: List, label: "Bullet List" },
            { icon: ListOrdered, label: "Ordered List" },
            { icon: Quote, label: "Blockquote" },
            { icon: Code, label: "Code" },
          ].map((btn, i) => {
            const Icon = btn.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => alert(`Toolbar action "${btn.label}" (Placeholder in this phase)`)}
                className="p-1.5 rounded-lg hover:bg-[#161F2E] hover:text-white transition-colors"
                title={btn.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        {/* Text Area Body */}
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-4 bg-transparent text-xs text-white placeholder-[#64748B] focus:outline-none resize-y"
        />
      </div>

      {helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
}

