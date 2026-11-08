"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type PlatformAnnouncement } from "@/store/platform-store";
import {
  Megaphone,
  Plus,
  Bell,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminAnnouncementsPage() {
  const { announcements, addAnnouncement, deleteAnnouncement } = usePlatformStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pushSentNotice, setPushSentNotice] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PlatformAnnouncement["priority"]>("Normal");
  const [audience, setAudience] = useState<PlatformAnnouncement["audience"]>("All Users");
  const [expiryDate, setExpiryDate] = useState("2026-11-30");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addAnnouncement({
      title,
      description,
      priority,
      audience,
      publishDate: new Date().toISOString().slice(0, 10),
      expiryDate,
      status: "Active",
      author: "Super Admin HQ",
    });

    setTitle("");
    setDescription("");
    setAddModalOpen(false);
  };

  const handleSimulatePush = (title: string, audience: string) => {
    setPushSentNotice(`Dispatched push notification broadcast "${title}" to ${audience}.`);
    setTimeout(() => setPushSentNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Announcements & Broadcast Command"
        subtitle="Publish Targeted Notices, Compliance Bulletins & Emergency Broadcasts Across Circuits"
        badge={`${announcements.length} Active Broadcasts`}
        badgeVariant="primary"
        actions={
          <Button
            onClick={() => setAddModalOpen(true)}
            variant="primary"
            size="sm"
            className="gap-2 text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        }
      />

      {pushSentNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{pushSentNotice}</span>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((anc) => (
          <div
            key={anc.id}
            className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#64748B] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    anc.priority === "Urgent"
                      ? "danger"
                      : anc.priority === "High"
                      ? "warning"
                      : "secondary"
                  }
                  size="sm"
                >
                  {anc.priority}
                </Badge>
                <h3 className="text-base font-bold text-white">{anc.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSimulatePush(anc.title, anc.audience)}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs border-[#2A3445] gap-1 hover:text-[#FBBF24]"
                >
                  <Send className="h-3 w-3" /> Push Notification
                </Button>
                <Button
                  onClick={() => deleteAnnouncement(anc.id)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[#64748B] hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed max-w-4xl">{anc.description}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[#94A3B8] font-mono border-t border-[#2A3445]/60">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>Target: <strong className="text-white">{anc.audience}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Published: {anc.publishDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Expires: {anc.expiryDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>By: {anc.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Announcement Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-[#FBBF24]" /> Create Broadcast Announcement
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Critical DCP Server Encryption Key Rotation"
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  >
                    <option value="Normal">Normal Information</option>
                    <option value="High">High Operational Priority</option>
                    <option value="Urgent">Urgent / Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94A3B8] font-bold mb-1">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                  >
                    <option value="All Users">All Platform Users</option>
                    <option value="Theatre Admins">Theatre Admins Only</option>
                    <option value="Staff Members">Field Staff Only</option>
                    <option value="Customers">Public Patrons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Full Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed instructions or bulletin copy..."
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] font-bold mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3445]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
                className="border-[#2A3445] text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs font-bold">
                Publish Announcement
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

