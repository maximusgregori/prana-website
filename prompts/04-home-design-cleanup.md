# 04 — Home page design cleanup

The Home page deployed and works structurally, but the design has real problems that need a dedicated cleanup pass before we move on to any other page. This prompt is the fix. Twelve items, grouped so you can commit incrementally.

Read `CLAUDE.md` and prompt `02-project-setup-and-home.md` before starting so the voice, design language, and tokens are fresh. Run `/impeccable teach` if the session doesn't already have it loaded. Reach for `typeset`, `arrange`, `colorize`, `adapt`, and `audit` as each item calls for them.

Do NOT introduce new tokens, new fonts, new colors, or new components outside of what this prompt specifies. If something here conflicts with `CLAUDE.md` or prompt 02, flag it instead of picking a side silently.

All asset and route references must go through `withBase()` per prompt 03. Don't regress.

---

## 1. New header — three-part floating composition with adaptive color

Delete the current sticky bar header entirely. Rebuild the header as three separate floating elements positioned absolutely over the hero on desktop, with backdrop-blur glass treatments. The header should NOT take flow space anymore — the hero becomes full-viewport because there's no bar pushing it down.

### Structure

Three floating elements, all `position: fixed` at `top: 24px`, all with `z-index` above the hero:

**A. Logo (top-left)**

Replace the `<img>` PNG logo in the header with a text wordmark. Render the word `Prana` as an `<a href={withBase('/')}>`, set in `var(--font-display)` Cormorant Garamond 400 at around `28px`, no letter-spacing tweaks, color driven by a CSS custom property `--header-fg` that we'll flip based on scroll position. Position: `fixed; top: 24px; left: var(--space-xl)`. This completely replaces the PNG logo in the header — we keep the PNG for the footer only. This solves the "light logo invisible on cream bar" problem by not using the PNG at all in the header.

**B. Nav pill (top-center)**

A single floating pill containing the six routable nav links (Home, The Studio, Classes, Memberships, Team, Private Events). The "Book a Class" CTA does NOT go inside this pill — it lives separately in element C. Structure:

```astro
<nav class="nav-pill" aria-label="Primary">
  <ul>
    <li><a href={withBase('/')}>Home</a></li>
    <li><a href={withBase('studio')}>The Studio</a></li>
    <li><a href={withBase('classes')}>Classes</a></li>
    <li><a href={withBase('memberships')}>Memberships</a></li>
    <li><a href={withBase('team')}>Team</a></li>
    <li><a href={withBase('private-events')}>Private Events</a></li>
  </ul>
</nav>
```

Styling:

