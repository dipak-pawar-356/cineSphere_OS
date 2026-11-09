"use client";

import React, { useState } from "react";
import { DigitalTicket } from "@/types/ticket.types";
import { Button } from "@/components/ui/button";
import { Code, Check, Copy, Shield, X } from "lucide-react";

interface QrPayloadInspectorProps {
  ticket: DigitalTicket;
}

export function QrPayloadInspector({ ticket }: QrPayloadInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const payloadString = JSON.stringify(ticket.qrPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full gap-2 text-xs border-[#1E2E48] text-[#94A3B8] hover:text-white hover:bg-[#111C2E]"
      >
        <Code className="w-3.5 h-3.5 text-[#FBBF24]" /> Inspect Decoded QR Payload
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0D1522] border border-[#1E2E48] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1E2E48] bg-[#0A0F1A]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Cryptographic QR Security Payload
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E2E48] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="p-4 bg-[#111C2E]/50 border-b border-[#1E2E48] text-xs text-[#94A3B8] leading-relaxed">
              This raw JSON manifest is dynamically encoded inside the QR image. The gate turnstile verifies this payload against the secure ticket registry for immediate offline/online access validation.
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#070B12]">
              <pre className="text-[#38BDF8] whitespace-pre-wrap break-all leading-5">
                {payloadString}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-[#1E2E48] bg-[#0A0F1A]">
              <span className="text-[11px] text-[#64748B]">
                Version: {ticket.qrPayload.version} • {ticket.seatNumbers.length} seat(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs border-[#1E2E48] text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy JSON
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

