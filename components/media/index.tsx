import React from "react";
import { Film, Image as ImageIcon, Play, User } from "lucide-react";
import { cn } from "@/utils";

export interface PosterPlaceholderProps {
  aspectRatio?: "2/3" | "16/9" | "1/1";
  title?: string;
  className?: string;
}

export function PosterPlaceholder({
  aspectRatio = "2/3",
  title = "Film Reel Asset",
  className,
}: PosterPlaceholderProps) {
  const aspectClass = {
    "2/3": "aspect-[2/3]",
    "16/9": "aspect-video",
    "1/1": "aspect-square",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col items-center justify-center p-4 text-center overflow-hidden group",
        aspectClass[aspectRatio],
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-2 group-hover:scale-105 transition-transform">
        <Film className="h-6 w-6" />
      </div>
      <span className="text-xs font-semibold text-[#CBD5E1] truncate">{title}</span>
      <span className="text-[10px] text-[#94A3B8]">CineSphere Raw Asset</span>
    </div>
  );
}

export interface BannerPlaceholderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function BannerPlaceholder({
  title = "Wide Hall Projection Canvas",
  subtitle = "High-Resolution 4K Laser Throw Simulator",
  className,
}: BannerPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative h-48 sm:h-64 w-full rounded-2xl bg-gradient-to-r from-[#161F2E] via-[#111827] to-[#161F2E] border border-[#2A3445] flex flex-col items-center justify-center p-6 text-center overflow-hidden",
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mb-3">
        <ImageIcon className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
      <p className="text-xs text-[#94A3B8] mt-1 max-w-sm">{subtitle}</p>
    </div>
  );
}

export interface VideoPlaceholderProps {
  title?: string;
  duration?: string;
  className?: string;
}

export function VideoPlaceholder({
  title = "Teaser Trailer Feed",
  duration = "02:45",
  className,
}: VideoPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full rounded-2xl bg-[#0B1220] border border-[#2A3445] flex flex-col items-center justify-center p-4 overflow-hidden group cursor-pointer",
        className
      )}
    >
      <div className="h-14 w-14 rounded-full bg-[#FBBF24] text-[#070B12] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        <Play className="h-6 w-6 fill-current translate-x-0.5" />
      </div>

      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-white">
        <span className="font-semibold truncate">{title}</span>
        <span className="font-mono text-[11px] bg-black/60 px-2 py-0.5 rounded border border-white/10">
          {duration}
        </span>
      </div>
    </div>
  );
}

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const sizeMap = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full bg-[#161F2E] border border-[#2A3445] overflow-hidden flex items-center justify-center text-[#FBBF24] font-bold select-none shrink-0",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials || "CS"}</span>
      )}
    </div>
  );
}

