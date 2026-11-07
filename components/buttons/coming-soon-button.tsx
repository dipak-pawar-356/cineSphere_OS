"use client";

import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { ComingSoonModal } from "@/components/modals/coming-soon-modal";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComingSoonButtonProps extends Omit<ButtonProps, "onClick"> {
  featureName?: string;
  description?: string;
  showSparkle?: boolean;
  label?: string;
}

export function ComingSoonButton({
  featureName = "Booking Engine",
  description,
  showSparkle = false,
  label = "Coming Soon",
  children,
  className,
  variant = "secondary",
  size = "md",
  ...props
}: ComingSoonButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setModalOpen(true)}
        className={cn("group relative", className)}
        {...props}
      >
        {showSparkle && (
          <Sparkles className="h-3.5 w-3.5 text-amber-400 mr-1.5 transition-transform group-hover:rotate-12" />
        )}
        {children || label}
      </Button>

      <ComingSoonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        featureName={featureName}
        description={description}
      />
    </>
  );
}
