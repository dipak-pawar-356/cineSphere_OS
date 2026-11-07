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

export interface LogoPlaceholderProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LogoPlaceholder({
  name = "CineSphere OS",
  size = "md",
  className,
}: LogoPlaceholderProps) {
  const sizeMap = {
    sm: "h-8 px-2.5 text-xs gap-1.5",
    md: "h-10 px-3 text-sm gap-2",
    lg: "h-12 px-4 text-base gap-2.5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl bg-[#111827] border border-[#2A3445] font-bold text-white select-none",
        sizeMap[size],
        className
      )}
    >
      <div className="h-5 w-5 rounded-md bg-[#FBBF24] flex items-center justify-center text-[#070B12] font-black text-xs">
        C
      </div>
      <span>{name}</span>
    </div>
  );
}

export interface ImagePlaceholderProps {
  label?: string;
  className?: string;
}

export function ImagePlaceholder({
  label = "Image Asset Placeholder",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col items-center justify-center p-6 text-center text-xs text-[#94A3B8]",
        className
      )}
    >
      <ImageIcon className="h-8 w-8 text-[#64748B] mb-2" />
      <span className="font-medium text-[#CBD5E1]">{label}</span>
      <span className="text-[10px] text-[#64748B]">16:9 / 4:3 Responsive Frame</span>
    </div>
  );
}

export interface GalleryPlaceholderProps {
  count?: number;
  className?: string;
}

export function GalleryPlaceholder({ count = 4, className }: GalleryPlaceholderProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl bg-[#111827] border border-[#2A3445] flex flex-col items-center justify-center p-3 text-center group hover:border-[#FBBF24]/50 transition-colors"
        >
          <ImageIcon className="h-6 w-6 text-[#94A3B8] group-hover:text-[#FBBF24] transition-colors mb-1.5" />
          <span className="text-[11px] font-medium text-[#CBD5E1]">Asset #{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
