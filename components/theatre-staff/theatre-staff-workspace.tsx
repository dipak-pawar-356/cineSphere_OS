"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StaffStatusBadge, RoleStatusBadge } from "./staff-status-badge";
import type {
  TheatreStaffOrganizationBundle,
  StaffMemberWithRoles,
  TheatreRoleWithPermissions,
  StaffDepartmentRecord,
  RoleTemplateRecord,
} from "@/types/theatre-staff.types";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Building,
  Search,
  Filter,
  Plus,
  KeyRound,
  MoreVertical,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Shield,
  Eye,
} from "lucide-react";

interface TheatreStaffWorkspaceProps {
  bundle: TheatreStaffOrganizationBundle;
  theatreName: string;
  onOpenOnboardModal: () => void;
  onOpenCustomRoleModal: () => void;
  onOpenAssignRoleModal: (staff: StaffMemberWithRoles) => void;
  onOpenPermissionsModal: (role: TheatreRoleWithPermissions) => void;
  onOpenStaffDetail: (staff: StaffMemberWithRoles) => void;
}

export function TheatreStaffWorkspace({
  bundle,
  theatreName,
  onOpenOnboardModal,
  onOpenCustomRoleModal,
  onOpenAssignRoleModal,
  onOpenPermissionsModal,
  onOpenStaffDetail,
}: TheatreStaffWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"STAFF" | "ROLES" | "DEPARTMENTS" | "TEMPLATES">("STAFF");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtered staff list
  const filteredStaff = bundle.staff.filter((s) => {
    if (departmentFilter !== "ALL" && s.departmentId !== departmentFilter) return false;
    if (roleFilter !== "ALL" && !s.roles.some((r) => r.id === roleFilter)) return false;
    if (statusFilter !== "ALL" && s.employmentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = s.displayName.toLowerCase().includes(q);
      const matchCode = s.employeeCode.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchPhone = s.phone.toLowerCase().includes(q);
      const matchDesig = s.designation.toLowerCase().includes(q);
      return matchName || matchCode || matchEmail || matchPhone || matchDesig;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#2A3445] bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Dynamic Theatre Staff & RBAC Hierarchy</h2>
            <span className="rounded-full bg-[#F59E0B]/20 px-2.5 py-0.5 text-xs font-semibold text-[#F59E0B]">
              Tenant Isolated
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {theatreName} owns its independent staff roster, departments, custom roles, and fine-grained permissions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenCustomRoleModal}
            className="gap-2 border-[#2A3445] text-slate-200 hover:text-white"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Create Role
          </Button>
          <Button
            size="sm"
            onClick={onOpenOnboardModal}
            className="gap-2 bg-[#F59E0B] font-medium text-slate-950 hover:bg-[#F59E0B]/90"
          >
            <Plus className="h-4 w-4" />
            Onboard Crew
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Crew</p>
              <p className="text-xl font-bold text-white">{bundle.totalStaffCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Active Crew</p>
              <p className="text-xl font-bold text-white">{bundle.activeStaffCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Suspended</p>
              <p className="text-xl font-bold text-white">{bundle.suspendedStaffCount}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Departments</p>
              <p className="text-xl font-bold text-white">{bundle.departments.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-[#2A3445] bg-[#0F172A] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-[#F59E0B] border border-[#F59E0B]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Custom Roles</p>
              <p className="text-xl font-bold text-white">{bundle.roles.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A3445]">
        <button
          onClick={() => setActiveTab("STAFF")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "STAFF"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Staff Directory ({bundle.staff.length})
        </button>
        <button
          onClick={() => setActiveTab("ROLES")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "ROLES"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="h-4 w-4" />
          Theatre Roles & Permissions ({bundle.roles.length})
        </button>
        <button
          onClick={() => setActiveTab("DEPARTMENTS")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "DEPARTMENTS"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building className="h-4 w-4" />
          Departments ({bundle.departments.length})
        </button>
        <button
          onClick={() => setActiveTab("TEMPLATES")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "TEMPLATES"
              ? "border-[#F59E0B] text-[#F59E0B]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          Platform Catalog Templates ({bundle.templates.length})
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === "STAFF" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 rounded-lg border border-[#2A3445] bg-[#0F172A] p-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, code, phone, email, or designation..."
                className="w-full rounded-md border border-[#2A3445] bg-[#1E293B] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-md border border-[#2A3445] bg-[#1E293B] px-2.5 py-2 text-xs text-white focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {bundle.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-[#2A3445] bg-[#1E293B] px-2.5 py-2 text-xs text-white focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                {bundle.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-[#2A3445] bg-[#1E293B] px-2.5 py-2 text-xs text-white focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INVITED">Invited</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto rounded-lg border border-[#2A3445] bg-[#0F172A]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A3445] bg-[#1E293B]/60 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Crew Member</th>
                  <th className="px-4 py-3">Employee Code</th>
                  <th className="px-4 py-3">Role & Tier</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-slate-300">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No staff members match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-[#1E293B]/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
                            {staff.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={staff.avatarUrl}
                                alt={staff.displayName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              staff.firstName[0]
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{staff.displayName}</p>
                            <p className="text-[11px] text-slate-400">{staff.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {staff.employeeCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {staff.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                staff.primaryRole?.id === r.id
                                  ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {staff.department?.name || "Operations"}
                      </td>
                      <td className="px-4 py-3">
                        <StaffStatusBadge status={staff.employmentStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-[#1E293B] px-2 py-0.5 text-[11px] font-mono text-emerald-400">
                          {staff.permissions.length} capabilities
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenAssignRoleModal(staff)}
                            className="h-7 px-2 text-[11px] text-slate-300 hover:text-white"
                          >
                            <KeyRound className="h-3.5 w-3.5 mr-1 text-[#F59E0B]" />
                            Role
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenStaffDetail(staff)}
                            className="h-7 px-2 text-[11px] text-slate-300 hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: THEATRE ROLES & PERMISSIONS */}
      {activeTab === "ROLES" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.roles.map((role) => (
            <Card key={role.id} className="border-[#2A3445] bg-[#0F172A] p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{role.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{role.roleCode}</p>
                  </div>
                  <RoleStatusBadge status={role.status} isCustom={role.isCustom} size="sm" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {role.description || "Operational role managing assigned cinema tasks."}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3445]/60">
                  <span className="text-slate-400">Hierarchy Level:</span>
                  <span className="font-semibold text-white">Tier {role.hierarchyLevel}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Assigned Crew:</span>
                  <span className="font-semibold text-[#F59E0B]">{role.activeStaffCount || 0} crew members</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Granted Privileges:</span>
                  <span className="font-semibold text-emerald-400">{role.permissions.length} capabilities</span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-[#2A3445]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPermissionsModal(role)}
                  className="w-full gap-2 text-xs border-[#2A3445] text-slate-200 hover:text-white"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#F59E0B]" />
                  Configure Privileges ({role.permissions.length})
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === "DEPARTMENTS" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.departments.map((dept) => {
            const crewInDept = bundle.staff.filter((s) => s.departmentId === dept.id).length;
            return (
              <Card key={dept.id} className="border-[#2A3445] bg-[#0F172A] p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{dept.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{dept.code}</p>
                  </div>
                  <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    {dept.departmentType}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {dept.description || "Operational unit supporting theatre services."}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3445]/60">
                  <span className="text-slate-400">Total Staff:</span>
                  <span className="font-semibold text-white">{crewInDept} Assigned</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 4: PLATFORM TEMPLATES */}
      {activeTab === "TEMPLATES" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.templates.map((tmpl) => (
            <Card key={tmpl.id} className="border-[#2A3445] bg-[#0F172A] p-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{tmpl.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{tmpl.templateCode}</p>
                  </div>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tmpl.description}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3445]/60">
                  <span className="text-slate-400">Suggested Dept:</span>
                  <span className="font-medium text-slate-300">{tmpl.suggestedDepartment}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Standard Permissions:</span>
                  <span className="font-medium text-[#F59E0B]">{tmpl.defaultPermissions.length} rules</span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-[#2A3445]">
                <Button
                  size="sm"
                  onClick={onOpenCustomRoleModal}
                  className="w-full gap-2 text-xs bg-[#1E293B] text-slate-200 hover:text-white border border-[#2A3445]"
                >
                  <Layers className="h-3.5 w-3.5 text-[#F59E0B]" />
                  Instantiate into Theatre Role
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
