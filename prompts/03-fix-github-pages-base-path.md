# 03 — Fix GitHub Pages base path

The Home page deployed successfully to `https://constanceit.github.io/prana-website/`, but every asset on the page is 404ing because `astro.config.mjs` has no `base` set. The result: unstyled HTML, missing images, missing fonts, broken nav links. Classic project-page base-path issue. The previous prompt told you to leave `base` unset — that was wrong. Fix it.

## What to change

1. **`astro.config.mjs`** — add both `site` and `base`:

   ```js
   site: 'https://constanceit.github.io',
   base: '/prana-website',
   ```

   Keep any other config that's already there (sitemap integration, etc.).

2. **Every hard-coded asset path in the project must respect the base.** Astro does not automatically rewrite string paths you hand-typed in components. Audit the whole codebase and fix anywhere you wrote a leading-slash path to an asset or route:
   - `<link href="/styles/...">`
   - `<script src="/...">`
   - `<img src="/images/...">`, `<source src="/videos/...">`, `<video poster="/...">`
   - `<a href="/classes">`, `<a href="/book">`, every nav link, every CTA button, every footer link
   - Any `og:image` or canonical URL string built in frontmatter
   - The inline `favicon` reference

   The correct pattern is to use Astro's `import.meta.env.BASE_URL` (which Astro populates from the `base` config and always returns with a trailing slash) and prefix every site-root asset with it. Example:

   ```astro
   ---
   const base = import.meta.env.BASE_URL; // "/prana-website/"
   ---
   <link rel="stylesheet" href={`${base}styles/tokens.css`} />
   <img src={`${base}images/home/hero-poster.jpg`} alt="..." />
   <a href={`${base}book`}>Book a Class</a>
   ```

   If you prefer, wrap this in a small `withBase(path)` helper in `src/lib/paths.ts` (or `.js`) and import it everywhere. Either pattern is fine, but be consistent across the codebase.

   Do NOT use relative paths like `../styles/tokens.css` to dodge the problem. Use the base prefix.

3. **Canonical URL and OG URL** in `BaseLayout.astro` need to include the base too. Build the canonical as `${Astro.site}${Astro.url.pathname}` (Astro.site will be `https://constanceit.github.io` and `Astro.url.pathname` will already contain `/prana-website/...`). Verify by viewing the rendered HTML of the deployed Home page after the fix.

4. **Sitemap.** `@astrojs/sitemap` should now generate correct URLs automatically once `site` and `base` are both set. Verify `sitemap-0.xml` (or whatever the integration outputs) after the next build by fetching it on the deployed site and confirming every URL starts with `https://constanceit.github.io/prana-website/`.

5. **robots.txt** at `public/robots.txt` should reference the sitemap at the full URL including base: `Sitemap: https://constanceit.github.io/prana-website/sitemap-index.xml` (or whatever file the sitemap integration outputs — check after build).

## Verification

Before committing:

- Run `npm run build` locally. Inspect `dist/index.html` with your eyes. Every `href`, `src`, and asset reference should start with `/prana-website/`, not bare `/`.
- Run `npm run preview` and visit the preview URL. Astro's preview server honors `base`, so the site should only render correctly if you visit `http://localhost:4321/prana-website/` — not the root. That's expected and is the signal the base is working.

After committing and pushing:

- Wait for the Deploy to GitHub Pages workflow to go green.
- Hard-refresh `https://constanceit.github.io/prana-website/` in an incognito window.
- Open DevTools Network tab. Every CSS, JS, font, image, and video request should return 200. No 404s. If anything 404s, it was missed in the audit — fix and repush.
- Use Playwright at 360px, 768px, and 1280px to re-verify the page still renders correctly now that assets load. Paste a screenshot or Playwright output in the response so I can confirm.

## Commits

Two commits, small and focused:

1. `fix(config): set site and base for github pages project page`
2. `fix(paths): prefix all asset and route references with base url`

If the asset-path audit turns up more files than you expected, split commit 2 into per-file or per-area commits instead of one giant commit.

## Notes

- This is not a one-time fix to forget about. From here on, every new component, page, and prompt must build asset paths with the base prefix. I'll fold that rule into `CLAUDE.md` in a follow-up prompt once this deploy is green so future work doesn't regress.
- Don't touch any copy, design, or structural decisions from prompt 02 in this pass. This is purely a path-correctness fix.
