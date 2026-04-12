# CLAUDE.md — Prana Wellness Club Website (prana-site)

This file is the standing brief for Claude Code on the Prana Wellness Club website build. It is a permanent reference, not a status document. Nothing in it should ever go stale. No phases, no task lists, no "current step" language. If something here stops being true, it gets edited, not appended.

**Read this file before every task.** Every prompt, every change, every commit. This is the ground truth for how the project works, what the brand is, and what "good" means on this codebase.

## What This Project Is

Prana Wellness Club is a boutique wellness studio in Austin, Texas. They run Reformer Pilates, Mat Pilates, and yoga (vinyasa, hatha, yin) out of their own studio space. They also offer recovery amenities (sauna, steam room, and cold plunge), which they refer to internally as "The Space." The brand voice is intentional, grounded, and warm. The tagline is "Move with intention. Rest with purpose."

Prana has an existing website at pranawellness.love. We are replacing it. The brand identity, photography, and language are largely strong and will be carried forward where they work. What we are fixing is the digital experience: slow hero, poor contrast and readability in places, a third-party booking handoff that breaks trust, a flat and unfiltered class list, a membership page that underperforms, missing content (no team page, no real private events page), and credibility issues like placeholder stats on the homepage.

This CLAUDE.md covers the website only. There is no app work and no scheduler work in this repository.

## The Work

A fully custom Astro website. No templates, no theme packs, no component libraries that impose a look. The surface area is:

- Home
- Classes (with filtering by category, instructor, time, and difficulty)
- Memberships
- Private Events
- The Space (recovery amenities)
- Blog
- Instructor Profiles (team page)

The site must be fully responsive, fast on mobile, accessible, and visually distinctive. Imagery must be compressed and optimized. Forms must be short and conversion-aware. Maps must be embedded, not linked out. Contact details must be consistent across the site.

## Tech Stack and Hosting

- **Framework:** Astro
- **Markup and styling:** HTML and CSS. Use CSS custom properties for the design tokens once they are defined.
- **JavaScript:** Only where it earns its place. Class filtering, form validation, small interactive flourishes. No SPA frameworks, no client-side routing, no state libraries.
- **Hosting:** GitHub Pages for the duration of the build. Production hosting decisions are the client's to make later and are not a concern for this repository.
- **Version control:** Git, on GitHub. Commit messages should be clear and descriptive. Small, focused commits are preferred.

Do not introduce React, Vue, Svelte, Tailwind, Bootstrap, or any UI kit. Do not add a CSS-in-JS solution. Do not add a headless CMS. If a task seems to require one of these, stop and raise the question in the prompt response instead of picking one unilaterally.

## Tools You Have

Claude Code has several tools on this project that it should reach for by reflex, not as optional helpers.

**Context7 MCP.** On-demand access to up-to-date library and framework documentation. Reach for Context7 any time you're about to write non-trivial code against Astro, a CSS feature, a JavaScript API, or any dependency. Your training data goes stale on fast-moving tools. Context7 doesn't. When in doubt, look it up before typing it out.

**Playwright MCP.** Browser automation. Use Playwright whenever a task involves a live web page: capturing content from pranawellness.love, checking how a reference site renders, verifying a deployed build, or validating that a new page looks and behaves correctly in a real browser. Do not fall back to `curl`, `fetch`, or plain HTTP requests to inspect pages when Playwright is available. They miss anything JavaScript-rendered.

**Design skills.** A suite of design skills is installed at `~/.claude/skills/`. They work as a system, not as isolated commands. The foundation skill is `impeccable`, which carries the core design principles, anti-patterns, and a context-gathering protocol. Every other design skill invokes `impeccable` first as mandatory preparation. Run `/impeccable teach` once at the start of serious design work on this project so the context is loaded, then reach for specific skills as the task calls for them.

Relevant skills, grouped by when to reach for them:

