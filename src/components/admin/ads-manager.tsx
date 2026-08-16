"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { DbAdSlot, AdSlotType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DollarSign,
  Edit,
  Code2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  LayoutTemplate,
  PanelRight,
  Cpu,
  PanelBottom,
  BookOpen,
  Layers,
} from "lucide-react";

interface AdsManagerProps {
  initialSlots: DbAdSlot[];
}

const slotDescriptions: Record<
  string,
  { label: string; description: string; icon: React.ElementType; colorClass: string }
> = {
  header_banner: {
    label: "Header Banner",
    description: "Appears below the site navigation and above main page content.",
    icon: LayoutTemplate,
    colorClass: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  sidebar: {
    label: "Sidebar Slot",
    description: "Appears in sidebars on desktop layouts and tablet views.",
    icon: PanelRight,
    colorClass: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  in_tool_result: {
    label: "In-Tool Result Box",
    description: "Appears inside the generated result/output area of creator tools.",
    icon: Cpu,
    colorClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  footer: {
    label: "Footer Banner",
    description: "Appears above the site footer across all pages.",
    icon: PanelBottom,
    colorClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  blog_content: {
    label: "Between Blog Content",
    description: "Injected between paragraphs in blog guides and tutorial articles.",
    icon: BookOpen,
    colorClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
};

export function AdsManager({ initialSlots }: AdsManagerProps) {
  const [slots, setSlots] = React.useState<DbAdSlot[]>(initialSlots);
  const [editingSlot, setEditingSlot] = React.useState<DbAdSlot | null>(null);

  // Form State
  const [formType, setFormType] = React.useState<AdSlotType>("adsense");
  const [formAdCode, setFormAdCode] = React.useState("");
  const [formIsActive, setFormIsActive] = React.useState(false);

  // Status & Feedback
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  // Open edit modal
  const handleOpenEdit = (slot: DbAdSlot) => {
    setEditingSlot(slot);
    setFormType(slot.type || "adsense");
    setFormAdCode(slot.ad_code || "");
    setFormIsActive(slot.is_active);
    setFormError(null);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditingSlot(null);
    setFormError(null);
  };

  // Instant status toggle in table row
  const handleToggleStatus = async (slot: DbAdSlot) => {
    const nextStatus = !slot.is_active;
    const previousSlots = [...slots];

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slot.id
          ? { ...s, is_active: nextStatus, updated_at: new Date().toISOString() }
          : s
      )
    );

    setUpdatingId(slot.id);
    setNotification(null);

    try {
      const { error } = await supabase
        .from("ad_slots")
        .update({
          is_active: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", slot.id);

      if (error) {
        throw error;
      }

      setNotification({
        type: "success",
        message: `Slot "${slot.slot_name}" is now ${
          nextStatus ? "active" : "inactive"
        }.`,
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("[Supabase Ad Slot Status Toggle Error]", err);
      // Revert optimistic update
      setSlots(previousSlots);
      setNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update ad slot status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Save Modal Changes
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        type: formType,
        ad_code: formAdCode.trim() || null,
        is_active: formIsActive,
        updated_at: new Date().toISOString(),
      };

      console.log("[Supabase Ad Slot Save] Payload:", payload);

      const { data, error } = await supabase
        .from("ad_slots")
        .update(payload)
        .eq("id", editingSlot.id)
        .select();

      if (error) {
        console.error("[Supabase Ad Slot Update Error]", error);
        throw new Error(error.message || "Failed to update ad slot.");
      }

      console.log("[Supabase Ad Slot Update Success]", data);

      setSlots((prev) =>
        prev.map((s) =>
          s.id === editingSlot.id
            ? { ...s, ...payload, updated_at: new Date().toISOString() }
            : s
        )
      );

      setNotification({
        type: "success",
        message: `Ad slot "${editingSlot.slot_name}" updated successfully.`,
      });

      setEditingSlot(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      console.error("[Admin Ad Slot Save Caught Exception]", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm animate-in fade-in duration-200 ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 text-muted-foreground hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-[#12121c] border-[#252538] shadow-md">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-white">
                Monetization & Ad Slot Controls
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Toggle placements on/off and swap between Google AdSense auto-ads or direct sponsor HTML/scripts without code changes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ad Slots Table */}
      <div className="rounded-2xl border border-[#252538] bg-[#12121c] overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181826] text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-[#252538]">
              <tr>
                <th className="px-6 py-4">Slot Placement</th>
                <th className="px-6 py-4">Slot Identifier</th>
                <th className="px-6 py-4">Monetization Type</th>
                <th className="px-6 py-4">Code Configured</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2d]">
              {slots.map((slot) => {
                const isUpdating = updatingId === slot.id;
                const info = slotDescriptions[slot.slot_name] || {
                  label: slot.slot_name,
                  description: "Custom ad slot",
                  icon: Layers,
                  colorClass: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
                };
                const IconComponent = info.icon;
                const hasCode = Boolean(slot.ad_code && slot.ad_code.trim().length > 0);

                return (
                  <tr
                    key={slot.id}
                    className="hover:bg-[#1a1a28] transition-colors group"
                  >
                    {/* Placement Name & Description */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 ${info.colorClass}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {info.label}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slot Name Identifier */}
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                      <code className="bg-[#161624] px-2.5 py-1 rounded-lg border border-[#262638] text-slate-300">
                        {slot.slot_name}
                      </code>
                    </td>

                    {/* Monetization Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          slot.type === "sponsor"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                            : "bg-sky-500/15 border-sky-500/30 text-sky-300"
                        }`}
                      >
                        {slot.type === "sponsor" ? "Custom Sponsor" : "Google AdSense"}
                      </span>
                    </td>

                    {/* Code Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {hasCode ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium">
                          <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Configured</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Not set</span>
                      )}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleToggleStatus(slot)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none disabled:opacity-50 ${
                          slot.is_active
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-xs shadow-emerald-500/10"
                            : "bg-[#181824] border-[#2b2b3d] text-slate-400 hover:text-white"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                        ) : (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              slot.is_active
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-muted-foreground/40"
                            }`}
                          />
                        )}
                        <span className="capitalize">
                          {slot.is_active ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      {slot.updated_at
                        ? new Date(slot.updated_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(slot)}
                        className="h-8 px-3 gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30 rounded-xl transition-all"
                      >
                        <Edit className="h-3.5 w-3.5 text-white" />
                        <span>Edit Code</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#161624] border-t border-[#252538] flex items-center justify-between text-xs text-slate-400">
          <span>
            Total <strong className="text-white">{slots.length}</strong> monetization slot(s)
          </span>
        </div>
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#141422] border border-[#2e2e42] rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-[#252538] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Configure Ad Slot:{" "}
                    <span className="text-emerald-400">
                      {slotDescriptions[editingSlot.slot_name]?.label ||
                        editingSlot.slot_name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    slot_name: {editingSlot.slot_name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={handleCloseEdit}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Form Error */}
              {formError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-mono">{formError}</span>
                </div>
              )}

              {/* Slot Identifier & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Read-Only Slot Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Slot Identifier (Read-Only)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingSlot.slot_name}
                    className="w-full h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Monetization Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AdSlotType)}
                    className="w-full h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                  >
                    <option value="adsense">Google AdSense (Script / Unit)</option>
                    <option value="sponsor">Custom Sponsor Deal (HTML / Banner)</option>
                  </select>
                </div>
              </div>

              {/* Ad Script / HTML Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Ad Script or Sponsor HTML Code</span>
                  </label>
                </div>
                <textarea
                  rows={8}
                  value={formAdCode}
                  onChange={(e) => setFormAdCode(e.target.value)}
                  placeholder="<!-- Paste your AdSense snippet, iframe, or sponsor HTML here -->"
                  className="w-full rounded-xl border border-[#2b2b3d] bg-[#0e0e16] p-3 font-mono text-xs text-white placeholder:text-[#64748b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                />
              </div>

              {/* Caution Warning Note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Security Caution:</strong> Pasting untrusted scripts here can affect site security. Only use code from trusted sources (Google AdSense or verified sponsors).
                </p>
              </div>

              {/* Status Toggle */}
              <div className="pt-3 border-t border-[#252538] flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-white">
                    Activate Ad Slot
                  </label>
                  <p className="text-xs text-slate-400">
                    Render this ad placement on the public website.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={formIsActive}
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                    formIsActive ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30" : "bg-[#222234] border-[#313148]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#252538]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseEdit}
                  disabled={saving}
                  className="bg-[#1a1a2a] border-[#2b2b3d] text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="gap-1.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/25"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Save Ad Slot</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
