"use client";

import React, { useRef, useState, useEffect } from "react";
import { Search, X, Loader2, ArrowRight, Building2, MapPin, Sparkles } from "lucide-react";
import { TheatreSearchSuggestion } from "@/types/theatre-search.types";
import { loadSearchSuggestionsAction } from "@/actions/theatre-search-actions";
import { cn } from "@/utils";

interface TheatreSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onSelectSuggestion?: (suggestion: TheatreSearchSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export function TheatreSearchBar({
  value,
  onChange,
  onSearch,
  onSelectSuggestion,
  placeholder = "Search by cinema, city, GST, area, admin, or amenities...",
  className,
}: TheatreSearchBarProps) {
  const [suggestions, setSuggestions] = useState<TheatreSearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (Cmd/Ctrl + K) to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await loadSearchSuggestionsAction({ query: value.trim(), limit: 5 });
        if (!isCancelled && res.success && res.data) {
          setSuggestions(res.data);
          setShowDropdown(res.data.length > 0);
        }
      } catch {
        // Fallback silently
      } finally {
        if (!isCancelled) setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(value);
  };

  const handleClear = () => {
    onChange("");
    onSearch("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-[#94A3B8] pointer-events-none">
          {isLoadingSuggestions ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#F59E0B]" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-[#0F172A]/90 border border-[#2A3445] rounded-xl text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/50 transition-all shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[#64748B] bg-[#1E293B] border border-[#334155] rounded">
              <span>⌘</span>K
            </kbd>
          )}

          <button
            type="submit"
            className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#070B12] rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-2 bg-[#0F172A] border border-[#2A3445] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in-50 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-[#1E293B] flex items-center justify-between text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
              Quick Suggestions
            </span>
            <span className="text-[10px] text-[#64748B]">Press Enter to Search</span>
          </div>

          <div className="divide-y divide-[#1E293B]/50">
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => {
                  onChange(sug.title);
                  setShowDropdown(false);
                  if (onSelectSuggestion) {
                    onSelectSuggestion(sug);
                  } else {
                    onSearch(sug.title);
                  }
                }}
                className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#1E293B]/80 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#1E293B] border border-[#334155] text-[#94A3B8] group-hover:text-[#F59E0B] group-hover:border-[#F59E0B]/40 transition-colors">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-[#F59E0B] transition-colors">
                      {sug.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-[#64748B]" />
                      {sug.subtitle}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
