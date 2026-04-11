# 02 — Project Setup and Home Page

This is the first real build prompt for the Prana Wellness Club website. It does two things at once: it stands up the Astro project from zero and it builds the Home page as the first page in that project. Home is the design direction test. Everything downstream will cite the decisions made here, so take your time with type, spacing, rhythm, and the small compositional moves. Do not ship a templated page.

Read `CLAUDE.md` in full before doing anything else. Everything in this prompt assumes you've already internalized it: the copy-is-not-your-job rule, the no-AI-look rule, the responsive/accessible/SEO floor, and the stack constraints (Astro + HTML + CSS + minimal JS, no Tailwind, no UI kits, no React).

Before touching code on the Home page itself, run `/impeccable teach` so the design-skill context is loaded for the rest of this task. Reach for `shape`, `typeset`, `arrange`, `colorize`, `adapt`, and `audit` as the task calls for them. Use Context7 any time you're about to write non-trivial Astro or modern CSS and you're not 100% sure the syntax is current.

---

## Part A — Project Setup

### 1. Initialize the Astro project in place

The repository already exists as an empty GitHub repo at `https://github.com/ConstanceIT/prana-website`. Nothing has been pushed yet. The local working directory is `prana-site/` and already contains `CLAUDE.md`, `prompts/`, and `content-archive/`. Do not create a nested project folder. Initialize Astro directly in `prana-site/` so that `prana-site/` itself becomes the Astro project root.

Use the minimal Astro starter (no integrations, no Tailwind, no UI framework). After init, verify:

- `src/`, `public/`, `astro.config.mjs`, `package.json`, `tsconfig.json` exist at the `prana-site/` root
- `CLAUDE.md`, `prompts/`, and `content-archive/` are still intact and untouched
- `.gitignore` excludes `node_modules`, `dist`, and `.astro`
- `content-archive/` is NOT ignored; it stays in version control as project reference material

If the Astro starter wants to overwrite or delete anything that already exists in `prana-site/`, stop and ask before proceeding.

### 2. Connect to GitHub and push initial commit

Remote: `https://github.com/ConstanceIT/prana-website` (empty, no default branch yet).

Set up `main` as the default branch locally, add the remote, make the first commit (`chore: initialize astro project`), and push. Do not squash existing non-code files into this commit; include `CLAUDE.md`, `prompts/02-project-setup-and-home.md`, and `content-archive/` in the initial commit alongside the fresh Astro scaffold. Subsequent commits in this task should be small and focused (tokens, layout, each section, a11y pass, deploy config — roughly).

### 3. Configure GitHub Pages deployment

Set up Astro for GitHub Pages deployment via GitHub Actions. Use the official `withastro/action` workflow. The site is not going live to a public audience until the in-house scheduler ships, but I want previews on every push to `main`, so wire deployment up now. Set `site` in `astro.config.mjs` to the GitHub Pages URL for this repo. Leave `base` unset unless the Pages setup specifically requires it.

Commit the workflow file as its own commit.

### 4. Set up the design token system

Create `src/styles/tokens.css` with CSS custom properties on `:root`. These are the locked tokens for the entire site; every component from here on references them, never hard-coded hex values or px values. Token set below. Import `tokens.css` once from the base layout (Part B) so it cascades to every page.