- `position: fixed; top: 24px; left: 50%; transform: translateX(-50%);`
- `background: rgba(245, 239, 226, 0.08);` over hero, `rgba(58, 42, 34, 0.06)` in light mode (driven by the same `--header-bg` variable we'll flip)
- `backdrop-filter: blur(20px) saturate(1.1); -webkit-backdrop-filter: blur(20px) saturate(1.1);`
- `border: 1px solid var(--header-border);` (hairline that flips with mode)
- `border-radius: 999px;`
- `padding: 10px 20px;`
- Inner `<ul>`: `display: flex; gap: var(--space-lg); list-style: none; margin: 0; padding: 0;`
- Links: `var(--font-body)` Inter 500, `14px`, `letter-spacing: 0.02em`, color `var(--header-fg)`, no underline, `padding: 6px 4px`, transition color 180ms ease.
- Link hover: `color: var(--color-terracotta);` (same in both modes — terracotta reads on both cream and dark)
- Focus-visible: terracotta outline, 2px offset.

**C. Button pair (top-right)**

Two pill buttons side-by-side, floating `top: 24px; right: var(--space-xl);`. Inner `gap: var(--space-sm)`.

- **Memberships** — ghost pill. `background: transparent; border: 1px solid var(--header-fg); color: var(--header-fg); border-radius: 999px; padding: 10px 20px; font: 500 14px/1 var(--font-body); letter-spacing: 0.02em;`. Hover: `background: var(--header-fg); color: var(--header-bg-solid);` (inverts on hover).
- **Book a Class** — solid primary pill. `background: var(--color-terracotta); border: 1px solid var(--color-terracotta); color: var(--color-warm-white); border-radius: 999px; padding: 10px 20px; font: 500 14px/1 var(--font-body); letter-spacing: 0.02em;`. Hover: `background: #a0624a;` (slightly darker terracotta), `border-color: #a0624a`.

Both buttons use `withBase()` for their hrefs (`memberships` and `book`).

### Adaptive color via IntersectionObserver

The floating header lives over two visual modes:

- **Over the hero (dark mode)** — cream text, cream hairlines, translucent-cream glass
- **Over everything else (light mode)** — deep-brown text, deep-brown hairlines, translucent-deep-brown glass

Use a single JS IntersectionObserver watching the hero section. When the hero is intersecting the viewport (any amount ≥ 10%), set `document.documentElement.dataset.headerMode = 'dark'`. Otherwise set `'light'`. CSS then drives everything off these two custom properties:

```css
:root[data-header-mode="dark"] {
  --header-fg: var(--color-warm-white);
  --header-bg: rgba(245, 239, 226, 0.08);
  --header-bg-solid: var(--color-deep-brown);
  --header-border: rgba(245, 239, 226, 0.35);
}
:root[data-header-mode="light"] {
  --header-fg: var(--color-deep-brown);
  --header-bg: rgba(58, 42, 34, 0.06);
  --header-bg-solid: var(--color-warm-white);
  --header-border: rgba(58, 42, 34, 0.18);
}
```

Default (before JS runs): dark mode. The IntersectionObserver goes in a small inline `<script>` in `BaseLayout` or as a component script. Keep it under 20 lines. Respect `prefers-reduced-motion` by not animating the transition in that mode, but still flip colors.

Transition: color and background changes should use a ~320ms ease transition so the flip feels intentional rather than jumpy.

### Mobile behavior

Below 900px, the three-part composition collapses. On mobile:

- Logo floating top-left (same as desktop)
- A single circular "menu" pill floating top-right: 44×44px, `border-radius: 999px`, containing a small hamburger icon (three horizontal lines). Same backdrop-blur treatment.
- No nav pill in the middle.
- No CTA button pair in the corner.
- Tapping the hamburger opens a full-screen overlay menu (like prompt 02 described, but updated): cream background with subtle film grain or none at all, nav links stacked and centered in Cormorant Garamond ~36px, and the two CTA buttons (Memberships ghost, Book a Class primary) stacked at the bottom of the overlay. Close button top-right.

---

## 2. Hero fixes

The hero currently has a white strip at the bottom, a single button, and low-contrast supporting text. Fix all of it.

**2a. Full viewport.** Now that the header is floating (no flow space), change the hero's `min-height` from `88svh` to `100svh`. The video should fill the entire initial viewport edge-to-edge with no cream gap below it.

**2b. Stronger bottom gradient.** The current gradient is too light, which is why text blends. Change the overlay to:

```css
background: linear-gradient(
  to top,
  rgba(58, 42, 34, 0.75) 0%,
  rgba(58, 42, 34, 0.45) 35%,
  rgba(58, 42, 34, 0.05) 70%,
  transparent 100%
);
```

This grounds the headline without flattening the video.

**2c. Tighten the headline composition.** The AUSTIN · EST. 2024 eyebrow currently floats far above the headline. Cut that gap to `var(--space-xs)` so eyebrow sits right on top of the headline as a tight nameplate. Keep the headline bottom-left anchored inside `--content-max` with `padding-inline: var(--space-2xl)` and `padding-bottom: var(--space-3xl)`.

**2d. Raise the supporting line.** The line "A boutique Austin studio for Pilates, yoga, and recovery." currently renders at `--color-warm-white` with opacity 0.85. Bump to full opacity (no alpha) and size `--size-body-lg`. Keep max-width ~48ch.

**2e. Two buttons, side by side.**

Replace the single "Book a Class" button with a button row containing two pill buttons:

- **Book a Class** — primary terracotta pill. Same pill styling as the header CTA (`border-radius: 999px`, padding 14px 28px, `font: 500 15px/1 var(--font-body)`, `letter-spacing: 0.02em`). `background: var(--color-terracotta); color: var(--color-warm-white);`. Links to `book`.
- **Memberships** — ghost pill with cream border + cream text. `background: transparent; border: 1px solid var(--color-warm-white); color: var(--color-warm-white);`. Same pill sizing. Hover: fill with cream, switch text to deep-brown. Links to `memberships`.

Desktop: side-by-side with `gap: var(--space-md)`. Mobile: stacked vertically with `gap: var(--space-sm)`, each button full-width of the content column.

**2f. Delete the scroll hint entirely.** Remove the "SCROLL" label and its animation. The page doesn't need to tell the user to scroll.

**2g. H1 rendering.** The current H1 reads "Move with intention.Rest with purpose." (no space between sentences) because of a missing `<br>` or line-height collapse. Verify the markup renders as two lines with clean whitespace. If you're using a `<br>`, keep it. If you're using block-level spans, make sure they collapse cleanly with `white-space: pre-line` or equivalent.

---

## 3. Welcome section — center the body paragraphs

Currently the H2 "A studio built around how you actually want to feel." is `text-align: center` but both body paragraphs below it are `text-align: left`. Center-align both paragraphs to match the heading. Keep them within `--content-narrow` (42rem), same max-width as now. Nothing else changes in this section.

---

## 4. Our Story — rebuild, don't patch

This section has six different font sizes, a gray placeholder image, a cramped text column, and a pointless "Read the full story →" link. Rebuild it per the following spec. No patching the old version.

**4a. Replace the placeholder with a real image.**

Copy `content-archive/images/home/story-bg.fde8c79a.jpg` to `public/images/home/story.jpg` and render it via a real `<img>` (not PlaceholderImage), rendered at a 4:5 aspect ratio. Width on desktop around 420px (shrunk from the current 492px), width on mobile full container. The image file is ~2.6MB — flag if this slows the page noticeably; compression is owed but not blocking.

**4b. Widen the text column.**

Currently the text column is 492px wide — the same as the image, which is why it feels cramped. Expand the text column to roughly `560–600px` wide on desktop. In a 12-column grid on `--content-max` (1248px), that means the image takes roughly columns 1–4 and the text takes columns 6–11 (or similar asymmetric split). On mobile, stack image on top, text full-width below.

**4c. Lock the section to exactly four text sizes.**

Every text element in this section uses one of these four treatments. No exceptions, no "just this one time" tweaks.

- **Eyebrow** "OUR STORY" — Inter 500, 12px, tracked `0.18em`, uppercase, `var(--color-terracotta)`. Matches all other section eyebrows on the page.
- **Heading** "A place to come back to." — `var(--font-display)` Cormorant Garamond 400, `var(--size-h2)` fluid, line-height `var(--line-tight)`, color `var(--color-deep-brown)`, max-width ~15ch.
- **Body paragraphs** — Inter 400, **`var(--size-body)` (17px)**, line-height `var(--line-body)`, color `var(--color-espresso)`. Both paragraphs use this exact treatment. No `--size-body-lg` on the first one. Same size for both. This is the fix for the 19/17 split.
- **Pull quote** "We wanted a room that felt like it exhaled when you walked in." — `var(--font-display)` Cormorant Garamond 400 **italic**, `var(--size-h3)` fluid, line-height `var(--line-snug)`, color `var(--color-terracotta)`, max-width ~22ch, with a thin `var(--color-hairline)` top border and `padding-top: var(--space-sm)`.

**4d. Delete the "Read the full story →" link.** There is no dedicated story page. The studio page will carry the full story content in a later build. The link currently points at `/studio` which is a stub, so remove it entirely. Nothing replaces it.

**4e. Pull quote placement.** On desktop, float the pull quote in the gutter between image and copy columns OR inline within the text column as a block element between the two paragraphs. Choose whichever reads cleaner with the new wider text column; flag the choice in the commit message. On mobile, place it between the heading and the first paragraph.

---

## 5. Featured Classes — 2-line description clamp + real images

**5a. Clamp descriptions to exactly 2 lines.**

Apply this to the `.class-card__description`:

```css
.class-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Every card's description will now be exactly 2 lines tall regardless of source text length, so the meta row and "View class →" link align across all four cards. The current descriptions can stay as-is; the clamp will handle the overflow. Rewriting copy to shorter lengths is not needed.

**5b. Replace placeholder class card images with real archive photos.**

Copy the following from `content-archive/images/space/` into `public/images/home/classes/` and wire them up via `withBase()` on each `.class-card__image`:

- **Heated Vinyasa** → `pre-yoga-class.7ec39349.jpg` → `public/images/home/classes/heated-vinyasa.jpg`
- **Pilates Reformer** → `wooden-reformers.a2583105.jpg` → `public/images/home/classes/pilates-reformer.jpg`
- **Yin** → `overhead-stretch.e7f51556.jpg` → `public/images/home/classes/yin.jpg`
- **Strength & Mobility Flow** → no ideal match in the archive. Leave this card on the PlaceholderImage component for now and flag it in the commit message so we know to supply a real image in a later prompt.

Render each card image at a 3:2 landscape aspect ratio, `object-fit: cover`, `width: 100%`. Flag any image over 1.5 MB for later compression.

---

## 6. The Space teaser — proper dark overlay

The "Heat. Cold. Quiet." headline currently blends into the warm-wood video background because the overlay is too weak. Fix the overlay:

```css
background: linear-gradient(
  to top,
  rgba(58, 42, 34, 0.85) 0%,
  rgba(58, 42, 34, 0.55) 25%,
  rgba(58, 42, 34, 0.15) 55%,
  transparent 80%
);
```

The section's root background should not be deep-brown solid — the video/image should fill it edge to edge, with the gradient as an overlay on top. If the current rendering shows the deep-brown section background rather than the media, that's a bug and also needs fixing. Verify the media actually fills the section.

Keep all the existing text (eyebrow, headline, body, ghost link) and positioning. Only the overlay changes.

---

## 7. Membership section — fix the broken image

The current `<img>` in the membership section has an empty `src` attribute — confirmed via Playwright (renders 576×720 at empty src, which means it's falling back to the PlaceholderImage component). The real asset exists at `content-archive/images/home/membership-bg.ca5207e3.jpg` and was supposed to be copied to `public/images/home/membership.jpg` per prompt 02. Investigate why the component isn't wiring the real image through, and replace the PlaceholderImage usage with a real `<img>` using `withBase('images/home/membership.jpg')`. Flag the root cause in the commit message.

Render at 4:5 portrait on desktop, 16:9 on mobile, as per prompt 02.

---

## 8. Find Us — embed the Prana Wellness Club business listing

The current iframe uses a raw address query and shows "1621" as the pin label. Replace it with an embed that renders the actual Prana Wellness Club Google Maps listing, including the branded business card.

Use this exact embed URL:

```
https://www.google.com/maps?q=Prana+Wellness+Club,+1621+E+7th+St,+Austin,+TX+78702&output=embed
```

If after deploying that URL doesn't render the business card (just the address pin), swap to the place-ID-based embed:

```
https://www.google.com/maps?q=place_id:ChIJ8XKIRgO1RIYRgozAbEoOw6E&output=embed
```

(place ID derived from the business URL `https://www.google.com/maps/place/Prana+Wellness+Club/@30.2631319,-97.7246735`).

Keep all the other iframe constraints from prompt 02: `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, `title="Map of Prana Wellness Club at 1621 E 7th St, Austin, TX"`, aspect-ratio container, hairline border, hidden overflow.

Also update the `LocalBusiness` JSON-LD `geo` block to use the exact coordinates (no more approximation TODO):

```json
"geo": {
  "@type": "GeoCoordinates",
  "latitude": 30.2631319,
  "longitude": -97.7246735
}
```

Remove the TODO comment that was sitting next to it.

---

## 9. Hours — real hours, cleanly styled, no em dash

Prana's hours are: **Monday through Sunday, 7am to 9pm daily.** Since every day is identical, present this as a single tight line rather than a table:

```
Open daily · 7am–9pm
```

That's the exact string to render. Note:

- The separator between "Open daily" and "7am–9pm" is a **middot / interpunct** (` · `, U+00B7) with spaces around it, matching the same character used in the hero eyebrow "AUSTIN · EST. 2024".
- The dash between "7am" and "9pm" is an **en dash** (`–`, U+2013), NOT an em dash. En dashes for number ranges are correct typography and do not violate the no-em-dash copy rule in `CLAUDE.md`. An em dash (`—`, U+2014) in this string WOULD be a violation.

Replace both current occurrences of "Hours — to be confirmed" (note the em dash):

- **Find Us section** — replace the "Hours — to be confirmed" line with `Open daily · 7am–9pm`. Typography: `var(--font-body)` Inter 400, `var(--size-body)` (17px), `var(--color-espresso)`.
- **Footer "Visit" column** — replace "Hours — coming soon" with `Open daily · 7am–9pm`. Same character, same rule. Typography: `var(--font-body)` Inter 400, `var(--size-body-sm)` (15px), `var(--color-warm-white)`.

Audit the rest of the codebase for any other em dashes in visible text and flag them. We have a no-em-dash rule in `CLAUDE.md` and it needs to be respected everywhere, not just these two locations.

---

## 10. Footer logo — unstretch and remove the inverted filter

The footer logo is currently rendered at 160×48 (aspect ratio 3.33) while the source PNG is 726×545 (aspect ratio 1.33). Width and height are being set independently in CSS, squishing it vertically. Separately, the CSS filter `invert(1) brightness(1.1)` is wrong: the source PNG is essentially white (confirmed via pixel sampling, RGB ~252, 252, 250), so inverting it produces a dark logo on a dark-brown footer, which is why it's invisible.

**Fix both at once:**

- Set only `width: 140px` on the logo and let `height: auto` (or omit height entirely). This restores the 1.33 aspect ratio.
- **Remove** `filter: invert(1) brightness(1.1)` completely. The raw white logo renders correctly on the dark-brown footer with no processing.

Verify visually after deploy that the logo is legible in the footer.

---

## 11. Footer legal links — fix contrast and sizing

The Privacy / Terms / Accessibility links currently use `color: var(--color-espresso)` (deep body text color) on a `--color-deep-brown` footer background. Contrast ratio is around 1.5:1 — effectively invisible. Fix:

```css
.footer__legal a {
  color: var(--color-golden);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
  transition: opacity 180ms ease;
}
.footer__legal a:hover {
  opacity: 1;
}
```

Golden (`#E8D5A8`) on deep-brown reads warmly and passes 4.5:1 comfortably. Bump the size from 12px to 13px. Keep tracking and uppercase treatment consistent with the rest of the footer.

---

## 12. Quick verification before declaring done

After all 11 items are committed, run Playwright at **1440×900**, **768×1024**, and **360×800** viewports and verify:

- Zero console errors, zero 404s on network.
- No horizontal scroll on any viewport.
- Hero fills the full viewport height with no cream strip below.
- Header mode flips from dark → light as you scroll past the hero. Test both states.
- All three floating header elements are positioned correctly at desktop; hamburger overlay works on mobile.
- Welcome body paragraphs are centered.
- Our Story has four text sizes, not six. Image loaded. No "Read the full story" link.
- All four class cards have their meta rows aligned at the same vertical position.
- Space teaser headline is readable against the media (not blending).
- Membership image is a real photo, not a placeholder.
- Find Us map shows "Prana Wellness Club" as the pin label, not just "1621".
- Hours read "Open daily · 7am–9pm" in both Find Us and footer, with a middot and en dash.
- Footer logo is 140px wide, proportional, and visibly legible (white-ish) against deep-brown.
- Footer legal links are readable (golden on deep-brown).

Paste Playwright screenshots at all three breakpoints in the response.

---

## Commit cadence

One commit per numbered item (or slightly consolidated where items are tightly related). Suggested:

1. `refactor(header): floating three-part composition with adaptive color`
2. `fix(hero): full viewport, stronger overlay, two buttons, drop scroll hint`
3. `fix(welcome): center body paragraphs`
4. `refactor(our-story): real image, lock four text sizes, widen text column, remove dead link`
5. `fix(classes): 2-line description clamp, real archive images`
6. `fix(space-teaser): stronger gradient overlay`
7. `fix(membership): wire up real membership image`
8. `fix(find-us): business listing embed, exact coordinates in jsonld`
9. `fix(copy): real hours string with middot and en dash`
10. `fix(footer): unstretch logo, remove inverted filter`
11. `fix(footer): legal link contrast and sizing`
12. `test(home): playwright verification at three breakpoints`

If you discover a problem along the way that isn't listed in this prompt, stop and flag rather than adding scope.
