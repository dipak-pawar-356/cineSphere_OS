"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type ManagedStaff } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  Plus,
  Eye,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  X,
  Phone,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TheatreStaffPage() {
  const { profile, staff, halls, addStaff, toggleStaffStatus, updateStaffRole } = useTheatreStore();

  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // New staff form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("Floor Supervisor");
  const [role, setRole] = useState<ManagedStaff["role"]>("Floor Staff");
  const [assignedHall, setAssignedHall] = useState(halls[0]?.name || "All Auditoriums");
  const [shift, setShift] = useState<ManagedStaff["shift"]>("Morning (08:00 - 16:30)");

  const filteredStaff = staff
    .filter((st) => (roleFilter === "All" ? true : st.role === roleFilter))
    .filter(
      (st) =>
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const codeNum = Math.floor(100 + Math.random() * 900);
    const empCode = `EMP-${profile.code.split("-")[1] || "PUN"}-${codeNum}`;

    addStaff({
      employeeCode: empCode,
      name: name.trim(),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
      designation: designation.trim(),
      role,
      assignedHall,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@${profile.slug}.com`,
      phone: phone.trim() || "+91 98230 00000",
      joiningDate: new Date().toISOString().split("T")[0],
      shift,
      status: "On Duty",
    });

    setAddModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
    setFeedbackNotice(`Crew member "${name}" onboarded with code ${empCode}.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleStatusToggle = (id: string, staffName: string) => {
    toggleStaffStatus(id);
    setFeedbackNotice(`Toggled shift status for "${staffName}".`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Field Staff Roster & Operational Shifts"
        subtitle={`${profile.name} • ${staff.length} Assigned Team Members`}
        description="Monitor staff duty allocations across auditoriums, verify active shift sign-ins, reassign roles, and inspect access privilege credentials."
        badge={`${staff.filter((s) => s.status === "On Duty").length} On Duty`}
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.STAFF_MANAGERS}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-white">
                <ShieldCheck className="h-4 w-4 text-[#FBBF24]" /> Hall Managers
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="gap-1.5 font-bold bg-[#E50914] text-white hover:bg-[#b80710]"
            >
              <Plus className="h-4 w-4" /> Add Crew Member
            </Button>
          </div>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Role-Based Permissions Notice */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 flex items-center justify-center text-[#FBBF24] shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Fine-Grained Role Scoping</h3>
            <p className="text-xs text-[#94A3B8]">
              Hall Managers possess elevated access to configure projection sound profiles in Phase 2 Part 5. Floor Staff are limited to turnstile QR scanning.
            </p>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-[#2A3445] text-[#94A3B8] shrink-0">
          RBAC Matrix Enforced
        </Badge>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Hall Manager", "Projectionist", "Floor Staff", "Ticket Counter Staff"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === tab
                  ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
                  : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search employee or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>
      </div>

      {/* Staff Roster Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Designation & Role</th>
                <th className="py-3.5 px-4">Assigned Hall / Post</th>
                <th className="py-3.5 px-4">Current Shift</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Duty Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {filteredStaff.map((st) => (
                <tr key={st.id} className="hover:bg-[#161F2E]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{st.name}</span>
                        <span className="font-mono text-[10px] text-[#64748B]">{st.employeeCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{st.designation}</span>
                    <span className="text-[10px] text-[#FBBF24] font-medium">{st.role}</span>
                  </td>
                  <td className="py-3 px-4 font-medium">{st.assignedHall}</td>
                  <td className="py-3 px-4 font-mono text-xs">{st.shift}</td>
                  <td className="py-3 px-4">
                    <div className="text-white text-xs">{st.phone}</div>
                    <div className="text-[10px] text-[#64748B]">{st.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={st.status === "On Duty" ? "success" : st.status === "On Leave" ? "warning" : "secondary"}
                      size="sm"
                      dot
                    >
                      {st.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleStatusToggle(st.id, st.name)}
                      className="border-[#2A3445] text-[#CBD5E1] hover:text-white"
                    >
                      Toggle Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#E50914]" />
                <h3 className="text-lg font-bold text-white">Onboard Crew Member</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="Chief Projectionist"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Assigned Operational Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Hall Manager">Hall Manager</option>
                    <option value="Projectionist">Projectionist</option>
                    <option value="Floor Staff">Floor Staff / Usher</option>
                    <option value="Ticket Counter Staff">Ticket Counter Staff</option>
                    <option value="Food Court Staff">Food Court Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Assigned Auditorium</label>
                  <select
                    value={assignedHall}
                    onChange={(e) => setAssignedHall(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="All Auditoriums">All Auditoriums / Concierge</option>
                    {halls.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Shift Assignment</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Morning (08:00 - 16:30)">Morning (08:00 - 16:30)</option>
                    <option value="Evening (16:00 - 00:30)">Evening (16:00 - 00:30)</option>
                    <option value="Night Shift">Night Shift (00:00 - 08:30)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98220 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Work Email</label>
                  <input
                    type="email"
                    placeholder="name@cinesphere.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddModalOpen(false)}
                  className="border-[#2A3445] text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#E50914] text-white font-bold"
                >
                  Onboard Crew Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
