import React from "react";
import { User, Shield, Mail, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  tenantName: string;
  avatarUrl?: string;
  className?: string;
}

export function ProfileCard({
  name,
  email,
  role,
  tenantName,
  avatarUrl,
  className,
}: ProfileCardProps) {
  return (
    <Card variant="elevated" className={cn("p-6", className)}>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-[#111827] border border-[#2A3445] overflow-hidden flex items-center justify-center text-[#FBBF24]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base">{name}</h4>
            <Badge variant="primary" size="sm">
              {role}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Mail className="h-3.5 w-3.5" />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1]">
            <Building className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span>{tenantName}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

