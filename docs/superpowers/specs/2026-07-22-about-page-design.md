# About Page Design

**Goal:** Add a public `/about` page to the ATH marketplace site telling the Hub's mission/trust story, matching the visual polish and component patterns of the existing `/how-it-works` and `/contact` pages, and link it from the header nav and footer.

**Architecture:** A single server-rendered page (`src/app/about/page.tsx`) composed entirely of existing shared components (`SiteHeader`, `SiteFooter`, `SectionEyebrow`, `Reveal`/`RevealGroup`/`RevealItem`, `EditorialImage`, `ProofBand`, `Button`). No new components are required. The page fetches trainer data via the existing `getRepository()` to compute the same live proof stats the homepage shows.

**Tech Stack:** Next.js App Router (server component), Tailwind CSS, existing site component library — no new dependencies.

## Global Constraints

- Voice is institutional throughout ("the Hub" / third-person) — no invented founder persona, matching the site's existing copy voice on How it works / homepage.
- Reuse existing components and Tailwind patterns exactly as used on `/how-it-works` and the homepage — no new one-off UI primitives.
- Container convention: `mx-auto w-full max-w-[1600px] px-5 sm:px-8` (same as `how-it-works` and `contact`), except the full-bleed hero which follows the homepage/how-it-works hero's own edge-to-edge layout.
- No new npm dependencies.
- Hero image is optional at build time: pass `resolveImage("images/about-hero")` straight through to `EditorialImage`, which already falls back to hand-authored craft art when `src` is `undefined` — no conditional rendering needed, and a real photo can be dropped in later exactly like the homepage hero swaps.

---

## Route & Metadata

- File: `src/app/about/page.tsx`
- `export const metadata: Metadata = { title: "About us", description: "Why the Aesthetic Training Hub exists — a vetted directory built on insurance-checked trainers and reviews only from real bookings." }`
- Default export `AboutPage`, an `async` server component (needs to `await getRepository()` for the proof-band stats, same pattern as `src/app/page.tsx`).

## Navigation Changes

**`src/components/site-header.tsx`** — add "About" to the `NAV` array between "How it works" and "Pricing":

```ts
const NAV = [
  { href: "/search", label: "Find training" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact us" },
];
```

**`src/components/site-footer.tsx`** — add "About" as the first link in the "Company" column of `COLUMNS`:

```ts
{
  heading: "Company",
  links: [
    { label: "About", href: "/about" },
    { label: "Contact us", href: "/contact" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Vetting standards", href: "#" },
  ],
},
```

## Page Sections

The page is five sections, top to bottom. Full copy is final (not placeholder) — use it verbatim.

### 1. Hero (edge-to-edge split, matches `how-it-works` hero structure)

- Eyebrow: `About us`
- H1: `Training you can trust, not just find.`
- Body: `Aesthetic training is full of anonymous listings and unverifiable claims. The Hub exists to fix that — every trainer is insurance-checked and qualification-verified before they're listed, and every review comes from a student who actually attended. No guesswork. No directories of unknowns.`
- No stat row in the hero (the live proof stats appear once, lower on the page, in the Proof band section — avoid showing the same numbers twice).
- Image: `EditorialImage` with `variant="warm"`, `priority`, `src={resolveImage("images/about-hero")}`, `sizes="100vw"`, same floating-panel layout as `how-it-works`' hero image slot (`-mx-5 mt-10 h-[420px] sm:-mx-8 sm:h-[480px] lg:absolute lg:inset-y-6 lg:right-6 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[46%]`, `lg:rounded-[32px]`).

### 2. Why we exist (plain section, no tint)

- Eyebrow: `Why we exist`
- H2: `Anonymous listings shouldn't decide your training.`
- Body (two short paragraphs):
  - `Booking aesthetics training used to mean scrolling directories with no way to check who was actually qualified, insured, or any good. A polished profile told you nothing about whether the person behind it could be trusted with a needle.`
  - `Every listing on the Hub is checked by a person, not an algorithm, before it goes live — and it stays live only for as long as that trainer's insurance and registration remain current. That's the whole idea: fewer, better-checked listings instead of an unfiltered directory.`
