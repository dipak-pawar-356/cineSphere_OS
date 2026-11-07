"use client";

import React, { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/utils";

export interface VoiceSearchProps {
  onTranscript?: (text: string) => void;
  className?: string;
}

/**
 * Enterprise Voice Search Placeholder
 * Accessible voice query trigger with wave listening state representation.
 */
export function VoiceSearchPlaceholder({ onTranscript, className }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);

  const toggleListen = () => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        alert("Voice recognition recognized query: 'IMAX Dolby Atmos showtimes near me' (Simulation)");
      }, 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListen}
      className={cn(
        "p-2 rounded-xl border transition-colors relative",
        isListening
          ? "bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse"
          : "bg-[#111827] border-[#2A3445] text-[#94A3B8] hover:text-[#FBBF24]",
        className
      )}
      title={isListening ? "Listening..." : "Click to speak voice search"}
      aria-label="Voice search query"
    >
      {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
    </button>
  );
}

