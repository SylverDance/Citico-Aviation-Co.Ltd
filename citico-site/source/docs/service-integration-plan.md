# CITICO Aviation — Website Assessment & New-Services Integration Plan

Prepared: October 2026 · Scope: citico website (Next.js 15 production build) + integration of 5 new service lines.

**Existing service lines (7):** Passenger Services · Air Cargo · Charter Flights · Humanitarian Operations · Helicopter Operations · River Cargo Transport · Warehousing & Ground Support

**New service lines to integrate (5):** Ground Handling Sino Tracks · Helicopter Services · Aircraft Parts · Tours & Travels · Flight Permits

> ⚠️ Note before launch: **"Ground Handling Sino Tracks"** reads like a transcription artifact (likely "Ground Handling Services" or a named product line such as "Sino Tracks"). Confirm the official service name and its scope before copy is written — placeholder copy below uses the literal name.

> ⚠️ Overlap check: a **"Helicopter Services"** page would collide with the existing **Helicopter Operations** service (and the Mi-8 fleet page). Recommended: *do not create a second page*. Either rename the new line "Sling Load & Heavy Lift" (if that's the distinction) or fold it into Helicopter Operations. The plan below assumes the safest option — treat #2 as content upgrades to the existing page, not a new page.

---

## 1. Website Assessment Framework

### 1.1 UX & conversion metrics (evaluate before launch)

| Area | What to measure | How | Pass bar |
|---|---|---|---|
| **First-screen clarity** | Visitor can say who/what/where within 5s of landing | 5-second test on `/` (hero + intro band) | ≥80% of testers |
| **Navigation flow** | Path to any service page ≤2 clicks; nav readable at 12px floor | Task test: "find river cargo pricing contact" | ≤2 clicks, <15s |
| **CTA placement** | Request Charter pill visible without scrolling; ≥1 CTA per viewport on service pages | DOM audit (`document.querySelectorAll('[data-cta]')`) | Pill on all pages; 1 CTA/viewport |
| **Mobile responsiveness** | Layout integrity 360–1920px; tap targets ≥44px | Browser resize sweep (already partially verified via preview_evaluate) | 0 overflow, all targets pass |
| **Conversion path** | Contact form fields, friction points, form-to-lead time | Complete a test submission; time it | ≤90s to submit, ≤7 fields |
| **Page depth vs. bounce** | Where visitors leave on `/services` and detail pages | Analytics (GA4/Plausible) once installed | Detail-page bounce <60% |
| **Accessibility** | Focus ring coverage, contrast, alt text, reduced-motion | axe DevTools run | 0 critical issues |
| **Content credibility** | Certifications, fleet facts, leadership photos, JSON-LD present | Manual audit vs. competitor sites | All 6 leadership bios + fleet specs live |

### 1.2 Technical checklist

- [ ] **Speed** — LCP <2.5s on 4G (hero images are WebP, `next/image` optimized — verify with Lighthouse mobile); keep First Load JS ≤200 kB (currently 200 kB shared).
- [ ] **SEO readiness** — per-service title tags target aviation/travel keywords ("air cargo South Sudan", "Nile river barge transport", "flight permits East Africa"); add `Service` + `OfferCatalog` JSON-LD schema (currently only Organization + BreadcrumbList); submit updated `sitemap.xml`.
- [ ] **Security** — contact/newsletter forms need server-side validation + honeypot/rate limit (currently client-only aria-live); any future parts purchasing or booking flow must run over HTTPS with no card data touching the site (use a payment/booking provider, PCI scope stays with them).
- [ ] **Image pipeline** — all new photos run through `scripts/crop-*.js` (sharp) so nothing ships as a raw 2.5 MB PNG.
- [ ] **Structured data per new page** — `Service` schema with `areaServed: "South Sudan"`, plus `BreadcrumbList` (already handled by `detail.tsx`).
- [ ] **Analytics + lead tracking** — GA4 or Plausible + conversion events on form submit before new pages go live, so the new services' ROI is measurable from day 1.
- [ ] **No git repo** — initialize git before touching 12+ files for the new services; there is currently no rollback path.

---

## 2. New Services Integration Strategy

### 2.1 Ground Handling Sino Tracks *(name TBD — confirm before copywriting)*

- **Description (B2B):** "Full ground handling for charter and scheduled traffic across South Sudan — ramp supervision, load control, fuel coordination and passenger/cargo documentation, executed to airline standards at Juba and upcountry strips."
- **Placement:** `/services` grid as service card #8 (last position, dark-tinted card to signal "new"). No nav change — the Services link already exists.
- **Visual/interactive:** Photo-led hero (ramp/GSE shot); **operational coverage table** (airport → services offered → hours); "Request ground handling" form variant with dropdown for station + aircraft type. Keep it in the existing `[slug]` template + a `gallery[]` like River Cargo to avoid template drift.

### 2.2 Helicopter Services — *integrate, don't duplicate*

- **Recommendation:** Fold into the existing **Helicopter Operations** page rather than creating a competing page. If the new line is genuinely distinct (e.g. sling loads/heavy lift vs. passenger ops), rename the page "Helicopter Operations & Heavy Lift".
- **Description (B2B):** "Mi-8 heavy-lift operations for construction, energy and NGO missions — external sling loads up to 4,000 kg, crew changes and precision placement where no runway exists."
- **Placement:** Existing `/services/helicopter-operations` (nav unchanged).
- **Visual/interactive:** **Interactive payload/sling-load selector** (choose load → shows feasibility + recommended config); before/after mission imagery; dedicated "Request lift assessment" CTA with cargo-dimension fields.

### 2.3 Aircraft Parts

- **Description (B2B):** "AOG-critical parts sourcing and supply for An-26, An-74, Fokker F27, Boeing 737-300F and Mi-8 operators — traceable inventory, 24/7 AOG desk, region-wide delivery by our own cargo fleet."
- **Placement:** `/services` grid, card #9. Long-term: candidate for a dedicated `/parts` section with its own nav slot once SKU count justifies it — not at launch.
- **Visual/interactive:** **Searchable parts catalog** (search by part number / aircraft type, filtered grid — can launch as a static JSON-driven client component, no backend needed); "Request quote" per part; AOG urgency toggle on the quote form (routes to a phone-first response). This is the one new service that could later carry transactions — keep it quote-based at launch.

### 2.4 Tours & Travels

- **Description (B2C):** "Bespoke journeys across South Sudan and East Africa — scheduled flights, private charters, river safaris along the Nile corridor and curated cultural expeditions, handled end-to-end by one travel desk."
- **Placement:** This is the **only B2C line** among the five and reads differently from the industrial portfolio. Two options:
  - **A (recommended at launch):** `/services/tours-travels` card, but with B2C-styled card (warmer photo, different gradient) so it doesn't get lost among B2B cards.
  - **B (later):** own top-level nav item "Travel" once traffic proves demand.
- **Visual/interactive:** **Destination gallery** (reuses the new multi-image gallery pattern), itinerary accordion (3 sample itineraries), date + party-size enquiry form. Tone shifts: warmer copy, "Explore" rather than "Request charter".

### 2.5 Flight Permits

- **Description (B2B):** "Overflight and landing permits for operators flying African routes — we clear CAA requirements across South Sudan and neighbouring states in days, not weeks, including diplomatic clearances and tech stops."
- **Placement:** `/services` grid, card #10. Also worth a text link from the Charter Flights page (natural cross-sell).
- **Visual/interactive:** **Permit quote request form** — fields: aircraft reg/type, route (from–to), ETA date, crew/passenger count, purpose (overflight/landing/tech stop). Add a **"typical turnaround" table** by country. High-intent page: keep CTAs above and below the fold.

---

## 3. Content & UX Recommendation Map

### 3.1 Services landing page layout (target: 10 services, no clutter)

The current grid is `lg:grid-cols-3` — at 10 cards it breaks as 3/3/3/1 (lonely last card). Recommended restructure:

```
/services  (proposed wireframe)
─────────────────────────────────────────────────────
[PageHero]  unchanged
─────────────────────────────────────────────────────
SECTION A — Core operations (B2B, unchanged)
  SectionHead: "Seven capabilities, one operations desk"
  grid lg:3 → existing 7 cards (rebalanced to 3/2/2 rows)
─────────────────────────────────────────────────────
SECTION B — Specialized & new services
  SectionHead: "Extended capabilities" (kicker: "Now offered")
  grid lg:3 → Ground Handling · Aircraft Parts · Flight Permits
           + Tours & Travels (B2C-styled card, spans on mobile)
─────────────────────────────────────────────────────
[NextCta]  unchanged
─────────────────────────────────────────────────────
```

This keeps the original 7 as the visual anchor and makes the 5 additions scannable as a deliberate second tier, rather than a 10-card wall.

### 3.2 Three CTA variants (for the new offerings)

1. **Primary (B2B, high-intent):**
   Button: **"Request a handling or permit quote"** → `/contact#charter` with a pre-selected service dropdown.
   Support line: *"One desk for permits, handling and parts — responses within hours, not days."*

2. **Urgency (AOG/parts):**
   Button: **"24/7 AOG desk — call +211 92 401 6167"** (tel: link, not a form).
   Support line: *"Aircraft on the ground? Our parts desk answers around the clock."*

3. **B2C exploratory (Tours):**
   Button: **"Start planning your journey"** → enquiry form with date + party size.
   Support line: *"Tell us where you're dreaming of — our travel desk builds the rest."*

---

## Implementation sequence (when you're ready to build)

1. Init git (safety net) → add `gallery`-style data for 5 new services in `content.ts`.
2. Split `/services` page into Section A / Section B (wireframe above).
3. Build the two new form variants (parts quote, permit quote) as client components with server-side validation.
4. Photo sourcing per service → run through a `crop-*.js` sharp script (same pattern as `crop-river-gallery.js`).
5. Typecheck → build → restart → verify with `preview_evaluate` (the established loop).
