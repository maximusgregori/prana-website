# Scrape the existing pranawellness.love site

**Before anything else, read `CLAUDE.md` in the root of this repository in full.** Every rule in that file applies to this task. If anything in this prompt conflicts with `CLAUDE.md`, follow `CLAUDE.md` and flag the conflict in your response.

## Task

Capture the full content of the existing Prana Wellness Club website at `https://pranawellness.love` into a local reference archive inside this repository. This archive becomes the source material the designer pulls from when building the new site. You are not redesigning anything, not rewriting anything, and not building new pages in this task. You are archiving what exists today, exactly as it exists today.

## Tool

Use **Playwright MCP** for all page retrieval. Do not use `curl`, `fetch`, `wget`, or any other HTTP client. The existing site is JavaScript-rendered in places, and Playwright is the only tool that will reliably capture what a real visitor sees. This is also stated in `CLAUDE.md` under "Tools You Have."

## Scope

**Capture every page on the site EXCEPT the blog.** Do not scrape `/blog`, individual blog post pages, or the images and media attached to blog posts. The designer will handle blog content separately at a later stage.

Everything else is in scope: Home, Classes, Memberships, Private Events, The Space, Contact, About, Instructors (if present), any legal pages (Privacy, Terms), and anything else linked from the main navigation or footer.

Before you start capturing content, navigate to the homepage, enumerate every unique internal link you find in the main nav, the footer, and inline content, and produce a page list. Exclude any URL that starts with `/blog`. Share the final page list in your response before you begin the full capture, so the designer can confirm the scope is right.

## What to Capture

For each in-scope page:

1. **Copy.** All visible text content, structured by section. Save one markdown file per page, named after the page slug (e.g., `home.md`, `classes.md`, `private-events.md`) under `content-archive/copy/`. Preserve heading hierarchy and paragraph breaks. Do not reformat, rewrite, shorten, expand, or "clean up" the copy. Capture it exactly as it appears on the live site. If an image has alt text, capture that as well and keep it attached to the image in the markdown file.

2. **Images.** Every image displayed on the page, in original resolution and original file format. Do not compress, resize, or convert them. Save them under `content-archive/images/` organized into a subfolder per source page (e.g., `content-archive/images/home/`, `content-archive/images/classes/`). Preserve the original filenames where possible; if two images share a name, disambiguate by prefixing with the section they came from.

3. **Videos.** Any video files or video embeds. For direct video files hosted on Prana's own domain, download them into `content-archive/videos/` under a subfolder per source page. For embedded players (Vimeo, YouTube, Wistia, etc.), do not attempt to download from the third-party host. Instead, record the embed URL, the source page, and the section in the manifest.

4. **Metadata.** For each page, capture the `<title>` tag, meta description, Open Graph tags (`og:title`, `og:description`, `og:image`), and any schema.org structured data present on the page. Store this per-page in the manifest.

## What to Skip

- The entire `/blog` section and any media associated with it.
- Third-party booking widget content (Mindbody or similar). Note in the manifest that a booking widget exists on a given page and which page it is on, but do not try to scrape inside the iframe.
- Analytics scripts, tag manager code, and tracking pixels.
- CSS files, JavaScript files, and anything under `/wp-includes/` or similar framework paths. We are archiving content, not code.

## Output Structure

Create the following under `content-archive/` at the root of the repository:

```
content-archive/
  copy/
    home.md
    classes.md
    memberships.md
    ...
  images/
    home/
    classes/
    ...
  videos/
    home/
    ...
  manifest.json
```

The `manifest.json` file is the index that ties everything together. It should map every captured asset back to the page and section it came from on the live site. Minimum shape per entry:

```json
{
  "source_url": "https://pranawellness.love/classes",
  "source_page": "classes",
  "section": "hero",
  "asset_type": "image",
  "asset_path": "content-archive/images/classes/hero-reformer.jpg",
  "original_url": "https://pranawellness.love/wp-content/uploads/2024/..."
}
```

The manifest should also have a top-level entry per page that holds the page-level metadata (title, meta description, Open Graph, schema, and a flag for whether a booking widget is present).

## Reporting

When the scrape is complete, respond with:

1. The final list of pages captured.
2. The list of pages you skipped and why.
3. A count of copy files, images, and videos captured.
4. Any pages where something went wrong: broken links, failed captures, iframes you could not read into, missing assets on the live site, etc.
5. Any pages where the existing content looked suspicious (placeholder text, lorem ipsum, broken image references on the live site, the homepage stats showing zeros, and so on), so the designer knows where to focus the rewrite pass.

Do not proceed to any design work, structural work, or implementation work after the scrape finishes. Stop and wait for the next prompt.
