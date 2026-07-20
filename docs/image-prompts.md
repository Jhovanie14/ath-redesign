# ATH — image prompt pack (Home)

Ready-to-use prompts for every photo slot on the elevated Home page. Each slot
today renders hand-authored craft art via `<EditorialImage>`; passing a `src`
swaps in a real photo with no other change.

- **Where files go:** `public/images/…` (create the folder).
- **Wiring:** add `src="/images/<file>"` + `alt="…"` to the matching
  `<EditorialImage>` (see “How to wire in” at the bottom).
- **Works with:** Gemini (Nano Banana / Pro), Midjourney, DALL·E 3, Ideogram,
  Adobe Firefly. Append the **style suffix** to any prompt.
- **Model tip:** hero → a Pro/4K model; small tiles & bands → a fast/2K model.

---

## Shared art direction (append to every prompt)

> **Style suffix:** Editorial, quiet-luxury aesthetic. Warm ivory and cream
> palette (#F4F2ED base), soft muted gold and warm stone/beige tones. Soft
> natural directional morning light, gentle shadows, shallow depth of field,
> subtle film grain, matte finish. Calm, refined, expensive, minimal. Clean
> negative space. Photorealistic editorial photography.

> **Global negative prompt:** no text, no letters, no logos, no watermarks; no
> identifiable faces, no eye contact, no portraits; no before/after, no visible
> injection into skin, no blood, no bruising, no graphic medical content; no
> harsh clinical white, no neon, no cartoon, no 3D render, no distortion, no
> extra fingers.

**People rule:** faces minimal or absent. Where a person appears, show hands,
gloved hands, or an over-the-shoulder crop only — never a recognisable face.

---

## 1. Hero (the flagship)

- **Slot:** shared by both hero variants — the split hero's right-side panel
  *and* the full-bleed overlay hero's background · **File:** `public/images/hero.jpg`
  (same file, no code change either way)
- **Ratio:** `4:5` (portrait) · **Size:** 3K–4K minimum
- **Why portrait, and why bigger than before:** the hero section now stretches
  to fill the full viewport height (`calc(100dvh-68px)`), not a fixed ~700px
  band. `object-cover` will crop this photo across everything from a short
  wide laptop window to a tall narrow one, so the source needs real vertical
  range to draw from — a landscape-leaning source runs out of usable height
  and over-magnifies. No more floating passport/rating-chip cards to leave
  room for (those were removed) — the only remaining constraint is text
  legibility.
- **Composition note:** put the subject — gloved hands + practice mannequin —
  in the **right two-thirds of the frame**, and give it genuine vertical
  extent: interest running from the upper third down through the lower third
  (hands/tools placed at different heights), not one clustered mid-frame
  moment surrounded by empty counter and ceiling. That way a very tall crop
  reveals *more of the same scene* top-to-bottom instead of exposing dead
  space. Keep the **left third calm and soft** (blurred wall/window bokeh,
  low detail) — that's where the ink scrim and headline sit on both variants.

> **Prompt:** A tall, immersive shot of a serene upscale aesthetics training
> studio in soft warm morning light. A practitioner stands at a treatment
> bed, gloved hands demonstrating a refined injectable technique on an
> elegant practice mannequin's head and neck — composed so the hands, tools
> and mannequin carry visual interest continuously from the upper third of
> the frame to the lower third, not confined to one small cluster. A tidy
> tray of fine aesthetic tools and a glass serum bottle sit in the lower
> foreground. The left third of the frame stays soft, blurred and
> uncluttered — a warm out-of-focus wall or window — while the right
> two-thirds holds the detail. Warm cream and stone tones, a whisper of gold,
> calm and precise atmosphere, shot in a tall 4:5 portrait frame. +
> [style suffix] + [negative]

_Alt text:_ “A trainer demonstrating an aesthetics technique in a warm, calm studio.”

---

## 2. Specialism tiles (gallery of 9)

- **Slot:** “Explore by specialism” tiles · **Ratio:** `3:2` (landscape) · **Size:** 2K
- **Files:** `public/images/specialisms/<key>.jpg`
- Tasteful still-life / macro / environment per specialism — no procedures on faces.

| Key | File | Prompt (append style + negative) |
|---|---|---|
| `lip-filler` | `lip-filler.jpg` | Elegant macro still-life of a fine-gauge dermal syringe and a small glass vial of clear hyaluronic gel resting on warm pale marble, a single soft highlight, cream and gold tones. |
| `anti-wrinkle` | `anti-wrinkle.jpg` | Soft macro of calm, smooth, dewy skin surface (texture only, no facial features), warm side light catching a gentle sheen, cream tones — evoking refined anti-wrinkle care. |
| `dermal-filler` | `dermal-filler.jpg` | Over-the-shoulder soft-focus of gloved hands sculpting the cheek of an elegant practice mannequin with a cannula, warm studio light, refined and precise, no real face. |
| `skin-boosters` | `skin-boosters.jpg` | Macro of a glass pipette dropper releasing a glistening clear serum droplet over a soft surface, warm light, luminous and clean, cream and gold palette. |
| `microneedling` | `microneedling.jpg` | Clean still-life of a sleek microneedling pen device resting on a folded linen cloth on a marble tray, soft warm light, minimal and premium. |
| `chemical-peels` | `chemical-peels.jpg` | Still-life of two amber glass apothecary bottles and a soft fan brush arranged on pale marble, warm morning light, calm spa-like mood, cream tones. |
| `advanced-injectables` | `advanced-injectables.jpg` | Top-down flat-lay of an elegant tray of prepared syringes and cannulas neatly arranged on linen, warm light, orderly and professional, muted gold accents. |
| `foundation` | `foundation.jpg` | A calm beginner training station: a practice mannequin head, an open notebook, and neatly laid-out tools on a light wooden desk, soft morning light through a window, welcoming and quiet. |
| `advanced` | `advanced.jpg` | Intimate advanced training studio, a practitioner’s hands demonstrating a refined technique on a mannequin, over-the-shoulder, focused low warm light, mentorship atmosphere, no faces. |

---

## 3. How-it-works step bands (3 thin banners)

- **Slot:** top strip of each step card (sits behind a large number) · **Ratio:** `16:9` (crop) · **Size:** 2K
- **Files:** `public/images/steps/step-1.jpg` … `step-3.jpg`
- Keep these **subtle and low-detail** — they’re short bands under a number.

1. **Search:** Soft, warm, out-of-focus interior of a bright studio, gentle bokeh, cream and gold light, calm and airy — mostly negative space.
2. **Enquire:** Warm close-up of hands resting near a phone and a notebook on a marble desk, soft light, quiet and human, cream tones.
3. **Book & review:** Soft-focus warm studio corner with a chair and plant in gentle morning light, welcoming, muted palette.

_(All three: append style + negative. Low contrast so the overlaid number stays legible.)_

---

## 4. Trainer card covers — one per trainer

- **Slot:** `DuotoneCover` on trainer cards, profile hero & founding spotlight
  · **Ratio:** ~`4:3`, 2K · keep the subject centred — `object-cover` crops
  differently on a card (short, wide) vs. a profile hero (taller) vs. the
  founding spotlight, so avoid detail right at the edges.
- **Files:** `public/images/trainers/<slug>.jpg`
- **Why per-trainer, not one shared photo:** `DuotoneCover` renders on every
  trainer card at once — up to 8 side by side in search results. A single
  shared photo behind eight different names reads as a stock-photo repeat and
  undercuts the “no directories of unknowns” promise. Each trainer gets a
  distinct environment/prop set below, drawn from their own bio — still
  faceless, so no two cards ever look like the same person, but no two cards
  look identical either.
- **People rule still applies:** no identifiable faces, no eye contact, hands
  or over-the-shoulder crops only.
- **Note:** `DuotoneCover` doesn’t take a `src` yet. Once these land I’ll add
  an optional `src` prop that renders the photo beneath the existing duotone
  gradient (a genuine duotone wash, tinted per trainer) rather than replacing
  it outright — so the ghosted-initials watermark and per-trainer glow still
  read on top.

| Slug | File | Prompt (append style + negative) |
|---|---|---|
| `dr-amara-okafor` | `dr-amara-okafor.jpg` | An elegant advanced aesthetics studio in a Marylebone townhouse. Over-the-shoulder view of a gloved hand holding a fine cannula beside a marble tray of prepped syringes and vials, soft directional morning light, refined and precise, warm cream and stone tones with a whisper of gold. |
| `dr-priya-raman` | `dr-priya-raman.jpg` | A calm, welcoming foundation-training room. Close-up of a supervising hand gently guiding a beginner practitioner's hand over a practice mannequin's forehead, a notebook and pen resting nearby, soft warm daylight, patient and unhurried mood, cream tones. |
| `grace-adeyemi` | `grace-adeyemi.jpg` | A quiet consultation corner in a CQC-registered clinic. A consent form and pen laid on a light wood desk beside a folded linen cloth and a small vase, soft window light, thoughtful and unhurried, warm neutral tones — evoking careful conversation before any treatment. |
| `dr-callum-frost` | `dr-callum-frost.jpg` | A study-like training room in Glasgow's west end. A softly blurred anatomical reference chart on the wall behind a marble tray of dermal filler syringes and a measuring tool, cool morning light through a tall window, precise and academic mood, muted stone and cream tones. |
| `elena-marchetti` | `elena-marchetti.jpg` | A bright skin-clinic studio in Clifton, Bristol. Flat-lay of a microneedling pen, two amber peel bottles and a soft konjac sponge on a linen-draped table, natural daylight, fresh and approachable, warm cream tones with a hint of green from a nearby plant. |
| `sofia-bianchi` | `sofia-bianchi.jpg` | A small, intimate training studio in Liverpool's Baltic Triangle. Close-up of two hands adjusting a practice mannequin's lip position, a modest tray of foundation-level tools beside it, warm afternoon light through an industrial window, approachable and unpretentious, soft cream and brick-warmed tones. |
| `dr-marcus-bello` | `dr-marcus-bello.jpg` | A dental-adjacent aesthetics practice in Jesmond, Newcastle. Macro of a dental mirror resting beside a fine-gauge cannula and a small dental mould on a pale marble tray, balanced cool-warm light, meticulous and precise, cream and muted gold tones. |
| `dr-test-trainer` | `dr-test-trainer.jpg` | *(Optional — internal test fixture, lowest priority.)* A converted clinic space in Manchester's Northern Quarter. Hands arranging a small tray of foundation-course tools — syringe, vial, tape measure — on a raw plaster windowsill ledge, industrial warm light, grounded and practical, cream and warm grey tones. |

---

## 5. Apply / pricing CTA background — done

- **Slot:** the ink “Train students? Get listed.” / “Ready to reach more
  students?” bands (Home + Pricing) · **Ratio:** `16:9` · **Size:** 2K
- **File:** `public/images/cta-band.jpg` — **wired and live.** The section
  layers the photo under a `bg-ink/75` scrim plus the existing gold glow and
  grain, so ivory text stays readable regardless of the photo.

> **Prompt:** A moody, dark, warm studio scene — a softly lit tray of aesthetic
> tools on a dark surface, deep shadows, a single warm gold highlight, mostly
> dark negative space. + [style suffix] + [negative]

---

## How to add the images

| Slot | Put the file at | Wired? |
|---|---|---|
| Hero | `public/images/hero.<ext>` | Auto-detected (`resolveImage()`) |
| Specialism tiles (×9) | `public/images/specialisms/<key>.<ext>` — keys: `lip-filler`, `anti-wrinkle`, `dermal-filler`, `skin-boosters`, `microneedling`, `chemical-peels`, `advanced-injectables`, `foundation`, `advanced` | Auto-detected |
| How-it-works bands (×3) | `public/images/steps/step-1.<ext>`, `step-2.<ext>`, `step-3.<ext>` | Auto-detected |
| CTA background | `public/images/cta-band.<ext>` | Auto-detected |
| Trainer covers (×8, per-slug) | `public/images/trainers/<slug>.<ext>` — see section 4 for the slug list | **Not yet** — `DuotoneCover` needs a `src` prop first; ask once photos land and I’ll wire it |

Auto-detected slots use `resolveImage()` (`src/lib/media.ts`) — drop a file at
the path above and rebuild (or refresh under `next dev`); no file → the craft
art/ink treatment shows, so nothing ever breaks. Extension can be **`.jpg`,
`.jpeg`, `.png`, `.webp` or `.avif`**. Only if you ever load photos from a
remote host, add its domain to `images.remotePatterns` in `next.config.ts`.
