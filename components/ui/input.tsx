import React, { useState } from "react";
import { cn } from "@/utils";
import { Eye, EyeOff, Search, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/loaders/spinner";

export type InputState = "default" | "error" | "success";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  state?: InputState;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  inputSize?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: "h-8.5 text-xs px-3",
  md: "h-10 text-xs sm:text-sm px-3.5",
  lg: "h-12 text-sm sm:text-base px-4",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      state = "default",
      errorMessage,
      successMessage,
      leftIcon,
      rightIcon,
      isLoading = false,
      clearable = false,
      onClear,
      disabled,
      readOnly,
      value,
      inputSize = "md",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    const stateStyles = {
      default:
        "border-[#2A3445] focus:border-[#FBBF24]/60 focus:ring-1 focus:ring-[#FBBF24]/30",
      error:
        "border-[#EF4444] text-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/40",
      success:
        "border-[#22C55E] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/40",
    };

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-semibold text-[#CBD5E1]">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-[#94A3B8] pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={actualType}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            className={cn(
              "w-full rounded-lg bg-[#111827] text-[#F9FAFB] placeholder:text-[#94A3B8]/60 border transition-all duration-150 outline-none",
              SIZE_MAP[inputSize],
              leftIcon && "pl-9",
              (rightIcon || isPassword || clearable || isLoading || state !== "default") && "pr-10",
              stateStyles[state],
              disabled && "opacity-40 cursor-not-allowed bg-[#0B1220]",
              readOnly && "bg-[#0B1220]/60 cursor-default",
              className
            )}
            {...props}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {isLoading && <Spinner size="sm" />}

            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                className="text-[#94A3B8] hover:text-[#F9FAFB] p-0.5 rounded cursor-pointer"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {isPassword && !disabled && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#94A3B8] hover:text-[#F9FAFB] p-0.5 rounded cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {state === "error" && !isLoading && (
              <AlertCircle className="h-4 w-4 text-[#EF4444]" />
            )}
            {state === "success" && !isLoading && (
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            )}
            {rightIcon && !isLoading && rightIcon}
          </div>
        </div>

        {state === "error" && errorMessage && (
          <p className="text-[11px] text-[#EF4444] font-medium leading-none pl-1">
            {errorMessage}
          </p>
        )}
        {state === "success" && successMessage && (
          <p className="text-[11px] text-[#22C55E] font-medium leading-none pl-1">
            {successMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
