"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Wrench, ArrowRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ToolItem } from "./homepage-hero-and-grid";

interface ToolSuggestion {
  slug: string;
  title: string;
  short_description?: string | null;
}

interface HeroSearchProps {
  fallbackTools?: ToolItem[];
}

export function HeroSearch({ fallbackTools = [] }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<ToolSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced live suggestion fetch from Supabase
  React.useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(-1);

    const debounceTimer = setTimeout(async () => {
      let results: ToolSuggestion[] = [];

      try {
        const supabase = createClient();
        if (supabase) {
          const { data, error } = await supabase
            .from("tools")
            .select("slug, title, short_description, status")
            .eq("status", "active")
            .ilike("title", `%${trimmedQuery}%`)
            .limit(6);

          if (!error && data && data.length > 0) {
            results = data.map((t) => ({
              slug: t.slug,
              title: t.title,
              short_description: t.short_description,
            }));
          }
        }
      } catch (err) {
        console.warn("[HeroSearch] Supabase search failed, falling back to local list:", err);
      }

      // Fallback to client-provided fallbackTools if Supabase query is empty or offline
      if (results.length === 0 && fallbackTools.length > 0) {
        const q = trimmedQuery.toLowerCase();
        results = fallbackTools
          .filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              (t.short_description && t.short_description.toLowerCase().includes(q))
          )
          .slice(0, 6)
          .map((t) => ({
            slug: t.slug,
            title: t.title,
            short_description: t.short_description,
          }));
      }

      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(true);
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query, fallbackTools]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && query.trim()) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex].slug);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0].slug);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-4.5 pointer-events-none text-muted-foreground">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search tools... (e.g. thumbnail downloader)"
          aria-label="Search YouTube tools"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={isOpen && suggestions.length > 0 ? "search-suggestions-list" : undefined}
          className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 text-white placeholder:text-white/50 text-base sm:text-lg focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.12] shadow-xl shadow-black/25 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Live Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="search-suggestions-list"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[#121218]/95 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden text-left p-1.5 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {suggestions.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-white/50 tracking-wider uppercase">
                Suggested Tools
              </div>
              {suggestions.map((tool, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={tool.slug}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(tool.slug)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isSelected
                        ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                        : "hover:bg-white/[0.06] text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white/[0.08] text-primary group-hover:bg-primary/20"
                        }`}
                      >
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {tool.title}
                        </div>
                        {tool.short_description && (
                          <div className="text-xs text-white/60 truncate">
                            {tool.short_description}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-white/60 space-y-1">
              <p className="font-medium text-white">No tools found</p>
              <p className="text-xs">
                No matching tools for &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
