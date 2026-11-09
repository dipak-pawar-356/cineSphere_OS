"use client";

import React, { useState, useEffect, useCallback, useMemo, useTransition } from "react";
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
  Plus,
  Star,
  Trash2,
  Edit3,
  Sliders,
  ArrowUpRight,
  Activity,
  FileText,
  Check,
  Eye,
  Copy,
  Smartphone,
  Layers,
  Banknote,
  DollarSign,
  X,
  Search,
  Filter,
  Upload,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  PaymentConfiguration,
  PaymentProvider,
  PaymentProviderStatus,
  PaymentAuditLog,
} from "@/types/payment-config.types";
import {
  validateUpiAction,
  deriveUpiQrAction,
  createPaymentConfigurationAction,
  updatePaymentConfigurationAction,
  deletePaymentConfigurationAction,
  activatePaymentConfigurationAction,
  deactivatePaymentConfigurationAction,
  setPrimaryPaymentConfigurationAction,
  getTheatrePaymentConfigurationsAction,
  getPaymentAuditLogsAction,
  uploadPaymentQrAction,
  deletePaymentQrAction,
} from "@/actions/payment-config-actions";
import { deriveUpiQrPayload, validateUpiId } from "@/lib/engine/payment-config-engine";

export default function TheatrePaymentConfigHubPage() {
  const { profile } = useTheatreStore();
  const [isPending, startTransition] = useTransition();

  // Multi-rail payment configurations for current theatre
  const [configurations, setConfigurations] = useState<PaymentConfiguration[]>([]);
  const [auditLogs, setAuditLogs] = useState<PaymentAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"rails" | "gateways" | "audit">("rails");

  // Simulator state
  const [simulatorSelectedConfigId, setSimulatorSelectedConfigId] = useState<string>("");
  const [simulatorAmount, setSimulatorAmount] = useState<number>(350);
  const [simulatorNote, setSimulatorNote] = useState<string>("Phoenix Box Office Test");

  // Modal / Form state for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  // Form inputs
  const [formBusinessName, setFormBusinessName] = useState(profile.name);
  const [formMerchantName, setFormMerchantName] = useState(profile.name);
  const [formDisplayName, setFormDisplayName] = useState(profile.name);
  const [formProvider, setFormProvider] = useState<PaymentProvider>("UPI");
  const [formUpiId, setFormUpiId] = useState(`cinesphere.${profile.city?.toLowerCase() || "theatre"}@icici`);
  const [formMerchantCode, setFormMerchantCode] = useState("7832");
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [formBankName, setFormBankName] = useState("HDFC Bank");
  const [formAccountNumber, setFormAccountNumber] = useState("••••••••4810");
  const [formIfscCode, setFormIfscCode] = useState("HDFC0000060");
  const [formSettlementPeriod, setFormSettlementPeriod] = useState<string>("T+0 Instant");
  const [formDescription, setFormDescription] = useState("");
  const [formKeyIdMasked, setFormKeyIdMasked] = useState("");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPrimaryOnly, setFilterPrimaryOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  // Feedback notifications
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Compute filtered configurations
  const filteredConfigurations = useMemo(() => {
    return configurations
      .filter((cfg) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = cfg.merchantDisplayName?.toLowerCase().includes(q);
          const matchMerchant = cfg.merchantName?.toLowerCase().includes(q);
          const matchUpi = cfg.upiId?.toLowerCase().includes(q);
          const matchProvider = cfg.provider?.toLowerCase().includes(q);
          if (!matchName && !matchMerchant && !matchUpi && !matchProvider) return false;
        }

        if (filterProvider !== "ALL" && cfg.provider !== filterProvider) return false;
        if (filterStatus !== "ALL" && cfg.status !== filterStatus) return false;
        if (filterPrimaryOnly && !cfg.isPrimary) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        if (sortBy === "name") {
          return a.merchantDisplayName.localeCompare(b.merchantDisplayName);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [configurations, searchQuery, filterProvider, filterStatus, filterPrimaryOnly, sortBy]);

  // Fetch configurations on load or when profile.id changes
  const loadConfigurations = useCallback(() => {
    startTransition(async () => {
      const res = await getTheatrePaymentConfigurationsAction(profile.id, "THEATRE_ADMIN");
      if (res.success && res.data) {
        setConfigurations(res.data);
        if (!simulatorSelectedConfigId && res.data.length > 0) {
          const primary = res.data.find((c) => c.isPrimary) || res.data[0];
          setSimulatorSelectedConfigId(primary.id);
        }
      }

      const logRes = await getPaymentAuditLogsAction(profile.id, "THEATRE_ADMIN");
      if (logRes.success && logRes.data) {
        setAuditLogs(logRes.data);
      }
    });
  }, [profile.id, simulatorSelectedConfigId]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 4500);
  };

  const showError = (msg: string) => {
    setErrorNotice(msg);
    setTimeout(() => setErrorNotice(null), 4500);
  };

  // Open Create Modal
  const handleOpenCreateModal = (provider: PaymentProvider = "UPI") => {
    setModalMode("create");
    setEditingConfigId(null);
    setFormBusinessName(profile.name);
    setFormMerchantName(profile.name);
    setFormDisplayName(`${profile.name} (${provider === "UPI" ? "Box Office" : provider})`);
    setFormProvider(provider);
    setFormUpiId(
      provider === "UPI"
        ? `cinesphere.${profile.city?.toLowerCase() || "theatre"}@icici`
        : `cinesphere.${provider.toLowerCase()}@icici`
    );
    setFormMerchantCode("7832");
    setFormIsPrimary(configurations.length === 0);
    setFormBankName("HDFC Bank");
    setFormAccountNumber("••••••••4810");
    setFormIfscCode("HDFC0000060");
    setFormSettlementPeriod("T+0 Instant");
    setFormDescription(
      provider === "UPI"
        ? "Direct UPI collection rail for ticket bookings with instant nodal sweep"
        : `${provider} aggregator collection rail`
    );
    setFormKeyIdMasked(provider !== "UPI" ? `key_live_••••••••${Math.floor(1000 + Math.random() * 9000)}` : "");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cfg: PaymentConfiguration) => {
    setModalMode("edit");
    setEditingConfigId(cfg.id);
    setFormBusinessName(cfg.businessName);
    setFormMerchantName(cfg.merchantName);
    setFormDisplayName(cfg.merchantDisplayName);
    setFormProvider(cfg.provider);
    setFormUpiId(cfg.upiId);
    setFormMerchantCode(cfg.merchantCode);
    setFormIsPrimary(cfg.isPrimary);
    setFormBankName(cfg.bankName);
    setFormAccountNumber(cfg.accountNumberMasked || "");
    setFormIfscCode(cfg.ifscCode || "");
    setFormSettlementPeriod(cfg.settlementPeriod);
    setFormDescription(cfg.description || "");
    setFormKeyIdMasked(cfg.credentials?.keyIdMasked || "");
    setIsModalOpen(true);
  };

  // Submit Modal (Create or Update)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formProvider === "UPI") {
      const validation = validateUpiId(formUpiId);
      if (!validation.isValid) {
        showError(validation.error || "Invalid UPI VPA format");
        return;
      }
    }

    if (modalMode === "create") {
      const res = await createPaymentConfigurationAction({
        theatreId: profile.id,
        businessName: formBusinessName,
        merchantName: formMerchantName,
        merchantDisplayName: formDisplayName,
        provider: formProvider,
        upiId: formUpiId,
        merchantCode: formMerchantCode || "7832",
        isPrimary: formIsPrimary,
        bankName: formBankName,
        accountNumberMasked: formAccountNumber,
        ifscCode: formIfscCode,
        settlementPeriod: formSettlementPeriod,
        description: formDescription,
        credentials: formKeyIdMasked ? { keyIdMasked: formKeyIdMasked } : {},
      });

      if (res.success && res.data) {
        showSuccess(res.message || "Payment rail created successfully.");
        setIsModalOpen(false);
        loadConfigurations();
      } else {
        showError(res.error || "Failed to create configuration.");
      }
    } else if (editingConfigId) {
      const res = await updatePaymentConfigurationAction(editingConfigId, {
        businessName: formBusinessName,
        merchantName: formMerchantName,
        merchantDisplayName: formDisplayName,
        provider: formProvider,
        upiId: formUpiId,
        merchantCode: formMerchantCode,
        isPrimary: formIsPrimary,
        bankName: formBankName,
        accountNumberMasked: formAccountNumber,
        ifscCode: formIfscCode,
        settlementPeriod: formSettlementPeriod,
        description: formDescription,
        credentials: formKeyIdMasked ? { keyIdMasked: formKeyIdMasked } : {},
      });

      if (res.success && res.data) {
        showSuccess(res.message || "Payment rail updated successfully.");
        setIsModalOpen(false);
        loadConfigurations();
      } else {
        showError(res.error || "Failed to update configuration.");
      }
    }
  };

  // Toggle Primary
  const handleSetPrimary = async (cfgId: string) => {
    const res = await setPrimaryPaymentConfigurationAction(cfgId, profile.id);
    if (res.success) {
      showSuccess(res.message || "Primary checkout rail updated.");
      loadConfigurations();
    } else {
      showError(res.error || "Failed to designate primary rail.");
    }
  };

  // Toggle Active / Deactivate
  const handleToggleStatus = async (cfg: PaymentConfiguration) => {
    if (cfg.status === "ACTIVE") {
      const res = await deactivatePaymentConfigurationAction(cfg.id, profile.id);
      if (res.success) {
        showSuccess(`Rail '${cfg.merchantDisplayName}' deactivated.`);
        loadConfigurations();
      } else {
        showError(res.error || "Failed to deactivate rail.");
      }
    } else {
      const res = await activatePaymentConfigurationAction(cfg.id, profile.id);
      if (res.success) {
        showSuccess(`Rail '${cfg.merchantDisplayName}' activated.`);
        loadConfigurations();
      } else {
        showError(res.error || "Failed to activate rail.");
      }
    }
  };

  // Delete Rail
  const handleDeleteConfig = async (cfgId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete payment rail '${displayName}'?`)) return;

    const res = await deletePaymentConfigurationAction(cfgId, profile.id);
    if (res.success) {
      showSuccess(`Payment rail '${displayName}' removed.`);
      loadConfigurations();
    } else {
      showError(res.error || "Failed to delete rail.");
    }
  };

  // Custom QR Upload / Replace
  const handleCustomQrUpload = (cfgId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please upload a valid image file (PNG, JPG, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const res = await uploadPaymentQrAction(cfgId, profile.id, dataUrl);
      if (res.success) {
        showSuccess(res.message || "Custom QR uploaded successfully.");
        loadConfigurations();
      } else {
        showError(res.error || "Failed to upload custom QR.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Delete Custom QR (Revert to Standard NPCI Dynamic QR)
  const handleResetToDynamicQr = async (cfgId: string) => {
    const res = await deletePaymentQrAction(cfgId, profile.id);
    if (res.success) {
      showSuccess(res.message || "Reverted to dynamic NPCI standard QR.");
      loadConfigurations();
    } else {
      showError(res.error || "Failed to reset QR.");
    }
  };

  // Selected config for Simulator
  const activeSimulatorConfig =
    configurations.find((c) => c.id === simulatorSelectedConfigId) ||
    configurations.find((c) => c.isPrimary) ||
    configurations[0];

  // Dynamic QR details derived on the fly
  const dynamicSimulatorPayload = activeSimulatorConfig
    ? deriveUpiQrPayload({
        upiId: activeSimulatorConfig.upiId,
        merchantName: activeSimulatorConfig.merchantName,
        amount: simulatorAmount,
        merchantCode: activeSimulatorConfig.merchantCode,
        transactionNote: simulatorNote,
        reference: `SIM-${profile.code || "THEATRE"}-${Date.now().toString(36).toUpperCase()}`,
      })
    : null;

  // Primary config
  const primaryConfig = configurations.find((c) => c.isPrimary);

  // Helper for provider badges
  const getProviderBadge = (provider: PaymentProvider) => {
    switch (provider) {
      case "UPI":
        return <Badge variant="warning" size="sm" className="bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30">Direct UPI</Badge>;
      case "RAZORPAY":
        return <Badge variant="info" size="sm" className="bg-sky-500/10 text-sky-400 border-sky-500/30">Razorpay PG</Badge>;
      case "PHONEPE":
        return <Badge variant="success" size="sm" className="bg-purple-500/10 text-purple-400 border-purple-500/30">PhonePe Direct</Badge>;
      case "STRIPE":
        return <Badge variant="secondary" size="sm" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">Stripe Global</Badge>;
      case "CASH_COUNTER":
        return <Badge variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Cash Drawer</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{provider}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Payment Configuration & Architecture Hub"
        subtitle={`Tenant-Isolated Settlement Rails • ${profile.name} (${profile.code || "THEATRE"})`}
        description="Configure independent payment rails for Box Office, Concessions, and Payment Gateways. All collections credit your nodal bank directly with zero intermediary pooling."
        badge="Enterprise Architecture"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConfigurations}
              disabled={isPending}
              className="gap-2 border-[#2A3445] text-[#94A3B8] hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreateModal("UPI")}
              className="gap-2 font-bold bg-[#E50914] hover:bg-[#b80710] text-white shadow-lg shadow-[#E50914]/20"
            >
              <Plus className="h-4 w-4" /> Add Payment Rail
            </Button>
          </div>
        }
      />

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400 animate-fadeIn">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Architecture Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Tenant-Isolated Settlement Architecture</h3>
              <Badge variant="outline" size="sm" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                NPCI UPI v2.0
              </Badge>
              <Badge variant="outline" size="sm" className="border-[#38BDF8]/40 text-[#38BDF8] text-[10px]">
                MCC 7832: Theatres
              </Badge>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Every theatre configures 1 to N payment rails independently. Static QR image blobs are obsolete; CineSphere derives NPCI intent vectors and QR codes dynamically from verified merchant metadata.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right shrink-0">
          <div className="text-xs">
            <span className="text-[#64748B] block text-[10px] uppercase font-mono">Primary Rail VPA</span>
            <span className="font-mono font-bold text-[#FBBF24]">{primaryConfig?.upiId || "Not Configured"}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active Settlement Rails</span>
            <Layers className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {configurations.filter((c) => c.status === "ACTIVE").length} <span className="text-xs font-normal text-[#64748B]">of {configurations.length} Total</span>
          </div>
          <p className="text-[11px] text-[#64748B]">Multi-tenant isolated payment channels</p>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Primary Checkout Rail</span>
            <Star className="h-4 w-4 text-[#FBBF24]" />
          </div>
          <div className="text-lg font-bold text-white truncate">
            {primaryConfig?.merchantDisplayName || "None Selected"}
          </div>
          <p className="text-[11px] font-mono text-[#FBBF24] truncate">
            {primaryConfig?.upiId || "Action required"}
          </p>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Settlement Velocity</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {primaryConfig?.settlementPeriod || "T+0 Instant"}
          </div>
          <p className="text-[11px] text-emerald-400">Zero intermediary revenue pooling</p>
        </Card>

        <Card variant="elevated" className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Audit Trail Entries</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {auditLogs.length}
          </div>
          <p className="text-[11px] text-[#64748B]">State transitions recorded</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A3445] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("rails")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "rails"
              ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
              : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
          }`}
        >
          <QrCode className="h-4 w-4" /> Configured Rails ({configurations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gateways")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "gateways"
              ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
              : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Gateway Integrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "audit"
              ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/20"
              : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
          }`}
        >
          <FileText className="h-4 w-4" /> Audit Ledger ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Configured Payment Rails + Dynamic Simulator */}
      {activeTab === "rails" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Rails Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>Active Merchant Settlement Rails</span>
                <Badge variant="outline" size="sm" className="text-xs text-[#94A3B8] border-[#2A3445]">
                  1 Theatre : N Rails
                </Badge>
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleOpenCreateModal("UPI")}
                className="gap-1.5 border-[#2A3445] text-xs text-[#CBD5E1]"
              >
                <Plus className="h-3.5 w-3.5" /> Add Rail
              </Button>
            </div>

            {/* Search and Filters Bar */}
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Merchant, UPI ID, Provider, Rail Name..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-[#64748B] hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Providers</option>
                    <option value="UPI">Direct UPI</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="PHONEPE">PhonePe</option>
                    <option value="PAYTM">Paytm</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="CASH_COUNTER">Cash Counter</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DRAFT">Draft</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setFilterPrimaryOnly(!filterPrimaryOnly)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                      filterPrimaryOnly
                        ? "bg-[#FBBF24] text-black font-bold"
                        : "bg-[#070B12] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                    }`}
                  >
                    ★ Primary Only
                  </button>
                </div>
              </div>

              {(searchQuery || filterProvider !== "ALL" || filterStatus !== "ALL" || filterPrimaryOnly) && (
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1 border-t border-[#2A3445]/50">
                  <span>
                    Showing {filteredConfigurations.length} of {configurations.length} configured rails
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterProvider("ALL");
                      setFilterStatus("ALL");
                      setFilterPrimaryOnly(false);
                    }}
                    className="text-[#FBBF24] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear filters
                  </button>
                </div>
              )}
            </div>

            {filteredConfigurations.length === 0 ? (
              <Card variant="elevated" className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-center mx-auto text-[#64748B]">
                  <QrCode className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-white text-sm">
                  {configurations.length === 0 ? "No Payment Rails Configured" : "No Matching Payment Rails"}
                </h4>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                  {configurations.length === 0
                    ? `Set up a direct UPI VPA or payment gateway rail for ${profile.name} to start accepting customer ticket payments.`
                    : "No payment configurations matched your active filter criteria."}
                </p>
                {configurations.length === 0 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenCreateModal("UPI")}
                    className="bg-[#E50914] text-white"
                  >
                    Configure Primary UPI Rail
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterProvider("ALL");
                      setFilterStatus("ALL");
                      setFilterPrimaryOnly(false);
                    }}
                    className="border-[#2A3445] text-white"
                  >
                    Reset Filter Search
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredConfigurations.map((cfg) => {
                  const isSelectedInSimulator = cfg.id === activeSimulatorConfig?.id;

                  return (
                    <Card
                      key={cfg.id}
                      variant="elevated"
                      className={`p-5 space-y-4 transition-all border ${
                        cfg.isPrimary
                          ? "border-[#FBBF24]/40 bg-gradient-to-r from-[#111827] to-[#131b2e]"
                          : "border-[#2A3445] hover:border-[#3A4659]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              cfg.isPrimary
                                ? "bg-[#FBBF24]/10 border-[#FBBF24]/40 text-[#FBBF24]"
                                : "bg-[#111827] border-[#2A3445] text-[#94A3B8]"
                            }`}
                          >
                            {cfg.provider === "UPI" ? (
                              <QrCode className="h-5 w-5" />
                            ) : cfg.provider === "CASH_COUNTER" ? (
                              <Banknote className="h-5 w-5" />
                            ) : (
                              <CreditCard className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-white text-sm">{cfg.merchantDisplayName}</h4>
                              {getProviderBadge(cfg.provider)}
                              {cfg.isPrimary && (
                                <Badge variant="warning" size="sm" className="gap-1 font-bold">
                                  <Star className="h-3 w-3 fill-current" /> Primary Checkout Rail
                                </Badge>
                              )}
                              <Badge
                                variant={cfg.status === "ACTIVE" ? "success" : "secondary"}
                                size="sm"
                              >
                                {cfg.status}
                              </Badge>
                              {cfg.isCustomQr ? (
                                <Badge variant="info" size="sm" className="text-[10px] bg-sky-500/10 text-sky-400 border-sky-500/30">
                                  Custom QR
                                </Badge>
                              ) : (
                                <Badge variant="outline" size="sm" className="text-[10px] border-[#2A3445] text-[#94A3B8]">
                                  NPCI Derived
                                </Badge>
                              )}
                              <span className="text-[10px] font-mono text-[#64748B]">v{cfg.configVersion}</span>
                            </div>
                            <p className="text-xs text-[#94A3B8] mt-0.5">{cfg.description || cfg.merchantName}</p>
                          </div>
                        </div>

                        {/* Top action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSimulatorSelectedConfigId(cfg.id)}
                            className={`text-xs gap-1 ${
                              isSelectedInSimulator ? "text-[#FBBF24] font-bold" : "text-[#94A3B8]"
                            }`}
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview QR
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenEditModal(cfg)}
                            className="text-xs text-[#CBD5E1] hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </div>
                      </div>

                      {/* Rail Specifications Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#070B12] border border-[#2A3445]/60 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase block">Designated VPA / ID</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-white font-bold truncate">{cfg.upiId}</span>
                            <CopyButton value={cfg.upiId} className="h-6 px-1.5" />
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase block">Nodal Bank & Masked A/C</span>
                          <span className="text-[#CBD5E1] block mt-0.5 truncate">
                            {cfg.bankName} ({cfg.accountNumberMasked || "Masked"})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B] uppercase block">MCC & Settlement Velocity</span>
                          <span className="text-[#38BDF8] block mt-0.5">
                            MCC {cfg.merchantCode} • {cfg.settlementPeriod}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Controls (QR Upload / Replace / Delete + Primary + Status) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs border-t border-[#2A3445]/40">
                        {/* QR Management Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#2A3445] text-xs text-[#CBD5E1] hover:text-white hover:bg-[#111827] transition-colors">
                            <Upload className="h-3 w-3 text-[#38BDF8]" />
                            <span>{cfg.isCustomQr ? "Replace QR" : "Upload QR"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCustomQrUpload(cfg.id, e)}
                            />
                          </label>

                          {cfg.isCustomQr && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleResetToDynamicQr(cfg.id)}
                              className="text-xs text-amber-400 hover:text-amber-300 gap-1 h-7"
                              title="Delete custom QR and revert to dynamic NPCI QR"
                            >
                              <RotateCcw className="h-3 w-3" /> Reset to Dynamic QR
                            </Button>
                          )}
                        </div>

                        {/* Rail Status & Primary Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {!cfg.isPrimary && cfg.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleSetPrimary(cfg.id)}
                              className="border-[#FBBF24]/40 text-[#FBBF24] hover:bg-[#FBBF24]/10 gap-1 font-semibold h-7"
                            >
                              <Star className="h-3 w-3" /> Make Primary
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleToggleStatus(cfg)}
                            className="border-[#2A3445] text-xs text-[#94A3B8] h-7"
                          >
                            {cfg.status === "ACTIVE" ? "Deactivate" : "Activate Rail"}
                          </Button>

                          {!cfg.isPrimary && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDeleteConfig(cfg.id, cfg.merchantDisplayName)}
                              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1 h-7"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Live Dynamic QR & Checkout Simulator */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-6 space-y-5 text-center border-[#2A3445] relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FBBF24] flex items-center justify-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Live Dynamic QR Simulator
                </span>
                <h3 className="font-bold text-white text-base">NPCI Payload Synthesizer</h3>
                <p className="text-xs text-[#94A3B8]">
                  Test customer-facing dynamic intent generation for any configured rail in real time.
                </p>
              </div>

              {activeSimulatorConfig ? (
                <>
                  {/* QR Image Visual with Fallback */}
                  <div className="p-4 rounded-2xl bg-white w-56 h-56 mx-auto flex items-center justify-center shadow-2xl border-4 border-[#2A3445] transition-all">
                    {dynamicSimulatorPayload ? (
                      <img
                        src={dynamicSimulatorPayload.qrImageUrl}
                        alt="Dynamic UPI QR"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="h-24 w-24 text-slate-400 animate-pulse" />
                    )}
                  </div>

                  {/* Simulator Controls */}
                  <div className="space-y-3 text-left text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[#94A3B8] font-medium flex items-center justify-between">
                        <span>Selected Rail</span>
                        <span className="text-[10px] text-[#FBBF24] font-mono">
                          {activeSimulatorConfig.isPrimary ? "PRIMARY" : "SECONDARY"}
                        </span>
                      </label>
                      <select
                        value={activeSimulatorConfig.id}
                        onChange={(e) => setSimulatorSelectedConfigId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
                      >
                        {configurations.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.merchantDisplayName} ({c.provider}) {c.isPrimary ? "★ Primary" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[#94A3B8] font-medium">Test Amount (₹)</label>
                        <input
                          type="number"
                          value={simulatorAmount}
                          onChange={(e) => setSimulatorAmount(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono text-xs focus:outline-none focus:border-[#FBBF24]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#94A3B8] font-medium">Tx Note / Ref</label>
                        <input
                          type="text"
                          value={simulatorNote}
                          onChange={(e) => setSimulatorNote(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white text-xs focus:outline-none focus:border-[#FBBF24]"
                        />
                      </div>
                    </div>

                    {/* NPCI Decoded Intent String Box */}
                    <div className="p-3 rounded-xl bg-[#070B12] border border-[#2A3445] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B] font-mono uppercase">NPCI Intent URI Payload</span>
                        {dynamicSimulatorPayload && (
                          <CopyButton value={dynamicSimulatorPayload.upiIntentUri} label="Copy URI" className="h-5 px-1.5 text-[10px]" />
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-[#38BDF8] break-all leading-relaxed bg-black/40 p-2 rounded-lg border border-[#2A3445]/50">
                        {dynamicSimulatorPayload?.upiIntentUri || "No payload generated"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1 text-[11px] text-[#94A3B8]">
                      <div className="flex justify-between">
                        <span>Merchant Name:</span>
                        <strong className="text-white font-medium">{activeSimulatorConfig.merchantName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Merchant Code (MCC):</span>
                        <strong className="text-[#FBBF24] font-mono">{activeSimulatorConfig.merchantCode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Bank Rail:</span>
                        <span className="text-[#CBD5E1] font-mono">{activeSimulatorConfig.bankName}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-xs text-[#94A3B8]">No active configuration available for preview.</div>
              )}
            </Card>

            {/* Compliance Guarantee */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#FBBF24]" />
                <span>Zero Intermediary Escrow</span>
              </h4>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Customer payments initiated via BHIM UPI, GPay, PhonePe, or Paytm hit your bank account immediately. CineSphere OS operates purely as the ticketing orchestration layer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Supplementary Gateways */}
      {activeTab === "gateways" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Supplementary Card & Net Banking Gateways</h3>
              <p className="text-xs text-[#94A3B8]">
                Enable alternative payment rails for corporate cards, international tourists, and high-value VIP bookings.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCreateModal("RAZORPAY")}
              className="bg-[#E50914] text-white gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Gateway Config
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                provider: "RAZORPAY" as PaymentProvider,
                name: "Razorpay Enterprise Gateway",
                desc: "Unified processing for Credit Cards, Debit Cards, NetBanking (54 Banks), and Wallets.",
                badge: "Cards & NetBanking",
                mcc: "MCC 7832",
                fee: "1.9% + GST",
              },
              {
                provider: "PHONEPE" as PaymentProvider,
                name: "PhonePe PG Direct Intent",
                desc: "Direct deep-linking into PhonePe App with UPI AutoPay subscription support.",
                badge: "Deep-link Intent",
                mcc: "MCC 7832",
                fee: "0% UPI MDR",
              },
              {
                provider: "STRIPE" as PaymentProvider,
                name: "Stripe International Payments",
                desc: "Accept foreign Visa, Mastercard, Amex, Apple Pay, and Google Pay in 135 currencies.",
                badge: "Global Currencies",
                mcc: "MCC 7832",
                fee: "2.9% + ₹3",
              },
              {
                provider: "PAYTM" as PaymentProvider,
                name: "Paytm Business Solutions",
                desc: "Paytm Postpaid, Wallet, and Paytm Bank payment gateway channels.",
                badge: "Postpaid & Wallet",
                mcc: "MCC 7832",
                fee: "1.8% + GST",
              },
              {
                provider: "CASH_COUNTER" as PaymentProvider,
                name: "Physical Box Office Cash Counter",
                desc: "Cash drawer reconciliation for on-premise physical ticket counter sales.",
                badge: "Counter Cash Drawer",
                mcc: "Internal",
                fee: "0% (Physical Audit)",
              },
            ].map((gw) => {
              const existingGw = configurations.find((c) => c.provider === gw.provider);

              return (
                <Card key={gw.name} variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FBBF24] font-mono">{gw.badge}</span>
                      <Badge variant={existingGw?.status === "ACTIVE" ? "success" : "secondary"} size="sm">
                        {existingGw?.status || "Not Configured"}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white text-base">{gw.name}</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{gw.desc}</p>
                    <div className="pt-2 text-xs font-mono text-[#64748B] flex justify-between border-t border-[#2A3445]/50">
                      <span>Standard Rate: {gw.fee}</span>
                      <span>{gw.mcc}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {existingGw ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(existingGw)}
                          className="w-full border-[#2A3445] text-xs text-[#CBD5E1]"
                        >
                          Configure Keys
                        </Button>
                        <Button
                          variant={existingGw.status === "ACTIVE" ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleToggleStatus(existingGw)}
                          className="text-xs"
                        >
                          {existingGw.status === "ACTIVE" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenCreateModal(gw.provider)}
                        className="w-full bg-[#111827] hover:bg-[#1f2937] text-white border border-[#2A3445] text-xs"
                      >
                        Set Up {gw.name.split(" ")[0]}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Payment Configuration Audit Ledger */}
      {activeTab === "audit" && (
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
            <div>
              <h3 className="font-bold text-white text-base">Payment Rail State Transitions & Audit Trail</h3>
              <p className="text-xs text-[#94A3B8]">Immutable history of all configuration changes and primary rail designations.</p>
            </div>
            <Badge variant="outline" size="sm" className="border-purple-500/40 text-purple-400">
              {auditLogs.length} Events Logged
            </Badge>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">No audit log events recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <Badge variant="secondary" size="sm" className="text-[10px] font-mono">
                        {log.actorRole}
                      </Badge>
                    </div>
                    <p className="text-[#94A3B8]">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-mono text-[#FBBF24]">Actor: {log.actorId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Add / Edit Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0D131F] border border-[#2A3445] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[#2A3445] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {modalMode === "create" ? "Configure New Settlement Rail" : `Edit ${formDisplayName}`}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Rail for {profile.name} • {formProvider} Provider
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-[#111827] text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Provider Rail Type</label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value as PaymentProvider)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  >
                    <option value="UPI">Direct UPI VPA (NPCI Rail)</option>
                    <option value="RAZORPAY">Razorpay Multi-Rail Gateway</option>
                    <option value="PHONEPE">PhonePe PG Direct</option>
                    <option value="PAYTM">Paytm Business</option>
                    <option value="STRIPE">Stripe Global (International Cards)</option>
                    <option value="CASH_COUNTER">Physical Box Office Cash Counter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Merchant Display Name</label>
                  <input
                    type="text"
                    required
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="e.g. CineSphere Grand Box Office"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Business Legal Entity Name</label>
                  <input
                    type="text"
                    required
                    value={formBusinessName}
                    onChange={(e) => setFormBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Customer-Facing Merchant Name</label>
                  <input
                    type="text"
                    required
                    value={formMerchantName}
                    onChange={(e) => setFormMerchantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              {/* UPI ID / VPA field */}
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium flex items-center justify-between">
                  <span>Designated UPI ID / VPA</span>
                  {formProvider === "UPI" && (
                    <span className="text-[10px] text-[#64748B]">NPCI Syntax: handle@bank</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formUpiId}
                  onChange={(e) => setFormUpiId(e.target.value)}
                  placeholder="e.g. cinesphere.pune@icici"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono text-xs focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              {/* Masked Credentials for Gateways */}
              {formProvider !== "UPI" && formProvider !== "CASH_COUNTER" && (
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Gateway Key ID / Merchant ID (Masked)</label>
                  <input
                    type="text"
                    value={formKeyIdMasked}
                    onChange={(e) => setFormKeyIdMasked(e.target.value)}
                    placeholder="e.g. rzp_live_••••••••8114"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono text-xs focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              )}

              {/* Banking & Settlement Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Nodal Bank Name</label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Masked Account Number</label>
                  <input
                    type="text"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">IFSC Code</label>
                  <input
                    type="text"
                    value={formIfscCode}
                    onChange={(e) => setFormIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono uppercase focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Settlement Velocity</label>
                  <select
                    value={formSettlementPeriod}
                    onChange={(e) => setFormSettlementPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                  >
                    <option value="T+0 Instant">T+0 Instant Settlement (Real-Time Sweep)</option>
                    <option value="T+1 Daily">T+1 Daily Auto-Sweep (09:00 AM)</option>
                    <option value="Weekly">Weekly Consolidated Sweep</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Merchant Category Code (MCC)</label>
                  <input
                    type="text"
                    value={formMerchantCode}
                    onChange={(e) => setFormMerchantCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono focus:outline-none focus:border-[#FBBF24]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Description / Operational Notes</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Concessions Stand 2 Counter VPA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#FBBF24]"
                />
              </div>

              {/* Primary Rail Flag */}
              <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Designate as Primary Checkout Rail</span>
                  <span className="text-[11px] text-[#94A3B8]">
                    Customer booking sessions will default to this rail for payment collection.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#E50914]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#2A3445] text-[#94A3B8]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#E50914] text-white font-bold"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {modalMode === "create" ? "Save Payment Rail" : "Update Configuration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
