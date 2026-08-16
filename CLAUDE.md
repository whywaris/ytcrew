# CLAUDE.md — YT Crew Project Context

This file gives Claude Code persistent context about the YT Crew project. Read this before making any changes.

## Project Overview

YT Crew is a website offering 86+ free YouTube creator tools (competitor: tubepilot.ai). The site also has a blog and an admin panel. Core priorities: clean, bug-free code, fast load times, mobile-first, strong SEO.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Hosting**: Cloudflare Pages (via `@cloudflare/next-on-pages` or OpenNext adapter) — chosen over Vercel to avoid unpredictable usage-based cost spikes
- **Database/Auth**: Supabase (Postgres + Auth) — powers admin panel, blog, tool content management
- **Storage**: Cloudflare R2 (images, uploads)
- **Caching/Rate limiting**: Upstash Redis — required for YouTube Data API tools to avoid quota exhaustion
- **AI**: OpenAI or Claude API for content-generation tools (titles, descriptions, scripts, etc.)
- **Payments** (later phase): Stripe for "Remove Ads" paid plan

## Design System

- **Mode**: Dark mode is default, light mode available via toggle. Use CSS variables so both themes share the same components.
- **Colors**:
  - Primary: Deep Indigo/Violet `#6366F1` (or `#4F46E5`)
  - Accent: `#FF3B30` — used sparingly, only for CTA buttons/highlights, not site-wide
  - Dark background: `#0F0F13`
  - Dark text: `#F5F5F7`
  - Light mode: standard light background with dark text, same primary/accent colors
  - Success: `#22C55E` / Error: `#EF4444`
- **Fonts**:
  - Headings: Inter or Space Grotesk
  - Body: Inter
  - Mono (if needed): JetBrains Mono
- Keep spacing, buttons, cards, and inputs consistent — build a shared component library first, don't restyle per page.

## Site Structure

### Public Pages
- Homepage: Header (sticky, logo + search + nav + auth + theme toggle) → Hero (headline + search) → Popular Tools Grid → Category Browse → All Tools link/grid → Why YT Crew (USPs) → Blog Preview → Newsletter Signup → Footer
- Tools listing page (`/tools`): filterable/searchable grid, grouped by category
- **Tool page template** (reusable for all 86 tools): Breadcrumb → Tool Header (H1 + short desc) → Tool Interface (input/output area, above the fold) → Trust bar (optional) → How to Use (numbered steps) → About This Tool (SEO copy, 2-3 paragraphs) → FAQ (with FAQ schema) → Related Tools. **No CTA/ad section directly on tool pages** — ads live in the Ads Manager slots, not hardcoded into this template.
- Blog listing + single post pages
- Legal pages: Privacy Policy, Terms of Service, About, Contact (required before AdSense application)

### Admin Panel (`/admin`, Supabase Auth protected)
Keep this lean — only build what's listed below, don't add extra sections speculatively:
1. **Overview/Dashboard** — tools count, blog posts count, quick stats
2. **Manage Tools** — table list (name, category, status) → edit page per tool: title, description, how-to-use steps, FAQ, SEO meta title/description, enable/disable toggle
3. **Manage Blog** — list (title, status, date) → create/edit (rich text editor, featured image, category, SEO meta) → delete
4. **Categories Manager** — add/edit/delete tool categories
5. **Announcement Bar** — editable text, optional link, on/off toggle, shown site-wide
6. **Ads Manager** — per ad slot (Header Banner, Sidebar, In-Tool Result Area, Footer, Between Blog Content): slot name, ad code (AdSense or custom sponsor script), type field (`adsense` | `sponsor`), on/off toggle. This lets sponsor deals override AdSense per slot without code changes.

Do NOT build: user accounts management, global SEO settings page, media library, site settings page — explicitly descoped for now.

## Tool Categories (build in this order — do not attempt all 86 tools in one pass)

1. **Phase A — Client-side, no backend**: Banner Resizer, Thumbnail Resizer, Font Generator, QR Code Generator, Channel Name Generator, Username Generator, Hashtag Generator, Timestamp Link Generator, Subscribe Link Generator, Link Shortener, etc.
2. **Phase B — AI-based (OpenAI/Claude API + rate limiting)**: Title/Description Generator, SEO Title Generator, Video Ideas Generator, Script Generator, Clickbait Title Generator, etc.
3. **Phase C — YouTube Data API based (needs Redis caching, ~1hr TTL)**: Channel Audit, Video Info, Trending Videos, Rank Checker, SEO Score Checker, Subs Live Counter, etc.
4. **Phase D — Scraping/download tools (legal grey area, build last, carefully)**: Video Downloader, Subtitle Downloader, Thumbnail Downloader, Deleted Video Finder, Dislike Viewer. Prefer legitimate third-party APIs over direct scraping where possible.

## Coding Rules for Claude Code

- Build **one tool at a time**, test it, then move to the next. Never attempt to scaffold all 86 tools in a single session/prompt.
- Reuse the Tool Page Template component for every tool — do not create one-off layouts per tool.
- Every code file must include comments explaining non-obvious logic.
- All secrets (YouTube API key, OpenAI/Claude API key, Supabase service role key) must be server-side only — never prefix with `NEXT_PUBLIC_`, never call these APIs directly from client components.
- All YouTube Data API calls must go through a caching layer (Upstash Redis) to protect the daily quota.
- Restrict YouTube API keys in Google Cloud Console via HTTP referrer restrictions.
- Mobile responsiveness is mandatory for every page, especially tool interfaces (inputs, upload buttons, output/copy buttons).
- Every tool page needs unique SEO meta title/description and should support FAQ schema markup.
- Prefer small, incremental commits/branches per feature over large multi-feature changes.

## Monetization Context (for reference, not to be hardcoded into UI logic)

Google AdSense, Ezoic/Mediavine, Remove Ads (paid, via Stripe), Affiliate Marketing, Email List, Digital Products, Sponsor/Featured Placements (via Ads Manager), Paid Services (Subscribers, Watchtime, Channel Audit/Management).

AdSense application should happen only after: 15-20 tools live, 5-10 blog posts published, legal pages in place. Do not apply during early build phase.

## Status of Planning Docs

- [x] UI/UX Design (colors, fonts, homepage wireframe, tool page wireframe, admin panel scope) — done, reflected above
- [ ] PRD
- [ ] TRD
- [ ] Appflow
- [ ] Backend Schema
- [ ] Implementation Plan
- [ ] SEO strategy doc

This file will be updated as remaining planning docs are completed. Do not start actual site build until the user explicitly says "OK, start building."
