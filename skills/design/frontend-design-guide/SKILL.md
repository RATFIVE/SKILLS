---
name: frontend-design-guide
description: A reusable process for creating standalone, high-quality frontend designs in HTML with genuine design intent instead of a generic "web look." Use this skill whenever the user wants to build, style, or beautify any frontend interface — websites, landing pages, dashboards, prototypes, slide decks, posters, React components, or HTML/CSS layouts — even if they don't explicitly say "design." Trigger it for any request involving visual layout, typography, color systems, motion, or making a UI look polished and distinctive.
---

# Building Frontend Designs

A reusable guide for producing standalone, high-quality frontend designs in HTML — with a real
aesthetic point of view rather than a generic "web look." Follow this process in order.

---

## 0. Mindset

- **HTML is the tool, not the medium.** Embody the right role: UX designer, slide designer,
  prototyper, animator, editorial designer. Avoid web clichés unless you are deliberately building a
  website.
- **One idea, executed without compromise.** Bold-maximalist and refined-minimalist both work — what
  matters is intentionality, not intensity.
- **A thousand noes for every yes.** Every element must earn its place. No filler text, no dummy
  sections, no decorative numbers or icons without function. Less is more.

---

## 1. Understand first, then design

Before a single line of code:

1. **Clarify context.** What kind of output (web page, prototype, deck, video)? What fidelity? Is
   there a design system, UI kit, brand, or codebase? If so: read it fully first and adopt its
   visual language.
2. **Ask questions when something is new or unclear.** One focused round of questions about vibe,
   audience, colors, type, mood, and desired variants beats designing blind. Without context you get
   slop.
3. **Define purpose and tone.**
   - *Purpose*: What problem does the interface solve? Who uses it?
   - *Tone*: Pick an extreme and mean it — brutally minimal, maximalist, retro-futuristic, organic,
     luxurious, playful, editorial/magazine, brutalist, art-deco/geometric, soft/pastel,
     industrial/utilitarian.
   - *Differentiation*: What makes it **unforgettable**? What is the one thing that sticks?

---

## 2. Lock the system (state it before building)

Define the system explicitly before you build — this prevents inconsistency later:

- **Type system**: display font + body font, size scale, weights, line heights.
- **Color system**: background/foreground tones, 0–2 accents, defined as CSS variables.
- **Layout system**: grid, spacing scale, radii, shadows.
- **Rhythm**: how visual variety is created (section shifts, full-bleed moments, accent surfaces).

If a design system exists, use its tokens. If not, define your own variables and make them
adjustable via tweaks.

---

## 3. Typography

- Fonts must be **beautiful, distinctive, and full of character.** Web-safe set or Google Fonts.
- **Avoid overused fonts**: Inter, Roboto, Arial, Fraunces. (Helvetica is a clean, legitimate
  choice.)
- **Pair** a distinctive display font with a calm, highly legible body font.
- At most 1–3 typefaces.
- **Respect scales**: slides (1920×1080) never below 24px, ideally much larger. Print never below
  12pt. Touch targets never below 44px.
- Use `text-wrap: pretty` for clean line breaks.

---

## 4. Color & theme

- **Commit to one coherent aesthetic**, with CSS variables for consistency.
- **A dominant color + a sharp accent** beats a timid, evenly distributed palette.
- **Choose tones**: warm, cool, or neutral. Tint white and black subtly — keep saturation on white
  tones **below 0.02** (in oklch).
- **Accents**: define 0–2 additional accent colors via `oklch()`. All accents share chroma and
  lightness; only the hue varies → automatically harmonious.
- If there is a brand color set, use it. Don't invent colors out of nowhere.

---

## 5. Spatial composition

- Unexpected layouts: asymmetry, overlap, diagonal flow, grid-breaking elements.
- Generous negative space **or** controlled density — decide deliberately, not by accident.
- **Flex/grid with `gap`** for any row or group of peer elements (buttons, chips, cards, nav,
  toolbars) — **not** inline flow with whitespace or one-off margins. This survives direct
  manipulation (reorder, delete, duplicate) cleanly.
- Inline flow only for true text flow (`<a>`, `<strong>`, `<em>` mid-sentence).

---

## 6. Motion

- Use animation for effects and micro-interactions; with HTML, prefer CSS-only.
- **High-impact moments** over scattered micro-movements: one well-orchestrated page load with
  staggered reveals lands harder than ten tiny hover effects.
- Match complexity to the vision: maximalism can carry elaborate effects, minimalism needs restraint
  and precision.
- **Build reveal animations** so the visible end state is the base style and you animate *from*
  "hidden" — gated behind `@media (prefers-reduced-motion: no-preference)` so that
  print/PDF/reduced-motion always show content.
- No endless decorative loops on content.

---

## 7. Backgrounds & visual depth

Instead of flat solid fills, create atmosphere: gradient meshes, noise/grain textures, geometric
patterns, layered transparencies, dramatic shadows, decorative frames.

**But:** avoid slop tropes — aggressive gradient backgrounds, emoji (unless on-brand), containers
with rounded corners + a left accent stripe, the same gradient everywhere.

---

## 8. Images & icons

- **Never hand-draw complex SVGs.** Only simple shapes are allowed (square, circle, diamond).
- For image content, use **subtly striped SVG placeholders** with a monospace label (e.g. "product
  shot", "hero image") and ask for real assets.
- Emoji only when the brand already uses them.

---

## 9. Technical cleanliness (so direct editing works)

- **Canonical HTML**: explicitly close every non-void element (`<p>…</p>`), all attributes in double
  quotes, no self-closing tags for non-void elements (`<div></div>`).
- For React/JSX prototypes: name style objects **specifically** (`const heroStyles = {…}`), never
  `const styles = {…}` — name collisions break everything.
- Share components across Babel scripts via `Object.assign(window, {…})`.
- Avoid large files (>1000 lines) — split into smaller part-files and import at the end.
- No `scrollIntoView`.
- For time-based content, persist the playback position in `localStorage`.

---

## 10. Variants & tweaks

- Build new versions/requests as **tweaks** inside the existing file, rather than N loose HTML files.
  One main file with switchable variants beats multiple copies.
- Show purely visual options (color, type, static layout) side by side on one canvas.
- For interactions/flows/many options, mock the whole prototype and expose options as tweaks.
- Offer 1–2 tasteful default tweaks even when unasked.

---

## 11. Wrap-up

1. Save the file with a meaningful name.
2. Open it in the browser and check for console errors; fix them until clean.
3. Run an independent verification (screenshots, layout, JS checks).
4. Summarize **extremely briefly** — only caveats and next steps.

---

### Quick checklist

- [ ] Context & tone clarified, questions asked
- [ ] Bold direction committed, one unforgettable idea
- [ ] System (type, color, layout) defined up front
- [ ] Distinctive fonts, no slop fonts
- [ ] Dominant color + accent in oklch, as CSS variables
- [ ] Unexpected layout, flex/grid with gap
- [ ] One strong motion moment, reduced-motion-safe
- [ ] Depth in the background, no slop tropes
- [ ] Image placeholders instead of hand-drawn SVGs
- [ ] Canonical HTML, clean scales
- [ ] Variants as tweaks, not as copies
- [ ] Tested, verified, summarized briefly
