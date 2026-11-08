"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Users,
  ShieldCheck,
  UserCheck,
  User,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  Calendar,
  Lock,
  Unlock,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "HALL_MANAGER" | "STAFF" | "CUSTOMER";
  theatreName: string | null;
  status: "Active" | "Suspended" | "Pending Verification";
  lastActive: string;
  registeredDate: string;
}

const SEED_USERS: UserItem[] = [
  { id: "usr-001", name: "Super Admin Root", email: "admin@cinesphere.com", phone: "+91 98220 01100", role: "SUPER_ADMIN", theatreName: null, status: "Active", lastActive: "Just now", registeredDate: "2026-01-01" },
  { id: "usr-002", name: "Rajesh Sharma", email: "rajesh.sharma@cinesphere.com", phone: "+91 98220 12345", role: "THEATRE_ADMIN", theatreName: "PVR Phoenix Marketcity, Pune", status: "Active", lastActive: "10 mins ago", registeredDate: "2026-02-15" },
  { id: "usr-003", name: "Anil Deshmukh", email: "anil.d@pvrcinemas.com", phone: "+91 98220 54321", role: "HALL_MANAGER", theatreName: "PVR Phoenix Marketcity, Pune", status: "Active", lastActive: "25 mins ago", registeredDate: "2026-03-01" },
  { id: "usr-004", name: "Pooja Varma", email: "pooja.v@pvrcinemas.com", phone: "+91 98220 99887", role: "STAFF", theatreName: "PVR Phoenix Marketcity, Pune", status: "Active", lastActive: "1 hour ago", registeredDate: "2026-04-10" },
  { id: "usr-005", name: "Aarav Sharma", email: "aarav.s@gmail.com", phone: "+91 99220 11223", role: "CUSTOMER", theatreName: null, status: "Active", lastActive: "3 hours ago", registeredDate: "2026-05-20" },
  { id: "usr-006", name: "Vikram Malhotra", email: "vikram.m@wavecinemas.in", phone: "+91 98110 33445", role: "THEATRE_ADMIN", theatreName: "CineWave Diamond City, Surat", status: "Pending Verification", lastActive: "1 day ago", registeredDate: "2026-11-08" },
  { id: "usr-007", name: "Sunita Kapoor", email: "sunita.k@gmail.com", phone: "+91 98770 44556", role: "CUSTOMER", theatreName: null, status: "Suspended", lastActive: "5 days ago", registeredDate: "2026-06-12" },
];

export default function SuperAdminUsersPage() {
  const [userList, setUserList] = useState<UserItem[]>(SEED_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mN = u.name.toLowerCase().includes(q);
        const mE = u.email.toLowerCase().includes(q);
        const mTh = u.theatreName ? u.theatreName.toLowerCase().includes(q) : false;
        if (!mN && !mE && !mTh) return false;
      }
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (filterStatus !== "all" && u.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      return true;
    });
  }, [userList, searchQuery, filterRole, filterStatus]);

  const handleToggleSuspend = (id: string) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" }
          : u
      )
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Unified Cross-Tier User & Role Governance"
        subtitle="Access Control Across Super Admins, Cinema Operators, Hall Managers, Field Staff & Patrons"
        badge={`${userList.length} Registered Accounts`}
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
            <UserPlus className="h-3.5 w-3.5" /> Invite Operator
          </Button>
        }
      />

      {/* Role Breakdown Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Super Admins", count: userList.filter((u) => u.role === "SUPER_ADMIN").length, role: "SUPER_ADMIN", color: "text-[#FBBF24]" },
          { label: "Theatre Admins", count: userList.filter((u) => u.role === "THEATRE_ADMIN").length, role: "THEATRE_ADMIN", color: "text-indigo-400" },
          { label: "Hall Managers", count: userList.filter((u) => u.role === "HALL_MANAGER").length, role: "HALL_MANAGER", color: "text-cyan-400" },
          { label: "Field Staff", count: userList.filter((u) => u.role === "STAFF").length, role: "STAFF", color: "text-emerald-400" },
          { label: "Guests / Patrons", count: userList.filter((u) => u.role === "CUSTOMER").length, role: "CUSTOMER", color: "text-purple-400" },
        ].map((item) => (
          <div
            key={item.role}
            onClick={() => setFilterRole(filterRole === item.role ? "all" : item.role)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              filterRole === item.role ? "bg-[#1E293B] border-[#FBBF24]" : "bg-[#161F2E] border-[#2A3445] hover:border-[#64748B]"
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">{item.label}</div>
            <div className={`text-xl font-black font-mono mt-0.5 ${item.color}`}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {["all", "active", "suspended", "pending verification"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                filterStatus === st ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, theatre..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-5">User Profile</th>
                <th className="py-3.5 px-5">Role Tier</th>
                <th className="py-3.5 px-5">Assigned Theatre / Scope</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Last Activity</th>
                <th className="py-3.5 px-5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-bold text-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono">{u.id}</div>
                  </td>

                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        u.role === "SUPER_ADMIN"
                          ? "warning"
                          : u.role === "THEATRE_ADMIN"
                          ? "primary"
                          : u.role === "HALL_MANAGER"
                          ? "info"
                          : u.role === "STAFF"
                          ? "success"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-5">
                    {u.theatreName ? (
                      <span className="text-white font-medium">{u.theatreName}</span>
                    ) : (
                      <span className="text-[#64748B] italic">Platform-wide Global Scope</span>
                    )}
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="font-mono text-white text-[11px]">{u.email}</div>
                    <div className="text-[10px] text-[#94A3B8]">{u.phone}</div>
                  </td>

                  <td className="py-3.5 px-5">
                    <Badge
                      variant={
                        u.status === "Active"
                          ? "success"
                          : u.status === "Pending Verification"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {u.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-5 text-[#94A3B8] font-mono text-[11px]">
                    {u.lastActive}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {u.role !== "SUPER_ADMIN" && (
                      <Button
                        onClick={() => handleToggleSuspend(u.id)}
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-xs border-[#2A3445] gap-1 ${
                          u.status === "Active"
                            ? "text-rose-400 hover:bg-rose-500/10"
                            : "text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {u.status === "Active" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

