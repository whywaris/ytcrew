"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DbTool, DbCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Wrench,
  Edit,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2,
} from "lucide-react";

interface ToolsListTableProps {
  initialTools: DbTool[];
  categories: DbCategory[];
}

export function ToolsListTable({ initialTools, categories }: ToolsListTableProps) {
  const [tools, setTools] = React.useState<DbTool[]>(initialTools);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [notification, setNotification] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const supabase = createClient();

  // Filter tools based on search and filters
  const filteredTools = React.useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ? true : tool.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ? true : tool.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [tools, searchQuery, typeFilter, statusFilter]);

  // Statistics
  const activeCount = tools.filter((t) => t.status === "active").length;
  const inactiveCount = tools.length - activeCount;

  // Handle instant status toggle with optimistic update
  const handleToggleStatus = async (tool: DbTool) => {
    const nextStatus = tool.status === "active" ? "inactive" : "active";
    const previousTools = [...tools];

    // 1. Optimistic UI update
    setTools((prev) =>
      prev.map((t) =>
        t.id === tool.id
          ? { ...t, status: nextStatus, updated_at: new Date().toISOString() }
          : t
      )
    );

    setUpdatingId(tool.id);
    setNotification(null);

    try {
      // 2. Persist in Supabase
      const { error } = await supabase
        .from("tools")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tool.id);

      if (error) {
        throw error;
      }

      setNotification({
        type: "success",
        message: `Status updated for "${tool.title}" to ${nextStatus}.`,
      });

      // Auto-hide success toast after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err: unknown) {
      console.error("Failed to update status in Supabase:", err);
      // Revert optimistic update
      setTools(previousTools);
      setNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update tool status in database.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getCategoryName = (tool: DbTool): string => {
    if (tool.categories?.name) {
      return tool.categories.name;
    }
    if (tool.category_id) {
      const found = categories.find((c) => c.id === tool.category_id);
      if (found) return found.name;
    }
    return "Unassigned";
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "logic":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>Logic (Client)</span>
          </span>
        );
      case "youtube_api":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-red-500/15 text-red-300 border border-red-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span>YouTube API</span>
          </span>
        );
      case "open_api":
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span>AI Provider</span>
          </span>
        );
      default:
        return (
          <Badge variant="outline" className="font-mono text-[11px]">
            {type}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Metric Quick Stats Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141420] border border-[#252538] text-xs">
          <span className="text-muted-foreground">Total Catalog:</span>
          <span className="font-bold text-white">{tools.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium">Active & Live:</span>
          <span className="font-bold text-emerald-300">{activeCount}</span>
        </div>
        {inactiveCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium">Draft / Inactive:</span>
            <span className="font-bold text-amber-300">{inactiveCount}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#141420] p-4 rounded-2xl border border-[#252538]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4 text-cyan-400/80" />
          </div>
          <Input
            placeholder="Search tools by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0e0e16] border-[#2b2b3d] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 text-sm"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-cyan-400 hidden sm:inline-block" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
            >
              <option value="all">All Types</option>
              <option value="logic">Logic (Client)</option>
              <option value="youtube_api">YouTube API</option>
              <option value="open_api">AI Provider</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-[#2b2b3d] bg-[#0e0e16] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Tools Table Container */}
      <div className="rounded-2xl border border-[#252538] bg-[#12121c] overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#181826] text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-[#252538]">
              <tr>
                <th className="px-6 py-4">Tool Details</th>
                <th className="px-6 py-4">Public URL</th>
                <th className="px-6 py-4">Engine Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Live Status</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2d]">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => {
                  const isUpdating = updatingId === tool.id;
                  const isActive = tool.status === "active";

                  return (
                    <tr
                      key={tool.id}
                      className="hover:bg-[#1a1a28] transition-colors group"
                    >
                      {/* Title & Short Description */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                          <span>{tool.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {tool.short_description}
                        </p>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/${tool.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-cyan-400 bg-[#161624] px-2.5 py-1 rounded-lg border border-[#262638] transition-all group/link"
                          title="View live tool page"
                        >
                          <span>/{tool.slug}</span>
                          <ExternalLink className="h-3 w-3 opacity-50 group-hover/link:opacity-100" />
                        </Link>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(tool.type)}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-[#181827] border border-[#27273a] text-slate-300 font-medium">
                          {getCategoryName(tool)}
                        </span>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(tool)}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none disabled:opacity-50 ${
                            isActive
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-xs shadow-emerald-500/10"
                              : "bg-[#181824] border-[#2b2b3d] text-slate-400 hover:text-white"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                          ) : (
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isActive
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-muted-foreground/50"
                              }`}
                            />
                          )}
                          <span className="capitalize">{tool.status}</span>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {tool.updated_at
                          ? new Date(tool.updated_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link href={`/admin/tools/${tool.id}/edit`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 px-3 gap-1.5 text-xs bg-[#1a1a2a] hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/30 border border-[#2b2b3f] transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Wrench className="h-8 w-8 text-cyan-400/40" />
                      <p className="font-bold text-white">No tools found</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchQuery
                          ? `No tools matched your search query "${searchQuery}".`
                          : "No tools are currently registered in Supabase."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3.5 bg-[#161624] border-t border-[#252538] flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredTools.length}</strong> of{" "}
            <strong className="text-white">{tools.length}</strong> tool(s)
          </span>
        </div>
      </div>
    </div>
  );
}