- **Planning (before code):** `shape` to produce a design brief for a new feature or page. `impeccable craft` for the full shape-then-build flow on a single feature.
- **Building:** `typeset` for typography, `arrange` for layout and spacing, `colorize` for color decisions, `adapt` for responsive behavior, `animate` for purposeful motion, `extract` for pulling reusable components and tokens into the design system as it grows, `harden` for edge cases, error states, overflow, and i18n.
- **Reviewing and refining (before shipping):** `audit` for accessibility, performance, theming, and responsive checks. `web-design-guidelines` (Vercel's Web Interface Guidelines) in addition to `audit`. `critique` for UX-level design review. `polish` for the final alignment and micro-detail pass. `optimize` when something is slow. `normalize` when a page has drifted from the design system. `distill` when a page has gotten noisy.
- **Tonal adjustment when needed:** `bolder`, `quieter`, `delight`, `overdrive`. Situational. Reach for them when the task calls for it, not by default.

**Do not run `clarify`.** That skill rewrites UX copy, microcopy, labels, and error messages. On this project copy is the designer's responsibility, not Claude Code's (see "Copy Is Not Your Job" below). If a prompt ever seems to require `clarify`, stop and flag it instead.

The skill list is not a checklist. Reach for a skill when it fits the task. Skip it when it doesn't.

## How Work Comes In

All task instructions for Claude Code come from files in `prana-site/prompts/`. Before acting on any request, check that folder for the relevant prompt file and read it in full. The prompt file is the source of truth for the task. If a user message in a Claude Code session conflicts with the prompt file, follow the prompt file and flag the conflict.

If a prompt file references decisions, assets, or content that should exist but don't, stop and ask rather than guessing. Surfacing a missing input is always better than inventing one.

## Folder Conventions

- `src/` — Astro source. Pages, components, layouts, styles.
- `public/` — Static assets served as-is.
- `prompts/` — Task prompts written for Claude Code. Read before acting. Do not modify these files; they are written by the designer.
- `content-archive/` — A full capture of the existing pranawellness.love site: copy, images, videos, and a manifest mapping every asset back to its source page and section. This is read-only reference material. Do not edit files in this folder, and do not treat it as an autonomous content source (see Content Handling below).
- `docs/` — Any internal documentation the project needs (design tokens, content decisions, etc.), written as plain markdown.

Do not create new top-level folders without a clear reason. Do not scatter assets across the repository.

## Design Standards

The single most important design rule on this project: **the site must not look or feel AI-generated.** That is the bar the whole design is measured against. Concretely, that means:

- No templated hero / stats / testimonials / CTA sandwich layouts.
- No generic gradients, no stock-looking section dividers, no default rounded-card grids used out of habit.
- No filler sections that exist only to pad a page.
- Real typographic hierarchy, intentional whitespace, and compositional decisions a senior human designer would defend.
- Layouts should feel specific to Prana, not generic to "wellness studios."

Design tokens (typography, palette, spacing scale) will be defined as the project progresses and will be documented in `docs/` and reflected in CSS custom properties. Until tokens are locked, do not hard-code colors, fonts, or spacing values in components. Use placeholders from a central tokens file so they can be swapped in one place.

## Responsive, Accessible, and SEO-Ready

Every page must be designed and built to be equally good on mobile, tablet, and desktop, accessible by default, and set up for search and social sharing. These are hard requirements, not polish items, and they apply to every page from the first commit.

**Responsive.** Mobile-first. Design and style from the smallest viewport up, then layer in tablet and desktop enhancements. Every page must look and behave well at roughly 360px, 768px, and 1280px widths as minimum checkpoints. No horizontal scroll on mobile. No desktop-only interactions (hover-reveals, mouseover tooltips) without a mobile-equivalent pattern. Touch targets at least 44px square.

**Accessible.** Color contrast meets WCAG AA at minimum (4.5:1 for body text, 3:1 for large text and UI components). All interactive elements are keyboard-reachable with a visible focus state. Images have meaningful `alt` text provided by the designer (placeholder images during build get a neutral `alt` like "placeholder image for team member," replaced when real assets arrive). Forms have proper labels, not just placeholder hints. Motion respects `prefers-reduced-motion`.

**Semantic HTML and heading hierarchy.** Exactly one `<h1>` per page. Section structure uses `<h2>` for major sections, `<h3>` for sub-sections, and so on. Never choose a heading tag for its size or weight. If you need large text that isn't a section heading, use a styled `<p>` or `<span>`. The current live site abuses `<h1>` by rendering every class card title as one, which is a real accessibility bug we are replacing, not repeating.

**SEO-ready.** Every page must ship with:

- A unique, specific `<title>` tag. No site-wide defaults.
- A unique `<meta name="description">` relevant to that page.
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`.
- Twitter Card tags at minimum `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
- Canonical URL via `<link rel="canonical">`.
- Valid, well-structured HTML that passes basic semantic checks.

The site must also ship with a `LocalBusiness` JSON-LD schema block for Prana Wellness Club on the home page and the studio page, including address, hours, phone, geo coordinates, and business type, and a `sitemap.xml` and `robots.txt` at the site root. The Astro page templates should make it trivial to set per-page title, description, and OG image via frontmatter or props.

## Copy Is Not Your Job

Claude Code does not write copy for this site. Not headlines, not body paragraphs, not button labels, not microcopy, not image alt text, not meta descriptions, not form placeholder text, not error messages, not 404 page text. None of it. Every word a visitor reads on the site is written or approved by the designer.

The division of labor on this project is simple. The designer handles strategy, structure, and all copywriting. Claude Code handles implementation: markup, styles, components, layout, interactivity, accessibility, performance, and deployment.

When a prompt asks Claude Code to build a page or a section, the copy for that page or section will be provided in the prompt itself, in a file the prompt references, or as existing text inside `content-archive/` that the prompt explicitly points to. If a prompt asks for a page to be built but the copy for some part of it is missing or unclear, stop and ask. Do not fill the gap with placeholder copy, lorem ipsum, AI-generated filler, or "reasonable defaults." An empty section flagged in the response is always better than invented words on a live page.

The one narrow exception is obviously mechanical utility text that is not really copy: form field labels that mirror their field name ("Email," "Phone," "Message"), standard semantic labels ("Skip to content," "Open menu"), and similar strings. When in doubt, treat it as copy and ask.

## Content Handling

The `content-archive/` folder is a reference capture of the existing pranawellness.love site. It exists so the designer can pull the right words, images, and videos forward into the new site, and so Claude Code can locate an asset when a prompt points to it.

Rules for working with the archive:

- Never edit anything inside `content-archive/`. It is read-only source material.
- Do not pull copy or media from the archive on your own initiative. Only use archive content when a prompt explicitly tells you to, or when a prompt references a specific archive path.
- If something in the archive looks wrong, missing, or mislabeled, flag it in the response rather than working around it.
- Images and videos referenced by a prompt should be copied into `public/` (or the appropriate build location) from the archive, not linked from inside `content-archive/`.

## Out of Scope

- Mobile app work of any kind.
- Scheduling platform work of any kind.
- Backend services, databases, or server-side logic beyond what Astro's static output supports.
- Third-party booking widget integrations. Booking will eventually connect to an in-house system; until then, pages that currently link out to a booking provider should be designed as if booking is "coming soon" or route to a simple contact form, depending on the prompt.
- Analytics, tag managers, or marketing pixels unless a prompt explicitly asks for them.
- Experimentation with frameworks or tools other than the stack listed above.

## Working Style

- When a task is ambiguous, ask. A short clarifying question in the response is always better than a confident wrong guess.
- Flag assumptions explicitly in responses. Do not bury them in code comments.
- **Do not commit or push unless explicitly told to.** Never run `git commit`, `git push`, `git commit --amend`, or `git push --force-with-lease` on your own initiative. Wait for the user to say "commit and push" or equivalent. When the user does tell you to commit and push, make one normal commit (`git commit`, no `--amend` flag) and one normal push (`git push`, no `--force` or `--force-with-lease` flag). Never amend. Never force push. Never squash.
- Do not run any other destructive Git operations (hard reset, branch deletion) without being explicitly asked.
- Do not install dependencies casually. Every new package should have a reason that fits the stack rules above.
- Performance, accessibility, and contrast are not polish items. They are requirements from day one.

## Skill Ordering

Design skills must run **before** writing code, not after. The correct sequence for every prompt is:

1. Read this file and the prompt file.
2. Run `/impeccable teach` (if not already loaded in the session) and any other relevant planning skills (`shape`, etc.) to gather design context and inform decisions.
3. Write code.
4. Run `audit` and `critique` for verification.
5. Stop and report. Do NOT commit or push. Wait for the user to tell you to commit and push.

Do not code first and then try to run design skills as an afterthought. The skills exist to inform the code, not to rubber-stamp it.

**Verification is not a Playwright walkthrough.** Use `audit` for accessibility, performance, responsive, and theming checks. Use `critique` for UX-level design review. Use `polish` for the final micro-detail pass. Only use Playwright for specific targeted checks when a prompt explicitly calls for one (e.g., confirming a map embed loaded, checking a specific computed style). Do not manually navigate the site at multiple viewports and take screenshots as a general verification step.

This file is the contract. Read it before every task.
