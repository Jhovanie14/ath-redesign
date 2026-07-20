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

- **Slot:** hero right-column panel · **Ratio:** `3:4` (portrait) · **Size:** 2K–4K
- **File:** `public/images/hero.jpg`
- **Composition note:** keep the focal subject **centred/upper**. Leave the
  **lower-left soft/uncluttered** (the Verification Passport card overlaps
  there) and the **top-right corner calm** (a floating rating chip sits there).

> **Prompt:** A serene, upscale aesthetics training studio bathed in warm
> morning light. In soft focus, a practitioner’s gloved hands demonstrate a
> refined injectable technique on an elegant practice mannequin, seen
> over-the-shoulder. Foreground: a tidy tray of fine aesthetic tools and a
> glass serum bottle on a pale marble surface. Warm cream and stone tones, a
> whisper of gold, calm and precise atmosphere. + [style suffix] + [negative]

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

## 4. Trainer card covers _(optional)_

- **Slot:** `DuotoneCover` on trainer cards & profile hero · **Ratio:** `3:2` · **Size:** 2K
- Today these are duotone panels with the trainer’s initials — they’re a brand
  signature, so photos here are optional. If you want them: one warm, faceless
  “studio environment / hands / tools” image per trainer (or a shared set),
  cropped so the initials watermark still reads.
- **Note:** `DuotoneCover` doesn’t take a `src` yet — swapping these needs a
  small code change (I can add an optional `image` prop, or point covers at
  `EditorialImage`). Ask me and I’ll wire it.

> **Generic cover prompt:** A quiet, upscale aesthetics studio corner — a
> practitioner’s hands arranging tools on a marble counter in warm morning
> light, over-the-shoulder, no face, refined and calm. + [style suffix] + [negative]

---

## 5. Apply CTA background _(optional)_

- **Slot:** the ink “Train students? Get listed.” band · **Ratio:** `16:9` · **Size:** 2K
- The section currently uses ink + a gold glow + grain (no photo). If you want a
  photographic backdrop, keep it **dark and low-contrast** so ivory text stays
  readable; I’d layer it under an ink scrim.

> **Prompt:** A moody, dark, warm studio scene — a softly lit tray of aesthetic
> tools on a dark surface, deep shadows, a single warm gold highlight, mostly
> dark negative space. + [style suffix] + [negative]

---

## How to add the images — no code needed

The slots are already wired to **auto-detect** files via `resolveImage()`
(`src/lib/media.ts`). Just drop your generated files at the paths below and
rebuild (or they appear live under `next dev`). No file → the craft art shows,
so nothing ever breaks. Extension can be **`.jpg`, `.jpeg`, `.png`, `.webp` or
`.avif`** — whichever you export.

| Slot | Put the file at |
|---|---|
| Hero | `public/images/hero.<ext>` |
| Specialism tiles (×9) | `public/images/specialisms/<key>.<ext>` — keys: `lip-filler`, `anti-wrinkle`, `dermal-filler`, `skin-boosters`, `microneedling`, `chemical-peels`, `advanced-injectables`, `foundation`, `advanced` |
| How-it-works bands (×3) | `public/images/steps/step-1.<ext>`, `step-2.<ext>`, `step-3.<ext>` |

Then: `npm run build` (or just refresh in `npm run dev`). Local files under
`public/` need no config; a subtle film-grain overlay is kept on top of photos
for cohesion. Only if you ever load photos from a remote host, add its domain to
`images.remotePatterns` in `next.config.ts`.

_(Trainer-card covers and the CTA background are not auto-wired — they still use
the signature duotone / ink treatment. Ask if you want those swappable too.)_
