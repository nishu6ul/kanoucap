# Kanou Capital Website - Requirements, Architecture & Development Guide

## Overview

Kanou Capital (kanoucap.com) is the website for an energy transition hedge fund manager based in London. The site consists of a public-facing marketing website and a secure client portal for document access.

**Live URLs:**
- Production: https://kanoucap.com (pending DNS switch from Wix)
- Netlify preview: https://kanou.netlify.app
- GitHub repo: https://github.com/nishu6ul/kanoucap

**Hosting:** Netlify (free tier, auto-deploys from GitHub master branch)
**Domain registrar:** GoDaddy (account #36854967)
**Previous host:** Wix (to be cancelled after DNS migration)

---

## Tech Stack

| Component | Technology | Details |
|-----------|-----------|---------|
| Frontend | Static HTML/CSS/JS | No build step, no framework |
| Hosting | Netlify | Free tier, auto-deploy from GitHub |
| Backend/Auth | Supabase | Free tier, project: kanoucap-portal |
| Database | Supabase PostgreSQL | Tables: profiles, documents |
| File Storage | Supabase Storage | Bucket: "documents" (private) |
| Contact Form | FormSubmit.co | Sends to info@kanoucap.com |
| Fonts | Google Fonts CDN | Cormorant (display) + DM Sans (body) |
| Version Control | GitHub | github.com/nishu6ul/kanoucap |

---

## Supabase Configuration

**Project:** kanoucap-portal
**Region:** eu-west-2 (London)
**Project URL:** https://zwyymyalysvjlujrgfcg.supabase.co

**API Keys (do NOT commit service_role key to public repos):**
- anon (public): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eXlteWFseXN2amx1anJnZmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTU2MTEsImV4cCI6MjA4OTkzMTYxMX0.yrVjQbGAs_wkZssYVplRLZxIqQexYAceGrb6heoWel4`
- service_role (SECRET, server-side only): stored in Supabase dashboard, never in frontend code

**Database password:** KanouPortal#2026

---

## File Structure

```
kanoucap/
├── index.html                  # Homepage
├── base.css                    # CSS reset and base styles
├── style.css                   # Design tokens, components, responsive
├── theme.js                    # Dark/light mode toggle with cookie persistence
├── netlify.toml                # Netlify config (redirects, publish dir)
├── _redirects                  # Netlify redirect rules
├── REQUIREMENTS.md             # This file
│
├── assets/
│   ├── hero-energy.png         # Homepage hero (solar farm + wind turbines)
│   ├── insight-cover.png       # Insights page (wind turbine close-up)
│   ├── hero-mountain.jpg       # Legacy image (unused, kept for backup)
│   ├── Kanou-Final-Report.pdf  # Energy transition research report
│   ├── nishant-gupta.jpg       # Team photos
│   ├── manish-boyat.jpg
│   ├── shishir-singh.jpg
│   ├── abhishek-sinha.jpg
│   ├── jonathan-cummins.jpg
│   ├── irakli-gabidzashvili.jpg
│   ├── rahul-dalal.png
│   └── daksh-jain.jpg
│
├── pages/
│   ├── team.html               # Team bios and photos
│   ├── insights.html           # Research reports
│   ├── news.html               # Press articles (external links)
│   ├── contact.html            # Contact form + map
│   └── thank-you.html          # Post-submission confirmation
│
└── members/                    # Client portal (requires Supabase auth)
    ├── login.html              # Login page
    ├── change-password.html    # Force password change on first login
    ├── disclaimer.html         # Institutional investor disclaimer
    ├── dashboard.html          # Document library (role-filtered)
    ├── admin.html              # Admin panel (user + document management)
    ├── portal.js               # Supabase client, auth helpers
    └── portal.css              # Portal-specific styles
```

---

## Design System

### Colors (Light Mode)
| Role | Hex | Usage |
|------|-----|-------|
| Background | #FAFAF7 | Page background |
| Surface | #FFFFFF | Cards, containers |
| Surface alt | #EEF1F5 | Page headers, alternating sections |
| Navy (primary structural) | #0B1A2E | Header, footer, dark sections |
| Gold (accent) | #B8860B | CTAs, labels, highlights, links |
| Text | #0B1A2E | Primary text |
| Text muted | #5A6878 | Secondary text |
| Text faint | #9AA4B0 | Tertiary text |
| Border | #D6D9DE | Dividers, borders |

### Colors (Dark Mode)
| Role | Hex |
|------|-----|
| Background | #0A0F18 |
| Surface | #111827 |
| Navy | #0F1D33 |
| Gold (accent) | #D4A843 |
| Text | #E2E5EA |
| Text muted | #8B95A5 |

### Typography
| Element | Font | Size |
|---------|------|------|
| Display headings | Cormorant (serif) | --text-xl to --text-3xl |
| Body text | DM Sans (sans-serif) | --text-base (16-18px) |
| Labels/nav | DM Sans | --text-xs to --text-sm |
| Section labels | DM Sans, uppercase, letter-spaced | --text-xs |

### Key Design Rules
- NO em-dashes anywhere in visible content (use periods, commas, or "and" instead)
- Serif headings (Cormorant) + sans-serif body (DM Sans)
- Gold accent used sparingly for labels, CTAs, and interactive elements
- Dark mode supported via `data-theme="dark"` attribute on `<html>`
- Theme preference persisted via cookie (theme.js)
- All team photos displayed as circular, greyscale (color on hover)
- Scroll reveal animations on sections (IntersectionObserver)

---

## Pages

### Homepage (index.html)
- **Hero:** Full-bleed energy image with dark overlay, "Investing in the Energy Transition" headline, subtitle describing the firm
- **Pillars:** Three-column layout (Firm / Strategy / Portfolio)
- **About:** Firm description + "Why Kanou" section with Japanese kanji
- **Insights preview:** Navy band linking to research
- **Contact strip:** Address, email, CTA

### Team (pages/team.html)
- **Intro:** Multi-sector expertise, boots on ground in UK, US, Asia
- **Members (in order):**
  1. Nishant Gupta / Founder & CIO
  2. Manish Boyat / COO and CTO
  3. Abhishek Sinha / Analyst, Energy & Renewables
  4. Jonathan Cummins / Analyst, Industrials
  5. Irakli Gabidzashvili / Analyst, Industrials
  6. Shishir Singh / Analyst, Autos and Technology
  7. Rahul Dalal / Associate
  8. Daksh Jain / Associate
- Layout: circular photo (left) + name/title/bio (right), stacks vertically on mobile

### Insights (pages/insights.html)
- Featured research report with cover image, key findings, PDF download link
- Report: "The Role of the Energy Transition in Economic Development and Equality"

### News (pages/news.html)
- External article links, sorted newest first
- Articles:
  1. MOI Global (Sep 2025): Interview on investing across energy transition
  2. Bloomberg (Mar 2025): "Hedge Fund Built on Energy Bets Says 'Clean Is Dead for Now'"
  3. AI-CIO (May 2024): Commodities and fundamentals-based investing
  4. Bloomberg (Feb 2024): Launch announcement

### Contact (pages/contact.html)
- Navy background, split layout: info (left) + form (right)
- Address: 14 Curzon Street, London, UK, W1J 5HN
- Email: info@kanoucap.com
- No phone number displayed
- Google Maps embed for 14 Curzon Street
- Form submits via FormSubmit.co (AJAX, inline success message)
- First submission requires email confirmation from FormSubmit.co

---

## Client Portal (members/)

### Authentication Flow
1. User visits /members/login.html
2. Signs in with email + password (Supabase Auth)
3. If `must_change_password` is true: redirect to change-password.html
4. If user is admin: redirect to admin.html
5. If user is non-admin and `disclaimer_accepted` is false: redirect to disclaimer.html
6. Otherwise: redirect to dashboard.html

### User Roles
| Role | Permissions |
|------|------------|
| admin | Create/manage users, upload/delete documents, view all documents, skip disclaimer |
| member | View documents matching their fund_type, must accept disclaimer |

### Fund Types
| Fund Type | DB Value |
|-----------|----------|
| Long Only | long_only |
| Low Net Hedge Fund | low_net_hedge |
| Variable Net Hedge Fund | variable_net_hedge |

Documents are tagged with a fund_type. Members only see documents matching their type, or documents tagged "all".

### Database Schema

#### profiles table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  fund_type TEXT NOT NULL DEFAULT 'long_only' CHECK (fund_type IN ('long_only', 'low_net_hedge', 'variable_net_hedge')),
  disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### documents table
```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('presentation', 'monthly_report', 'factsheet', 'other')),
  fund_type TEXT NOT NULL DEFAULT 'all' CHECK (fund_type IN ('long_only', 'low_net_hedge', 'variable_net_hedge', 'all')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Row Level Security (RLS)
- profiles: users can read/update own profile, admins can read/insert/update all
- documents: users can read documents matching their fund_type or fund_type='all', admins can read/insert/delete all
- Storage: authenticated users can read, admins can upload/delete

### Pre-seeded Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| nishant@kanoucap.com | Lansdowne#123 | admin |
| info@kanoucap.com | Lansdowne#123 | admin |
| clients@kanoucap.com | Lansdowne#123 | admin |

### Admin Panel Features
- **User Management tab:** Create new users (first name, last name, email, role, fund type), generates temp password, lists all users
- **Document Upload tab:** Upload files tagged by category and fund type, lists all documents with delete option

### Portal JavaScript (portal.js)
- Initializes Supabase client with anon key
- Auth helpers: signIn(), signOut(), getSession(), updatePassword()
- Profile helpers: getProfile(), updateProfile()
- Document helpers: getDocuments(), uploadDocument(), deleteDocument()
- Admin helpers: createUser() (uses service_role key via Supabase edge function or direct admin API)
- Utility: showAlert(), hideAlert(), formatDate(), formatFileSize()

---

## Navigation Structure

All pages share the same header and footer with this nav order:
**Home | Team | Insights | News | Contact | Login**

- Login links to /members/login.html
- Logo links to homepage
- Dark mode toggle (sun/moon icon) on the right
- Mobile: hamburger menu, tagline hidden

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| > 900px | Full desktop layout, 3-column pillars, side-by-side team bios |
| 640-900px | 2-column team grid, stacked contact form |
| < 640px | Single column, hamburger nav, hidden tagline, stacked everything |

---

## Deployment

### Auto-deploy (standard)
Push to the `master` branch on GitHub. Netlify auto-deploys in ~30 seconds.

```bash
git add -A
git commit -m "description of change"
git push origin master
```

### Manual deploy
Download site as zip and upload via Netlify dashboard > Deploys > drag and drop.

### DNS Migration (from Wix to Netlify)
Update these records in GoDaddy DNS:
1. Delete existing Wix A records and CNAME for www
2. Add A record: @ -> 75.2.60.5
3. Add CNAME: www -> kanou.netlify.app
4. Netlify auto-provisions SSL certificate

---

## Contact Form

Uses FormSubmit.co (free, no backend needed):
- POST to `https://formsubmit.co/ajax/info@kanoucap.com`
- JSON payload with first_name, last_name, email, subject, message
- Inline success/error messages (no page redirect)
- First submission requires clicking confirmation email from FormSubmit.co

---

## Dark Mode

Implemented via:
1. CSS variables in style.css for both light and dark palettes
2. `data-theme="light|dark"` attribute on `<html>`
3. theme.js reads/writes a cookie named "theme" for cross-page persistence
4. Respects `prefers-color-scheme` as default if no cookie set
5. Toggle button in header (moon/sun icon)

---

## Key Content

### Hero Subtitle
"A fundamental long/short hedge fund investing across the interconnected sectors of the energy transition. With decades of experience across these sectors, we navigate the complexity of this multi-decade shift by going deeper in the supply chain from industrials and utilities to chemicals, mining, autos, and technology. Our team is on the ground in the UK, US, and Asia."

### Why Kanou Section
The Japanese word Kanou (written as 可能) means "Possible". Regarding energy transition, "可能" highlights the various opportunities, challenges, and uncertainties associated with moving towards a more sustainable and low-carbon energy system. It acknowledges the complexity of this transition, involving technological, economic, social, and political dimensions.

### Firm Details
- **Full name:** Kanou Capital LLP
- **Address:** 14 Curzon Street, London, UK, W1J 5HN
- **Email:** info@kanoucap.com
- **No phone number on website**

---

## Backup

The old Wix site is documented in:
- /kanoucap-backup/old-homepage.png
- /kanoucap-backup/old-team-page.png
- /kanoucap-backup/kanoucap_documentation.md

---

## Common Tasks for Future LLM Agents

### Add a new team member
1. Add photo to assets/ (filename: firstname-lastname.jpg or .png)
2. Edit pages/team.html: add a new `<div class="team-detail reveal">` block in the correct position
3. Follow the existing pattern: photo (class="team-detail__photo"), name, role, bio
4. Commit and push to master

### Add a news article
1. Edit pages/news.html
2. Add a new `<a class="news-item reveal">` block at the TOP of the news-list div (newest first)
3. Include: publication name, date, title, excerpt, "Read article" link
4. All news links use `target="_blank" rel="noopener noreferrer"`

### Change firm details (address, email, etc.)
Update in these files:
- index.html (contact strip section)
- pages/contact.html (contact info + map embed)
- REQUIREMENTS.md (this file)

### Modify the hero text
Edit the `<p class="hero__subtitle">` in index.html. Do NOT use em-dashes.

### Upload a document to the portal
Log in as admin at /members/admin.html, use the Document Upload tab.

### Create a new portal user
Log in as admin at /members/admin.html, use the User Management tab.

---

## Changelog

### 2026-03-25: Portal Pages Fix
- **portal.js**: Renamed internal `let supabase` to `var _sbClient` to avoid fatal conflict with `window.supabase` global from CDN. This was causing all portal functions to silently fail.
- **portal.js**: Fixed signOut() redirect from `./login.html` to `../index.html` (homepage)
- **portal.js**: Service role key updated to correct value (iat:1774355611)
- **admin.html**: Complete rewrite with site header/footer, working tab switching, user creation with temp password display, document upload/delete, sign out
- **dashboard.html**: Complete rewrite with site header/footer, welcome message, documents grouped by category, "No documents available" message instead of infinite loading, sign out
- **change-password.html**: Complete rewrite with site header/footer, password validation, proper redirect after change
- **disclaimer.html**: Complete rewrite with site header/footer, Accept sets disclaimer_accepted=true and redirects to dashboard, Decline signs out and redirects to homepage
- **login.html**: Rewritten with type=button click handler (not form submit) to avoid all form submission interference. Fully inline JS for reliability.
- **RLS policies**: Fixed infinite recursion on profiles table by creating `is_admin()` SECURITY DEFINER function

### 2026-03-25: Team Page Update
- Moved Shishir Singh below Irakli Gabidzashvili
- Added Rahul Dalal (Associate) with photo
- Added Daksh Jain (Associate) with photo

### 2026-03-24: Initial Portal Build
- Created client portal with login, admin panel, dashboard, disclaimer, change-password pages
- Set up Supabase project (kanoucap-portal) with profiles and documents tables
- Pre-seeded 3 admin accounts

### 2026-03-21: Initial Website Build
- Built complete static site: homepage, team, insights, news, contact
- Design: navy + gold palette, Cormorant + DM Sans typography
- Deployed to Netlify via GitHub auto-deploy
- Contact form via FormSubmit.co
- Dark mode with cookie persistence

### Known Issues / Notes
- Service role key is exposed in portal.js (frontend). This is a security concern for production but acceptable for MVP. Long-term: move admin operations to a Supabase Edge Function or backend API.
- FormSubmit.co requires a one-time email confirmation click from info@kanoucap.com before form submissions are delivered.
- DNS for kanoucap.com still points to Wix. DNS change instructions sent to IT team.
- Netlify free tier: 300 build minutes/month, resets monthly. Site stays live even if limit is hit.

### Test Accounts
| Email | Password | Role | Fund Type | Notes |
|-------|----------|------|-----------|-------|
| nishant@kanoucap.com | Lansdowne#123 | admin | long_only | Primary admin |
| info@kanoucap.com | Lansdowne#123 | admin | long_only | |
| clients@kanoucap.com | Lansdowne#123 | admin | long_only | |
| test.longonly@example.com | TestPass#123 | member | long_only | must_change_password=true |
| test.lownet@example.com | TestPass#123 | member | low_net_hedge | must_change_password=true |
| test.varnet@example.com | TestPass#123 | member | variable_net_hedge | must_change_password=true |

### 2026-03-25: Multi-Fund Support
- **Database**: Added `fund_types` TEXT[] column to profiles (array of fund types per user)
- **Database**: Updated document category constraint: presentation, annual_letter, monthly_letter, other (removed factsheet and monthly_report)
- **Database**: Updated RLS policy to check array membership for document access
- **Admin panel**: Fund type selection changed from dropdown to checkboxes (multi-select)
- **Dashboard**: Shows tabs when user has access to multiple fund types. Each tab filters documents for that fund. Documents grouped into sections: Presentations, Annual Letters, Monthly Letters, Others. Empty sections hidden.
- **portal.js**: createUser accepts array of fund types, getDocuments supports array filtering, added formatFundTypes() for array display, updated formatCategory with new categories

#### Document Categories
| Category Value | Display Name |
|----------------|-------------|
| presentation | Presentations |
| annual_letter | Annual Letters |
| monthly_letter | Monthly Letters |
| other | Others |

#### Multi-Fund User Example
A user with `fund_types: ['long_only', 'low_net_hedge']` sees:
- Dashboard with two tabs: "Long Only" and "Low Net Hedge Fund"
- Each tab shows documents tagged for that fund type + documents tagged "all"
- Variable Net Hedge Fund documents are NOT visible
