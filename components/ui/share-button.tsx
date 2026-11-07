"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { Button } from "./button";

export interface ShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

/**
 * Enterprise Share Button
 * Uses Web Share API or falls back to URL copy.
 */
export function ShareButton({
  title = "CineSphere OS Showcase",
  url,
  className,
}: ShareButtonProps) {
  const handleShare = async () => {
    const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "https://cinesphere.io");
    if (navigator.share) {
      try {
        await navigator.share({ title, url: targetUrl });
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(targetUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      iconLeft={<Share2 className="h-3.5 w-3.5 text-[#FBBF24]" />}
      className={className}
    >
      <span>Share</span>
    </Button>
  );
}

