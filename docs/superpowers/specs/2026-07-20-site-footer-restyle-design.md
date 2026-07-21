# Site footer restyle — design

## Context

`src/components/site-footer.tsx` is a working but plain 4-column dark footer
(brand blurb + 3 link columns + bottom bar). The site runs a "Quiet Luxury
Editorial" design system (ink/ivory/stone/gold palette, Fraunces display +
Inter sans, `eyebrow`/`text-small`/`text-micro` type scale, `[data-reveal]`
scroll-reveal utility) already established across Home, header, and the
verification components.

## Scope

Restyle only — no new content, sections, social icons, or CTA banner. All
changes are visual/structural polish of the existing brand column, 3 link
columns, and bottom bar, using tokens and interaction patterns that already
exist elsewhere in the codebase.

## Design

1. **Depth on the ink field** — replace flat `bg-ink` with a subtle radial
   vignette (CSS gradient, no new asset) so the section reads as a designed
   surface rather than a flat rectangle.
2. **Brand column** — convert the "Vetted training. Verified reviews." line
   from plain text into a small bordered eyebrow badge (hairline rule,
   tightened tracking), echoing the `VerifiedSeal` visual language used on
   trainer cards/profile. More vertical space under the wordmark.
3. **Structural hairline** — add a vertical `border-ivory/10` divider between
   the brand block and the link-column group, replacing reliance on grid gap
   alone for separation.
4. **Link hover motif** — replace the flat color-only hover with the same
   sliding-underline treatment `site-header.tsx` uses for active nav items,
   so footer links share the header's interaction language.
5. **Bottom bar** — more vertical breathing room; add a small ghost
   "back to top" arrow button (anchor + CSS smooth scroll, no new JS state).
6. **Scroll-reveal** — apply the existing `[data-reveal]` utility to the
   footer's content block so it fades/slides in on scroll like the rest of
   the site.

## Out of scope

- New footer sections (newsletter, social icons, CTA banner) — explicitly
  deferred per user decision during brainstorming.
- Any change to footer copy/links.
- Any change to `site-header.tsx` beyond reading it as a reference pattern.

## Files touched

- `src/components/site-footer.tsx` (structure + content wiring)
- `src/app/globals.css` (if the vignette/underline motif needs a reusable
  utility rather than inline Tailwind arbitrary values — decide during
  implementation; prefer inline Tailwind first, only promote to a utility if
  reused elsewhere)
