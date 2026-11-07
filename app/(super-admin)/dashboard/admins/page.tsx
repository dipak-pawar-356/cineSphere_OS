"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LATEST_ADMINS_DATA } from "@/lib/constants/super-admin";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  Key,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAdminsPage() {
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredAdmins = LATEST_ADMINS_DATA.filter((adm) => {
    if (roleFilter === "all") return true;
    return adm.role.toLowerCase().includes(roleFilter.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tenant Administrator Directory"
        subtitle="24 Cinema Chain Directors & 48 Assigned Hall Managers"
        description="Oversee multi-tenant access credentials, role-based delegation, Okta/SAML SSO federation, and circuit operator permissions."
        badge="Access Control"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <UserPlus className="h-4 w-4" /> Provision Admin (Disabled)
          </Button>
        }
      />

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Admins", val: "24 Operators", sub: "All Circuits Managed" },
          { label: "Hall Managers", val: "48 Floor Chiefs", sub: "Assigned" },
          { label: "2FA Enforcement", val: "100% Active", sub: "FIDO2 / TOTP" },
          { label: "Pending Approvals", val: "1 Operator", sub: "Needs Sign-off" },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{m.label}</div>
            <div className="text-xl font-extrabold font-mono text-white">{m.val}</div>
            <div className="text-[11px] text-emerald-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Roles (5)" },
            { id: "theatre", label: "Theatre Admins" },
            { id: "hall", label: "Hall Managers" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                roleFilter === r.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search admins by name or email... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">Administrator</th>
                <th className="py-3.5 px-5">Assigned Role</th>
                <th className="py-3.5 px-5">Cinema Circuit / Chain</th>
                <th className="py-3.5 px-5">Email Address</th>
                <th className="py-3.5 px-5">Last Authentication</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredAdmins.map((adm) => (
                <tr key={adm.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#FBBF24]" />
                    <span>{adm.name}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge variant={adm.role === "Super Admin" ? "warning" : "primary"} size="sm">
                      {adm.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-medium">{adm.circuit}</td>
                  <td className="py-3.5 px-5 font-mono text-[#CBD5E1]">{adm.email}</td>
                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono">{adm.lastLogin}</td>
                  <td className="py-3.5 px-5">
                    <Badge variant={adm.status === "Active" ? "success" : "warning"} size="sm">
                      {adm.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-5">
                    <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                      Permissions (Disabled)
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#111827]/60 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="font-mono text-[11px]">Showing {filteredAdmins.length} of 72 System Operators</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Previous</Button>
            <Button variant="outline" size="sm" disabled className="h-7 px-2 text-xs border-[#2A3445]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
