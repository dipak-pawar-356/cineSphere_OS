import React from "react";
import Link from "next/link";
import { Film, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-20 w-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto shadow-xl shadow-amber-500/10">
          <Film className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            Error 404 • Reel Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Off-Screen Projector
          </h1>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            The auditorium, movie reel, or dashboard module you are looking for does not exist or has been shifted to another screen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <Link href="/movies">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              <Film className="h-4 w-4 mr-2" />
              Browse Movies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
