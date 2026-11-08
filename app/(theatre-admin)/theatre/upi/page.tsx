"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import {
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Save,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Lock,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TheatreUPIPaymentPage() {
  const { profile, paymentConfig, updatePaymentConfig } = useTheatreStore();

  const [businessName, setBusinessName] = useState(paymentConfig.businessName);
  const [merchantName, setMerchantName] = useState(paymentConfig.merchantName);
  const [upiId, setUpiId] = useState(paymentConfig.upiId);
  const [bankName, setBankName] = useState(paymentConfig.bankName);
  const [ifscCode, setIfscCode] = useState(paymentConfig.ifscCode);
  const [accountMasked, setAccountMasked] = useState(paymentConfig.accountNumberMasked);
  const [settlementPeriod, setSettlementPeriod] = useState(paymentConfig.settlementPeriod);

  // Gateway statuses
  const [razorpayEnabled, setRazorpayEnabled] = useState(paymentConfig.gateways.razorpay.enabled);
  const [phonepeEnabled, setPhonepeEnabled] = useState(paymentConfig.gateways.phonepe.enabled);
  const [paytmEnabled, setPaytmEnabled] = useState(paymentConfig.gateways.paytm.enabled);
  const [stripeEnabled, setStripeEnabled] = useState(paymentConfig.gateways.stripe.enabled);

  // Validation & feedback state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // UPI regex validator: e.g. name@icici, cinesphere.pune@hdfcbank, etc.
  const isValidUPI = (id: string) => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(id.trim());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUPI(upiId)) {
      setValidationError("Invalid UPI VPA format. Must be formatted like name@bank (e.g. cinesphere.pune@icici).");
      return;
    }

    setValidationError(null);

    // Auto-generate standard NPCI UPI intent string for QR code
    const generatedQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(merchantName.trim())}&cu=INR`
    )}`;

    updatePaymentConfig({
      businessName: businessName.trim(),
      merchantName: merchantName.trim(),
      upiId: upiId.trim(),
      qrPlaceholder: generatedQR,
      bankName: bankName.trim(),
      ifscCode: ifscCode.trim(),
      accountNumberMasked: accountMasked.trim(),
      settlementPeriod,
      gateways: {
        razorpay: { enabled: razorpayEnabled, keyIdMasked: paymentConfig.gateways.razorpay.keyIdMasked },
        phonepe: { enabled: phonepeEnabled, merchantIdMasked: paymentConfig.gateways.phonepe.merchantIdMasked },
        paytm: { enabled: paytmEnabled, midMasked: paymentConfig.gateways.paytm.midMasked },
        stripe: { enabled: stripeEnabled, pubKeyMasked: paymentConfig.gateways.stripe.pubKeyMasked },
      },
    });

    setSuccessNotice("Tenant UPI Rail & Settlement parameters updated and persisted.");
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const dynamicQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${upiId || "merchant@bank"}&pn=${encodeURIComponent(merchantName || "CineSphere")}&cu=INR`
  )}`;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="UPI & Payment Gateway Configuration"
        subtitle={`Tenant-Isolated Settlement Rail • ${profile.name} (${profile.code})`}
        description="Every cinema operates an independent merchant account. Customer ticket payments flow directly to your designated UPI VPA and bank rails."
        badge="Independent Merchant"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              form="upi-form"
              variant="primary"
              size="sm"
              className="gap-2 font-bold bg-[#E50914] hover:bg-[#b80710] text-white"
            >
              <Save className="h-4 w-4" /> Save Rail Config
            </Button>
          </div>
        }
      />

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Tenant Isolation Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Tenant-Isolated Settlement Rail</h3>
            <p className="text-xs text-[#94A3B8]">
              CineSphere OS does not pool ticket revenue. Customer transactions credit your bank via RBI & NPCI rails.
            </p>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 shrink-0">
          NPCI Standard v2.0
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <form id="upi-form" onSubmit={handleSave} className="space-y-6">
            {/* Primary UPI VPA Card */}
            <Card variant="elevated" className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-[#FBBF24]" />
                  <h3 className="font-bold text-white text-base">Direct UPI Virtual Payment Address (VPA)</h3>
                </div>
                <Badge variant="warning" size="sm">Primary Checkout Rail</Badge>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Registered Business Entity</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#94A3B8] font-medium">Merchant Display Name (Customer-Facing)</label>
                    <input
                      type="text"
                      required
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Designated UPI ID / VPA</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. cinesphere.pune@icici"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono text-sm focus:outline-none focus:border-[#FBBF24]"
                    />
                    <div className="absolute right-3 top-2.5">
                      {isValidUPI(upiId) ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono">Format: name@bank</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#64748B]">
                    Payments collected from Google Pay, PhonePe, Paytm, and BHIM QR will credit this VPA.
                  </span>
                </div>
              </div>
            </Card>

            {/* Nodal Bank Settlement Details */}
            <Card variant="elevated" className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#38BDF8]" />
                  <h3 className="font-bold text-white text-base">Nodal Settlement Bank Account</h3>
                </div>
                <Badge variant="outline" size="sm" className="border-[#2A3445] text-[#94A3B8]">
                  Direct NEFT / RTGS
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Bank Name & Branch</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono uppercase focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Account Number (Masked)</label>
                  <input
                    type="text"
                    required
                    value={accountMasked}
                    onChange={(e) => setAccountMasked(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Settlement Velocity</label>
                  <select
                    value={settlementPeriod}
                    onChange={(e) => setSettlementPeriod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="T+0 Instant">T+0 Instant Settlement (Real-time)</option>
                    <option value="T+1 Daily">T+1 Daily Auto-Sweep (09:00 AM)</option>
                    <option value="Weekly">Weekly Consolidated Sweep</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Supplementary Gateways (Card & Net Banking Rails) */}
            <Card variant="elevated" className="p-6 space-y-4">
              <div className="border-b border-[#2A3445] pb-3">
                <h3 className="font-bold text-white text-base">Payment Gateway Providers (Credit / Debit / Net Banking)</h3>
                <p className="text-xs text-[#94A3B8]">Enable auxiliary payment rails for corporate cards and international tourists.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    name: "Razorpay Multi-Rail",
                    enabled: razorpayEnabled,
                    toggle: () => setRazorpayEnabled(!razorpayEnabled),
                    keyId: paymentConfig.gateways.razorpay.keyIdMasked,
                    desc: "Credit Cards, Debit Cards, NetBanking (54 Banks)",
                  },
                  {
                    name: "PhonePe PG Direct",
                    enabled: phonepeEnabled,
                    toggle: () => setPhonepeEnabled(!phonepeEnabled),
                    keyId: paymentConfig.gateways.phonepe.merchantIdMasked,
                    desc: "Deep-link intent flow & UPI AutoPay",
                  },
                  {
                    name: "Paytm Business Rail",
                    enabled: paytmEnabled,
                    toggle: () => setPaytmEnabled(!paytmEnabled),
                    keyId: paymentConfig.gateways.paytm.midMasked,
                    desc: "Postpaid & Paytm Wallet",
                  },
                  {
                    name: "Stripe International",
                    enabled: stripeEnabled,
                    toggle: () => setStripeEnabled(!stripeEnabled),
                    keyId: paymentConfig.gateways.stripe.pubKeyMasked,
                    desc: "Global Amex, Visa, Mastercard in 135 currencies",
                  },
                ].map((gw) => (
                  <div
                    key={gw.name}
                    className="p-4 rounded-xl bg-[#070B12] border border-[#2A3445] flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{gw.name}</span>
                        <Badge variant={gw.enabled ? "success" : "secondary"} size="sm">
                          {gw.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">{gw.desc}</p>
                      <div className="text-[10px] text-[#64748B] font-mono">Key: {gw.keyId}</div>
                    </div>

                    <button
                      type="button"
                      onClick={gw.toggle}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        gw.enabled
                          ? "bg-[#111827] text-rose-400 hover:bg-rose-500/10 border border-[#2A3445]"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                      }`}
                    >
                      {gw.enabled ? "Disable Rail" : "Enable Rail"}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </form>
        </div>

        {/* Right Col: Live QR & Payment Verification Card */}
        <div className="space-y-6">
          <Card variant="elevated" className="p-6 space-y-5 text-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FBBF24]">Live QR Verification</span>
              <h3 className="font-bold text-white text-base mt-1">Tenant Checkout Simulator</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                This QR code is rendered directly for customers booking at {profile.name}.
              </p>
            </div>

            {/* QR Visual Container */}
            <div className="p-4 rounded-2xl bg-white w-56 h-56 mx-auto flex items-center justify-center shadow-xl border-4 border-[#2A3445]">
              <img
                src={dynamicQRUrl}
                alt="UPI QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445] text-left space-y-1 font-mono">
                <div className="text-[10px] text-[#64748B] uppercase">Active VPA</div>
                <div className="text-white font-bold truncate">{upiId || "Not Configured"}</div>
                <div className="text-[10px] text-[#64748B] uppercase pt-1">Merchant</div>
                <div className="text-[#FBBF24] truncate">{merchantName}</div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Zero Gateway Intermediary Friction</span>
              </div>
            </div>
          </Card>

          {/* Compliance & RBI Guidelines */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2.5 text-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#FBBF24]" />
              <span>Compliance & Security</span>
            </h4>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              In accordance with RBI merchant settlement guidelines, all ticket remittances are cleared on a T+0 basis into the registered corporate bank account. Platform service commissions are invoiced monthly.
            </p>
            <div className="pt-2 border-t border-[#2A3445] text-[10px] text-[#64748B]">
              Tenant Entity ID: <strong className="text-white font-mono">{profile.id}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