**Color tokens** (sourced from the Prana studio interior photography, not the current site's live CSS):

```
--color-cream:         #EBE3D4   /* page background */
--color-warm-white:    #F5EFE2   /* lighter surface, card backgrounds */
--color-espresso:      #574237   /* primary body text */
--color-deep-brown:    #3A2A22   /* headings and strong emphasis */
--color-terracotta:    #B9755A   /* primary accent, CTAs, link hover */
--color-sage:          #7C8C6E   /* secondary accent, subtle tags */
--color-golden:        #E8D5A8   /* tertiary accent, highlights */
--color-placeholder:   #C8BFB1   /* placeholder image fill */
--color-hairline:      rgba(87, 66, 55, 0.14)   /* fine dividers */
```

Verify contrast: espresso on cream is ~8.5:1, deep-brown on cream is ~11:1, terracotta on warm-white is ~4.6:1 (for large text and UI). Body text must meet 4.5:1, large text and UI components 3:1. If any pairing fails, flag it rather than fudging the palette.

**Typography tokens.** Two typefaces, both from Google Fonts, both self-hosted via `<link>` in the base layout `<head>` with `display=swap`:

- **Cormorant Garamond** for display headings. Weights 300, 400, 500. This is the brand voice typeface and pairs with the Prana logo better than Playfair does. Use it for h1/h2/h3 and for rare pull-quote moments. Do not use it for body or UI text.
- **Inter** for body, UI, eyebrows, captions, forms, and navigation. Weights 400, 500, 600. Letterspaced and uppercase for eyebrows; sentence case for everything else.

```
--font-display: "Cormorant Garamond", Georgia, "Times New Roman", serif;
--font-body:    "Inter", system-ui, -apple-system, sans-serif;
```

**Type scale** (fluid with `clamp()` so it breathes between mobile and desktop):

```
--size-eyebrow:  0.75rem           /* 12px, uppercase, tracked 0.18em */
--size-body-sm:  0.9375rem         /* 15px */
--size-body:     1.0625rem         /* 17px — base reading size */
--size-body-lg:  1.1875rem         /* 19px — lead paragraphs */
--size-h3:       clamp(1.625rem, 2vw + 1rem, 2.25rem)
--size-h2:       clamp(2.25rem, 3vw + 1rem, 3.75rem)
--size-h1:       clamp(3rem, 5vw + 1rem, 6rem)
--line-tight:    1.05               /* display headings */
--line-snug:     1.3                /* sub-headings */
--line-body:     1.6                /* body paragraphs */
--tracking-eyebrow: 0.18em
```

**Spacing scale** (4px base, use these not raw pixel values):

```
--space-xxs:  0.25rem   /* 4  */
--space-xs:   0.5rem    /* 8  */
--space-sm:   0.75rem   /* 12 */
--space-md:   1rem      /* 16 */
--space-lg:   1.5rem    /* 24 */
--space-xl:   2rem      /* 32 */
--space-2xl:  3rem      /* 48 */
--space-3xl:  4.5rem    /* 72 */
--space-4xl:  6rem      /* 96 */
--space-5xl:  9rem      /* 144 */
--space-6xl:  12rem     /* 192 */
```

**Layout tokens:**

```
--content-max:       78rem   /* 1248px — outer content width */
--content-narrow:    42rem   /* 672px  — prose columns */
--radius-sm:  4px
--radius-md:  8px
--radius-lg:  16px
--ease-out:   cubic-bezier(0.2, 0.7, 0.1, 1)
--dur-fast:   180ms
--dur-med:    320ms
--dur-slow:   520ms
```

### 5. Reset and base styles

Create `src/styles/reset.css` (minimal modern reset — not Normalize, not Eric Meyer's 2007 reset, something current like a trimmed version of Josh Comeau's reset or Andy Bell's modern CSS reset; use Context7 if needed). Then `src/styles/base.css` for element defaults: body background `--color-cream`, body text `--color-espresso` at `--size-body`/`--line-body` in `--font-body`, headings in `--font-display` with `--color-deep-brown`, link colors, focus styles (always visible, thick, `--color-terracotta` outline with offset), selection color, `prefers-reduced-motion` global rule.

Import order in the base layout: `tokens.css` → `reset.css` → `base.css` → page/component styles.

### 6. Placeholder image component

Several images on the new site (especially team photos, which are coming from Prana later) will not be available when a page is first built. Create a reusable `PlaceholderImage.astro` component that renders a clearly-marked placeholder at a given aspect ratio, without looking like a broken image or a stock gray rectangle.

Spec:

- Props: `width`, `height` (or `ratio`), `label` (short descriptor like "team photo — Sarah R."), `alt` (accessibility alt text, required).
- Renders a `<div>` with background `--color-placeholder`, a subtle dashed `--color-hairline` inner border (inset 8px), the label centered in Inter 500 at `--size-body-sm` in `--color-espresso`, and a small eyebrow reading "PLACEHOLDER" above the label.
- Honors the passed aspect ratio using `aspect-ratio` CSS.
- Exposes `alt` to a visually-hidden `<span>` so screen readers get real alt text.
- Motion: none.

Use this component anywhere a real asset isn't yet available. On Home, the only place you'll actually need it is the Story Teaser portrait (see section 4 below).

### 7. Base layout and `<head>`

Create `src/layouts/BaseLayout.astro` with:

- `<html lang="en">`
- Standard meta (charset, viewport with `width=device-width, initial-scale=1`)
- Per-page `<title>`, `<meta name="description">`, canonical, OG tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`), Twitter card tags (`twitter:card=summary_large_image`, title, description, image) — all taking values from frontmatter props with sensible fallbacks
- Google Fonts preconnect + stylesheet for Cormorant Garamond (300, 400, 500) and Inter (400, 500, 600) with `display=swap`
- Favicon slot (leave a reasonable default; real favicon comes later)
- A `<slot name="jsonld" />` for page-specific JSON-LD schema blocks
- Skip-link anchor: `<a href="#main">Skip to content</a>` (visually hidden until focused)
- `<header>` nav slot and `<footer>` slot

Also generate `public/robots.txt` (disallow nothing, reference the sitemap) and wire `@astrojs/sitemap` so `sitemap.xml` is produced on build.

### 8. Site header and footer

These ship with the base layout, not with the Home page, because they'll appear on every page.

**Header.** Fixed or sticky at the top of the viewport, not pinned on scroll-up tricks — just a clean always-visible bar. Background `--color-cream` with a `--color-hairline` bottom border. Height around 72px desktop, 60px mobile. Left side: the Prana wordmark logo (use `content-archive/images/home/logo.png`, copy to `public/images/`, render at ~120px wide). Right side on desktop: inline nav links in Inter 500, `--size-body-sm`, color `--color-espresso`, hover `--color-terracotta`, spacing `--space-lg` between items. Final item is a "Book a Class" button (primary style — see below). On tablet and mobile, collapse to a hamburger on the right that opens a full-screen overlay menu with the same links stacked in Cormorant Garamond at around `--size-h3`, centered, with the Book a Class button at the bottom. Animate open/close with a fade + slight slide, respecting `prefers-reduced-motion`.

Nav links (order): **Home · The Studio · Classes · Memberships · Team · Private Events · Book a Class** (button).

For this task, only Home needs to render. The other routes can be stub Astro pages that each just set a title and render an `<h1>` reading "Coming soon" (Claude Code may use "Coming soon" — this is mechanical, not marketing copy). This keeps the nav working without inventing content.

**Footer.** Three-column on desktop, stacked on mobile. Background `--color-deep-brown`, text `--color-warm-white`.

- Column 1: Prana wordmark (invert or use a light version of the logo — if an inverted version doesn't exist, set `filter: invert(1)` with a flag in the component and I'll supply a real version later). Below it, the tagline "Move with intention. Rest with purpose." in Cormorant Garamond, `--size-body-lg`, `--color-warm-white`.
- Column 2: secondary nav (The Studio, Classes, Memberships, Team, Private Events, Blog, Contact), Inter 400, `--size-body-sm`.
- Column 3: contact block.
  - Address: `1621 E 7th St, Austin, TX 78702` (this is the canonical address — use it everywhere, do not substitute anything else from the content archive without flagging)
  - Email: `hello@pranawellness.love` — use this everywhere. Do NOT use `info@`.
  - Hours: placeholder text reading "Hours — coming soon" for now (I'll supply real hours in a later prompt)
  - Small social icon row (Instagram, YouTube). Icons as inline SVG, no icon font.
- Bottom strip, full-width, separated by a hairline: copyright line "© 2026 Prana Wellness Club" and three small links to Privacy, Terms, Accessibility (these will be real pages later).

---

## Part B — The Home Page

Route: `src/pages/index.astro`. Uses `BaseLayout`. Below is the full section-by-section spec with copy, assets, layout, and styling intent.

### SEO metadata for Home

```
title:        Prana Wellness Club — Austin Pilates, Yoga, and Recovery
description:  A boutique Austin wellness studio for Reformer Pilates, Mat Pilates, and yoga, with sauna, steam, and cold plunge recovery. Move with intention. Rest with purpose.
og:image:     /images/og/home.jpg        (see note below)
canonical:    the home URL on the deployed GitHub Pages site
```

For `og:image`, use `content-archive/images/home/studio-ambient.a651b75d.jpg` — copy it to `public/images/og/home.jpg` as part of this task. No need to resize for now; flag it if it's absurdly large and I'll supply a compressed version.

**JSON-LD.** Include a `LocalBusiness` schema block in the `jsonld` slot on Home:

- `@type`: `"HealthClub"` (more specific than plain LocalBusiness)
- `name`: `"Prana Wellness Club"`
- `address`: structured postal address for 1621 E 7th St, Austin, TX 78702, US
- `telephone`: leave `null`/omitted for now, I'll supply
- `email`: `hello@pranawellness.love`
- `url`: the canonical Home URL
- `image`: same OG image URL
- `priceRange`: `"$$"`
- `geo`: latitude and longitude for the studio. Look up accurate coordinates for `1621 E 7th St, Austin, TX 78702` via Playwright or Google Maps rather than approximating. If you can't confirm, flag and leave as a TODO.
- `openingHoursSpecification`: omit with a TODO comment; real hours coming later

### Section 1 — Hero

The hero is the whole first screen. Not a stats sandwich, not a rotating carousel, not a centered-card-with-a-button. Full-bleed background video, single line of oversized display copy anchored bottom-left with generous margin, single primary CTA underneath. Quiet, confident, filmic. That's it.

**Background.** Looping muted autoplay video: copy `content-archive/videos/home/hero-bg.mp4` to `public/videos/home/hero-bg.mp4`. Also copy the `.mov` version as a fallback source. Render with `<video autoplay muted loop playsinline preload="metadata">` and a poster frame. Generate a poster frame by copying `content-archive/images/home/studio-ambient.a651b75d.jpg` to `public/images/home/hero-poster.jpg` and referencing it as the `poster`. Users who `prefers-reduced-motion` should see the poster image only (no autoplay video). Never let the video block the first paint; the poster must render immediately.

Over the video, a subtle dark gradient overlay that runs from roughly 35% opacity deep-brown at the bottom to 0% at ~55% height, so text at the bottom remains legible without flattening the whole image. No full-screen overlay tint.

**Height.** `min-height: 88svh` on desktop, `88svh` on mobile. Never `100vh` (breaks on mobile with dynamic toolbars).

**Content, bottom-left, inside `--content-max` with `--space-2xl` horizontal padding:**

Eyebrow (Inter 500, `--size-eyebrow`, uppercase, tracked `--tracking-eyebrow`, `--color-warm-white`):

> AUSTIN · EST. 2024

Headline (Cormorant Garamond 300, `--size-h1`, `--line-tight`, `--color-warm-white`, max-width ~14ch so it breaks into two or three lines):

> Move with intention.
> Rest with purpose.

This is the brand tagline and it is THE headline on Home. Do not rewrite it, do not split it differently, do not set it in all caps, do not add a third line. Let it breathe.

Beneath the headline, a single short supporting line (Inter 400, `--size-body-lg`, `--color-warm-white` at 85% opacity, max-width ~48ch):

> A boutique Austin studio for Pilates, yoga, and recovery.

Beneath that, after `--space-xl` of space, one primary CTA button linking to `/book` (a real route the Book page will later occupy):

> Book a Class

**Scroll hint.** A small centered label + hairline stroke at the very bottom center reading "SCROLL" in Inter 500 eyebrow styling. Animates a gentle 6px vertical loop that pauses on `prefers-reduced-motion`. Resist adding anything else to the hero.

### Section 2 — Welcome

A purely typographic moment, no images. Sets up the voice and immediately gives the page air after the hero.

Background: `--color-cream`. Top padding `--space-6xl` desktop, `--space-4xl` mobile. Bottom padding matches. Content centered within `--content-narrow`.

Eyebrow (centered):

> WELCOME TO PRANA

Headline (centered, Cormorant Garamond 400, `--size-h2`, `--line-tight`, max-width ~20ch):

> A studio built around how you actually want to feel.

Two short paragraphs beneath, Inter 400, `--size-body`, `--line-body`, `--color-espresso`, left-aligned within the narrow column:

> Prana is a boutique wellness club in South Austin. Reformer and Mat Pilates, vinyasa, hatha, yin, recovery. All of it under one roof, all of it taught by people who live in this neighborhood and want you to keep coming back.

> We built the studio the way we wished one existed when we were tired of fluorescent gyms and chain yoga rooms. Warm wood, real plants, natural light, equipment that actually holds up, teachers who learn your name. Come once and you'll get it.

No button in this section. The room should read like a book page, not a landing page.

### Section 3 — What Prana Offers

Three tiles laid out as a 3-column grid on desktop, 1-column stack on mobile, 2-column with a stacked third on tablet. Generous gap (`--space-xl`). Each tile is image-forward: roughly 5:6 portrait image on top, label and short description below. No rounded corners beyond `--radius-sm`. No drop shadows. No hover lift; instead, on hover the image slowly warms (0.97 brightness → 1.02 brightness over `--dur-slow`) and the label shifts color from `--color-deep-brown` to `--color-terracotta`. All hover behaviors have non-hover equivalents and respect `prefers-reduced-motion`.

Section eyebrow: `WHAT WE OFFER`. Section heading (Cormorant Garamond 400, `--size-h2`): `Three ways to show up.` Section sits in the `--color-cream` background with `--space-5xl` top/bottom padding.

**Tile 1 — Yoga**

- Image: `content-archive/images/home/yoga-card.6a5cf130.jpg` → copy to `public/images/home/yoga-card.jpg`
- Eyebrow (above label): `01 — PRACTICE`
- Label (Cormorant Garamond 500, `--size-h3`): `Yoga`
- Description (Inter 400, `--size-body`, `--line-body`):
  > Heated and unheated vinyasa, hatha, yin, and slow flow. Morning sessions, lunch breaks, and Wine Down Wednesdays. Open to every level.
- Small text link under description: `See the schedule →` linking to `/classes`

**Tile 2 — Pilates**

- Image: `content-archive/images/home/pilates-card.86b40b86.jpg` → copy to `public/images/home/pilates-card.jpg`
- Eyebrow: `02 — STRENGTHEN`
- Label: `Pilates`
- Description:
  > Reformer and mat classes built around posture, core, and long muscle tone. Small group sizes so instructors can actually adjust your form.
- Link: `See the schedule →` to `/classes`

**Tile 3 — The Space**

- Image: `content-archive/images/space/wooden-reformers.a2583105.jpg` → copy to `public/images/home/space-card.jpg`. If Claude Code thinks a warmer image like `club-space.89464b79.jpg` (elixir bar, butterscotch leather, green tile) is a better fit for a recovery-themed tile, swap it and note the choice in the commit message. Flag rather than going back and forth.
- Eyebrow: `03 — RESTORE`
- Label: `The Space`
- Description:
  > Sauna, steam, cold plunge, and a quiet lounge to come down from the heat. Included with membership, open to class guests.
- Link: `Tour the studio →` to `/studio`

### Section 4 — Our Story Teaser

Editorial, asymmetric. Not a two-column card grid. On desktop, a single loose grid with an offset portrait-style image on the left (spanning roughly columns 1–5 of a 12-column track) and the copy block on the right (columns 7–11), with the image extending below the baseline of the copy so the composition feels unbalanced on purpose. On mobile, image on top at full width, copy beneath with generous side padding.

Background: `--color-warm-white`. Padding `--space-6xl` top and bottom on desktop.

**Image.** Since we don't yet have a specific portrait of the founder or team, use the `PlaceholderImage` component at a 4:5 aspect ratio with:

- `label`: `"Founder portrait — to be supplied"`
- `alt`: `"Placeholder image for a portrait of the Prana Wellness Club founder"`

Do NOT substitute a random studio photo here. The placeholder is doing work — it tells me, visually, that an asset is owed.

**Copy.**

Eyebrow: `OUR STORY`

Headline (Cormorant Garamond 400, `--size-h2`, `--line-tight`, max-width ~15ch):

> A place to come back to.

Body paragraph (Inter 400, `--size-body-lg`, `--line-body`, max-width ~44ch):

> Prana started as a small idea between friends who were tired of practicing in rooms that felt nothing like the practice. Today it's a full studio in South Austin where the reformers are wooden, the plants are real, and the people at the front desk actually remember your name.

Secondary paragraph (Inter 400, `--size-body`, `--line-body`, `--color-espresso`, max-width ~44ch):

> We think of ourselves less like a gym and more like a third place. Somewhere between your home and your work where the only agenda is to feel better than you did when you walked in.

Link at the bottom of the copy column, styled as a ghost/outline link rather than a button: `Read the full story →` linking to `/studio`.

Pull quote element floating in the gutter between image and copy on desktop, set in Cormorant Garamond 400, `--size-h3`, `--line-snug`, `--color-terracotta`, max-width ~18ch, with a thin `--color-hairline` top border and `--space-sm` padding-top:

> "We wanted a room that felt like it exhaled when you walked in."

On mobile, the pull quote drops below the headline and above the body paragraph.

### Section 5 — Featured Classes

Four compact class cards in a horizontal row on desktop (1×4), 2×2 on tablet, stacked on mobile with horizontal snap-scroll as an alternative if stacking gets too tall. Cards share the same skeleton: landscape 3:2 image, eyebrow (class category), title (Cormorant Garamond 500, `--size-h3`), one-line description (Inter 400, `--size-body-sm`), two small meta rows (duration and heat level), small `View class →` link.

Background: `--color-cream`. Padding `--space-5xl` top/bottom.

Section eyebrow: `ON THE SCHEDULE` · Section heading: `Classes worth showing up for.`

Use `PlaceholderImage` for all four class card images for now (I'll supply specific stills in a later prompt). Each placeholder's `label` should read `"Class photo — [class name]"` and `alt` should be `"Placeholder image for the [class name] class"`.

**Card 1**
- Eyebrow: `VINYASA`
- Title: `Heated Vinyasa`
- Description: `A flowing, breath-led practice in a warm room. Builds strength, sweat, and stillness in equal measure.`
- Meta: `60 MIN` · `HEATED 95°F`
- Link: `View class →` to `/classes/heated-vinyasa`

**Card 2**
- Eyebrow: `PILATES`
- Title: `Pilates Reformer`
- Description: `Small-group Reformer work focused on posture, control, and long muscle tone. Great for first-timers and regulars.`
- Meta: `50 MIN` · `NEUTRAL`
- Link: `View class →` to `/classes/pilates-reformer`

**Card 3**
- Eyebrow: `YIN`
- Title: `Yin`
- Description: `Long holds, deep breath, and quiet mats. A reset for anyone living in their shoulders or their phone.`
- Meta: `75 MIN` · `WARM 80°F`
- Link: `View class →` to `/classes/yin`

**Card 4**
- Eyebrow: `STRENGTH`
- Title: `Strength & Mobility Flow`
- Description: `Loaded strength work woven into a mobility practice. For when you want yoga to hit like a training session.`
- Meta: `55 MIN` · `NEUTRAL`
- Link: `View class →` to `/classes/strength-mobility-flow`

Below the four cards, centered, a secondary CTA button: `See all classes` linking to `/classes`.

### Section 6 — The Space Teaser

Full-bleed immersive moment. One wide image (or looping video if it fits without hurting performance) breaks the column grid and runs edge to edge.

Background: image/video fills the full viewport width. Above it sits a caption block anchored bottom-left, similar to the hero but quieter.

**Media.** First choice: `content-archive/videos/home/space-card.mp4` → copy to `public/videos/home/space-card.mp4`. If it's over ~8MB or chokes on mobile, fall back to `content-archive/images/space/club-space.89464b79.jpg` (elixir bar with butterscotch leather and green glazed tile) copied to `public/images/home/space-teaser.jpg`. Flag the decision in the commit message.

**Caption block** (bottom-left, inside `--content-max` with `--space-2xl` padding, light text on a subtle bottom gradient overlay like the hero but thinner):

Eyebrow (`--color-warm-white`): `THE SPACE`

Headline (Cormorant Garamond 400, `--size-h2`, `--color-warm-white`, max-width ~14ch):

> Heat. Cold. Quiet.

Body (Inter 400, `--size-body`, `--color-warm-white` at 85%, max-width ~40ch):

> An infrared sauna, a cold plunge, a steam room, and a lounge with the best elixir bar in town. Our recovery space is included with every membership.

Ghost link: `See the space →` linking to `/studio`.

Section height around `70svh` desktop, `60svh` mobile. Do not set `100vh`.

### Section 7 — Membership Invitation

Quiet, conversion-minded, not pushy. Two-column on desktop (copy left, image right), stacked on mobile with image above copy.

Background: `--color-cream`. Padding `--space-5xl` top/bottom.

**Image.** `content-archive/images/home/membership-bg.ca5207e3.jpg` → copy to `public/images/home/membership.jpg`. Render at 4:5 portrait on desktop, 16:9 on mobile.

**Copy** (left column, `--content-narrow` prose width):

Eyebrow: `MEMBERSHIP`

Headline (Cormorant Garamond 400, `--size-h2`):

> One membership. The whole studio.

Body:

> Unlimited classes across yoga, Pilates, and Reformer. Full access to the sauna, steam room, and cold plunge. First dibs on events and workshops. Cancel any time.

Small founding-member note in Inter 500 uppercase eyebrow styling, `--color-terracotta`:

> NOW ACCEPTING FOUNDING MEMBERS

Primary button: `See membership options` linking to `/memberships`.
Secondary ghost link underneath: `Or book a single class →` linking to `/book`.

### Section 8 — Find Us

Location section with an embedded Google Map. Two-column on desktop (info block left, map right), stacked on mobile.

Background: `--color-cream` or `--color-warm-white` — pick whichever creates better contrast against the previous section (flag the choice). Padding `--space-5xl` top/bottom.

**Info block** (left):

Eyebrow: `FIND US`

Headline (Cormorant Garamond 400, `--size-h2`):

> East Austin, on 7th.

Address block, Inter 400, `--size-body-lg`, `--color-espresso`:

> 1621 E 7th St
> Austin, TX 78702

Hours block (Inter 400, `--size-body`, `--color-espresso`) — use this placeholder structure until I supply real hours:

> Hours — to be confirmed

Contact row (Inter 400, `--size-body`):

> Email: hello@pranawellness.love

Primary button: `Get directions` — opens Google Maps in a new tab at the studio address. Secondary ghost link: `Questions? Contact us →` to `/contact`.

**Map embed** (right). Use a Google Maps `<iframe>` embed set to the studio address. Important constraints:

- Wrap the iframe in a container with `aspect-ratio: 4/5` on desktop and `1/1` on mobile, `border: 1px solid var(--color-hairline)`, `border-radius: var(--radius-md)`, `overflow: hidden`.
- `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, `title="Map of Prana Wellness Club at 1621 E 7th St, Austin, TX"`.
- Use the standard Google Maps embed URL format with the address as the query. No API key required for the standard embed iframe.
- If the exact address can't be confirmed from the content archive, stop and ask rather than embedding the wrong spot on the map.

Do not include a full-width map section below this. The embedded iframe IS the map; there's no second map.

---

## Cross-cutting Requirements

### Responsive

Design and build mobile-first. Every section above must look and behave well at 360px, 768px, and 1280px minimum. No horizontal scroll on mobile. Touch targets at least 44px. Nav collapses to a hamburger below 1024px.

### Accessibility

WCAG AA contrast on every pairing. Keyboard reach every interactive element. Visible focus state everywhere, thick, `--color-terracotta` outline. Skip link works. Images have real alt text (placeholder images have appropriate placeholder alt). Video has a poster image and respects `prefers-reduced-motion`. Semantic headings: exactly one `<h1>` on the page, and that `<h1>` is the hero tagline "Move with intention. Rest with purpose." Every section heading is `<h2>`; tile labels are `<h3>`. Do NOT style headings with the wrong element — use `<p>` or `<span>` for decorative large text.

### Performance

Hero video must not block paint. Poster shows instantly. Fonts load with `display=swap`. All `<img>` tags include `width`, `height`, and `loading="lazy"` (except any image that sits above the fold on initial mobile load — those stay eager). Use Astro's `<Image>` component where it helps. Flag any image from the archive that's absurdly large (> 1.5MB) rather than shipping it.

### Copy

Every word a visitor reads on Home is in this prompt. Do not write new copy. Do not alter any copy in this prompt. If a section needs copy you don't have, stop and ask. Form placeholder text doesn't apply here because Home has no forms.

### Motion

Quiet. Nothing that calls attention to itself. No parallax. No scroll-triggered headline assembly. No section entry "fades in from below." The only motion on the page is: the hero video, the scroll hint bobbing, the gentle image warmth change on tile hover, the nav overlay open/close, and the primary button's subtle background shift on hover/focus. All motion respects `prefers-reduced-motion`.

### Commits

Roughly this cadence (adjust as needed, keep each commit focused):

1. `chore: initialize astro project`
2. `chore: configure github pages deployment`
3. `feat(tokens): add design tokens, reset, and base styles`
4. `feat(layout): add base layout with seo meta and json-ld slot`
5. `feat(header-footer): add site header and footer`
6. `feat(home): hero section`
7. `feat(home): welcome section`
8. `feat(home): what we offer tiles`
9. `feat(home): our story teaser`
10. `feat(home): featured classes`
11. `feat(home): the space teaser`
12. `feat(home): membership invitation`
13. `feat(home): find us with map embed`
14. `fix(a11y): pass from audit skill`

### Final review

Before declaring done, run an `audit` pass on the Home page for accessibility, performance, and responsive behavior, and a `critique` pass for design-level feedback. Verify with Playwright at 360px, 768px, and 1280px that each section renders correctly, no horizontal scroll, no layout breaks, no images missing, and the hero video has a visible poster before playback. Share screenshots or Playwright output in the response so I can verify from my side.

---

## Questions to Raise Before Starting (If Any)

If any of the following are unclear, stop and ask instead of guessing:

- The studio address is locked at `1621 E 7th St, Austin, TX 78702`. Flag only if something in the content archive actively contradicts it, but default to this address regardless.
- Whether the hero video format choice (`.mp4` primary, `.mov` fallback) is correct for GitHub Pages bandwidth.
- Whether the `.mp4` files exceed a size that would hurt initial load; if so, recommend compression targets and flag.
- Whether an inverted/light logo file exists in `content-archive/` for use in the dark footer.
- Anything in this prompt that conflicts with `CLAUDE.md`.

Everything else: use your judgment, reach for the design skills, and build it the way a senior human designer would defend it.
