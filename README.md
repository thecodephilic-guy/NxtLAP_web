# NxtLAP — Motorsport Events & News Platform

A Next.js web application for tracking upcoming motorsport events across multiple racing series, reading original blog content, and staying up to date with the latest motorsport news.

**Live at:** [nxtlap.com](https://www.nxtlap.com)

---

## Tech Stack

| Layer         | Technology                                                  |
| ------------- | ----------------------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org) (App Router, Turbopack)   |
| UI            | [React 19](https://react.dev), [shadcn/ui](https://ui.shadcn.com) |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com)                   |
| Language      | TypeScript 5                                                |
| Content       | MDX blog posts (parsed with `gray-matter` + `marked`)       |
| External APIs | TheSportsDB, Jolpi F1 API                                   |
| Deployment    | [Vercel](https://vercel.com)                                |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router — pages & routes
│   ├── layout.tsx                #   Root layout (fonts, navbar, footer)
│   ├── page.tsx                  #   Homepage — combined events + latest blogs
│   ├── globals.css               #   Tailwind theme, custom styles, animations
│   ├── sitemap.ts                #   Dynamic sitemap generation
│   ├── rss.xml/route.ts          #   RSS 2.0 feed for blog posts
│   ├── blogs/
│   │   ├── page.tsx              #   Blog listing (featured + grid)
│   │   └── [slug]/page.tsx       #   Individual blog post
│   ├── faqs/page.tsx             #   FAQ page with accordions
│   └── series/[slug]/page.tsx    #   Per-series page (hero + events feed)
│
├── components/                   # React components
│   ├── Navbar.tsx                #   Fixed header with nav links + mobile menu
│   ├── SeriesSelector.tsx        #   Horizontal scrollable league pills
│   ├── CombinedEventsFeed.tsx    #   Fetches & displays events from all leagues
│   ├── SeriesEventsFeed.tsx      #   Fetches & displays events for one league
│   ├── EventList.tsx             #   Renders grouped event cards
│   ├── TwoPanelLayout.tsx        #   Grid layout (main 9-col + sidebar 3-col)
│   ├── RightPanel.tsx            #   Sidebar — news feed, app promo, links
│   ├── Hero.tsx                  #   Series hero banner with social links
│   ├── LatestBlogs.tsx           #   Blog preview cards section
│   ├── RelatedPosts.tsx          #   Related posts at bottom of blog articles
│   ├── ShareButton.tsx           #   Copy-link share popup
│   ├── Footer.tsx                #   Footer with branding, nav, socials
│   ├── MarqueeText.tsx           #   Scrolling text ticker in footer
│   ├── SocialMediaBtn.tsx        #   Reusable social link button
│   ├── StructuredData.tsx        #   Injects JSON-LD schema scripts
│   ├── skeletons/
│   │   └── RacingLoader.tsx      #   Animated loading state (racing car)
│   └── ui/                       #   shadcn/ui primitives (accordion, badge, etc.)
│
├── data/                         # Static data constants
│   ├── leagues.ts                #   All motorsport leagues (F1, MotoGP, NASCAR…)
│   ├── faqs.ts                   #   FAQ questions & answers
│   ├── nav-items.ts              #   Navigation link definitions
│   └── social-handles.ts         #   Social media URLs
│
├── lib/                          # Core business logic
│   ├── api/
│   │   ├── config.ts             #   API base URLs + routing logic
│   │   └── f1-api.ts             #   Jolpi F1 API service + fallback data
│   ├── blogs.ts                  #   MDX parsing, reading time, related posts
│   ├── rss.ts                    #   Fetches Motorsport.com RSS feed
│   ├── seo/
│   │   ├── index.ts              #   Barrel export for SEO modules
│   │   ├── metadata.ts           #   Metadata generation (OG, Twitter, etc.)
│   │   └── structured-data.ts    #   Schema.org JSON-LD builders
│   └── utils.ts                  #   `cn()` class-name utility
│
├── types/                        # TypeScript interfaces
│   ├── Event.ts                  #   Motorsport event shape
│   └── League.ts                 #   League/series shape
│
├── config/
│   └── site.ts                   #   Site-wide config (name, URL, social, etc.)
│
└── posts/                        #   MDX blog post files
```

---

## Architecture

The codebase is cleanly separated into three layers:

### UI Layer (`app/`, `components/`)

All rendering logic lives here. Pages in `app/` are either **Server Components** (default) or **Client Components** (marked `"use client"`).

- **Server Components** — `page.tsx` files, `RightPanel`, `RelatedPosts`, `Footer`, `LatestBlogs`. These fetch data at request time on the server.
- **Client Components** — `Navbar`, `SeriesSelector`, `CombinedEventsFeed`, `SeriesEventsFeed`, `Hero`, `ShareButton`, `MarqueeText`, `RacingLoader`. These use React hooks (`useState`, `useEffect`) for interactivity and client-side data fetching.

### Logic Layer (`lib/`, `config/`, `types/`)

Business logic is isolated from UI:

- **`lib/blogs.ts`** — Reads `.mdx` files from `src/posts/`, parses frontmatter with `gray-matter`, converts markdown to HTML with `marked`, calculates reading time, extracts keywords, and finds related posts using tag-based scoring.
- **`lib/seo/`** — Generates page metadata (Open Graph, Twitter Cards) and Schema.org structured data (Article, Organization, FAQ, WebSite, ItemList).
- **`lib/rss.ts`** — Fetches and parses external RSS feeds from Motorsport.com.
- **`config/site.ts`** — Centralizes site name, URL, description, social links, and default metadata.
- **`types/`** — TypeScript interfaces for `Event` and `League` objects.

### API Layer (`lib/api/`, `data/`)

External data fetching is handled by two API services:

| API             | Used For       | Module              |
| --------------- | -------------- | ------------------- |
| TheSportsDB     | All series except F1 | `lib/api/config.ts` (base URL) |
| Jolpi F1 API    | Formula 1      | `lib/api/f1-api.ts` |

The **routing decision** is made by `shouldUseAlternativeAPI(leagueId)` in `config.ts` — it returns `true` for F1 (league ID `4370`) and `false` for everything else.

Static data in `data/` provides league definitions, FAQ content, navigation items, and social handles. These are imported as plain TypeScript arrays.

---

## Page Rendering Flow

### Homepage (`/`)

```
layout.tsx (Server)
├── Navbar (Client) — fixed header, mobile hamburger menu
├── SeriesSelector (Client) — horizontal league filter pills  
├── page.tsx (Server)
│   ├── Generates structured data (Organization, WebSite, ItemList schemas)
│   └── TwoPanelLayout
│       ├── CombinedEventsFeed (Client)
│       │   ├── Fetches events from ALL leagues in parallel (Promise.all)
│       │   ├── Filters for future events, sorts by date
│       │   └── EventList → EventItem cards grouped by month
│       └── RightPanel (Server)
│           ├── Fetches Motorsport.com RSS feed
│           ├── Displays news items with relative timestamps
│           └── App Store promotion card
├── LatestBlogs (Server) — shows 3 latest blog posts  
└── Footer (Server)
```

### Series Page (`/series/[slug]`)

```
page.tsx (Server)
├── Resolves league from slug via data/leagues.ts
├── TwoPanelLayout
│   ├── Hero (Client) — banner image, league info, social links
│   ├── SeriesEventsFeed (Client)
│   │   ├── Fetches events for single league (F1 API or TheSportsDB)
│   │   └── EventList → EventItem cards
│   └── RightPanel (Server)
└── Footer
```

### Blog Post (`/blogs/[slug]`)

```
page.tsx (Server)
├── Reads MDX file from src/posts/{slug}.mdx
├── Parses frontmatter + converts markdown → HTML
├── Generates Article schema + page metadata
├── Renders HTML content with prose styling
├── ShareButton (Client) — copy link to clipboard
└── RelatedPosts (Server) — finds posts with shared tags
```

---

## Data Flow: Event Fetching

```
User visits page
      │
      ▼
CombinedEventsFeed / SeriesEventsFeed (Client Component)
      │
      ├── useEffect triggers on mount
      │
      ├── For each league:
      │   ├── shouldUseAlternativeAPI(leagueId)?
      │   │   ├── YES → F1ApiService.getUpcomingF1Events()
      │   │   │         → Fetches from api.jolpi.ca/ergast/f1/{year}.json
      │   │   │         → Falls back to hardcoded data on failure
      │   │   │         → Converts F1Race → F1Event (common shape)
      │   │   │
      │   │   └── NO  → fetch(TheSportsDB/eventsseason.php?id={id}&s={year})
      │   │             → Filters events where strTimestamp > now
      │   │
      │   └── Returns Event[]
      │
      ├── Promise.all(allLeagueFetches)
      ├── Flatten + sort by timestamp (ascending)
      └── setEvents(sortedEvents) → re-render → EventList
```

---

## SEO Pipeline

The app implements comprehensive SEO through three mechanisms:

1. **Metadata** — Every page exports a `generateMetadata()` function that returns title, description, keywords, Open Graph, and Twitter Card data. Built by `lib/seo/metadata.ts`.

2. **Structured Data** — JSON-LD scripts injected via the `StructuredData` component. Schemas include Organization, WebSite, Article, FAQ, and ItemList.

3. **Feeds & Discovery** — `sitemap.ts` generates an XML sitemap. `rss.xml/route.ts` generates an RSS 2.0 feed for blog posts.

---

## Blog System

Blog posts are **MDX files** stored in `src/posts/`. Each file has YAML frontmatter:

```yaml
---
title: "Post Title"
date: "2025-01-15"
description: "Brief description"
tags: ["F1", "Race Review"]
featuredImage: "/images/post-image.jpg"
---
```

The `lib/blogs.ts` module:
- Reads all `.mdx` files from the posts directory
- Parses frontmatter with `gray-matter`
- Converts markdown body to HTML with `marked`
- Calculates reading time (~200 words/minute)
- Extracts keywords from content for SEO
- Finds related posts using tag overlap scoring

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`.
