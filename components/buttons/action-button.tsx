import React from "react";
import Link from "next/link";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends ButtonProps {
  href?: string;
  external?: boolean;
}

export function ActionButton({ href, external, children, className, ...props }: ActionButtonProps) {
  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="inline-block"
      >
        <Button className={cn(className)} {...props}>
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button className={cn(className)} {...props}>
      {children}
    </Button>
  );
}