- Layout: single column, `max-w-2xl`, same typographic pattern as the "Verified reviews" section on `how-it-works` (`SectionEyebrow` + `h2` + `p`), wrapped in a `Reveal`.

### 3. What we stand for (plain section, 4-card grid)

- Eyebrow: `What we stand for`
- H2: `The standard every listing meets.`
- Grid of 4 cards (`RevealGroup`/`RevealItem`, same card style as `how-it-works`' `STUDENT_STEPS` grid: `rounded-card border border-linen bg-paper p-7`, `md:grid-cols-2 lg:grid-cols-4`):

  1. **No anonymous listings** — Every trainer is a named, checked professional — never an unverifiable handle in a directory.
  2. **Reviews only from real bookings** — You can't post a review without a booking made through the Hub. No planted praise, no anonymous pile-ons.
  3. **Insurance checked, always** — We confirm current cover before a listing goes live, and it pauses automatically the moment that cover lapses.
  4. **Human review, not algorithms** — Someone on our team signs off every listing by hand. There's no automatic approval queue.

- Below the grid: one line linking out instead of repeating the detail already on `how-it-works`: `Want the full detail? ` + `Link` to `/how-it-works` reading `See exactly how vetting works →`.

### 4. Proof band (tinted, full-bleed — identical pattern to homepage)

- Section wrapper: `w-full border-y border-linen/70 bg-linen`, inner `${CONTAINER} py-16 sm:py-24`.
- Reuse `ProofBand` with the same stats shape/computation as `src/app/page.tsx`:

```ts
const repo = getRepository();
const all = await repo.getAll();
const studentsTrained = all.reduce((s, t) => s + t.studentsTrained, 0);
const totalReviews = all.reduce((s, t) => s + t.reviewCount, 0);
const avgRating = all.reduce((s, t) => s + t.rating, 0) / all.length;

const stats = [
  { value: Math.floor(studentsTrained / 100) * 100, suffix: "+", label: "Students trained" },
  { value: avgRating, decimals: 1, label: "Average rating" },
  { value: totalReviews, label: "Verified reviews" },
  { value: 100, suffix: "%", label: "Insurance-checked" },
];
```

### 5. Trainer CTA band (closing — identical pattern to `how-it-works`' closing section)

- Wrapped in `Reveal`, card style `rounded-card border border-linen bg-paper p-8 sm:p-12`.
- Eyebrow: `For trainers`
- H2: `Get listed in three steps.`
- Reuse the same `TRAINER_STEPS` 3-column list and copy already defined in `src/app/how-it-works/page.tsx` (Apply / Pass vetting / Go live) — duplicate the const array into `about/page.tsx` rather than importing across pages (each page owns its own copy today; no shared content module exists).
- Buttons: `List your training` → `/apply` (primary), `See tiers & pricing` → `/pricing` (outline), same as `how-it-works`.

---

## Data Flow

`AboutPage` is an async server component. It calls `getRepository()` once and awaits `repo.getAll()` to compute the four proof stats above — the same aggregation already performed in `src/app/page.tsx`. No other data is needed (no featured trainers, no testimonials on this page).

## Testing / Verification

- `npx tsc --noEmit` and `npx eslint src/app/about/page.tsx src/components/site-header.tsx src/components/site-footer.tsx` must both be clean.
- Run the dev server and visually check `/about`: hero renders (with graceful craft-art fallback since `images/about-hero` doesn't exist yet), values grid, proof band shows real numbers matching the homepage's, CTA band buttons link correctly.
- Confirm `/about` appears in the header nav (desktop and mobile menu) and in the footer's Company column, and that clicking through from both works.
- No new automated tests are needed — this mirrors the existing pattern where `how-it-works` and `contact` have no dedicated test files; correctness is verified via typecheck/lint plus manual browser check, consistent with the rest of the site.
