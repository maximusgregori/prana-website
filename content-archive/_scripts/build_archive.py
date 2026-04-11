#!/usr/bin/env python3
"""
Build the content archive from Playwright extraction JSON files.

- Downloads all image and video assets (static binaries) into content-archive/images/<page>/ and content-archive/videos/<page>/
- Writes cleaned copy markdown files to content-archive/copy/<page>.md
- Builds content-archive/manifest.json tying every captured asset back to its source page/section

Usage:
    python3 _scripts/build_archive.py
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent.parent
EXTRACTION_DIR = ROOT / "_extraction"
COPY_DIR = ROOT / "copy"
IMAGES_DIR = ROOT / "images"
VIDEOS_DIR = ROOT / "videos"

PAGES = [
    ("home", "https://pranawellness.love/"),
    ("classes", "https://pranawellness.love/classes"),
    ("memberships", "https://pranawellness.love/memberships"),
    ("private-events", "https://pranawellness.love/private-events"),
    ("space", "https://pranawellness.love/space"),
    ("join", "https://pranawellness.love/join"),
    ("book", "https://pranawellness.love/book"),
]


def url_filename(url: str) -> str:
    """Derive a filesystem-safe filename from a URL, preserving the original name where possible."""
    parsed = urlparse(url)
    path = unquote(parsed.path)
    name = os.path.basename(path) or "asset"
    # Keep it simple — the underlying pranawellness.love names are already unique (content-addressed hashes from Next.js)
    return name


def download(url: str, dest: Path) -> tuple[bool, str]:
    """Download a URL to dest via curl. Returns (ok, message)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return True, "exists"
    try:
        result = subprocess.run(
            [
                "curl",
                "--fail",
                "--silent",
                "--show-error",
                "--location",
                "--max-time",
                "30",
                "-A",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
                "-o",
                str(dest),
                url,
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return False, result.stderr.strip() or f"exit={result.returncode}"
        if not dest.exists() or dest.stat().st_size == 0:
            return False, "empty file"
        return True, f"{dest.stat().st_size} bytes"
    except Exception as e:
        return False, str(e)


# Markdown cleanup: strip nav/header/footer wrappers and section HTML comments from the copy files
# so the designer sees clean content. Keep section markers as human-readable headers.
SECTION_RE = re.compile(r"<!--\s*section:\s*(.+?)\s*-->")
NAV_RE = re.compile(r"<!--\s*nav:.*?-->", re.DOTALL)
HEADER_START_RE = re.compile(r"<!--\s*header-start\s*-->")
HEADER_END_RE = re.compile(r"<!--\s*header-end\s*-->")
FOOTER_START_RE = re.compile(r"<!--\s*footer-start\s*-->")
FOOTER_END_RE = re.compile(r"<!--\s*footer-end\s*-->")


def clean_markdown(md: str, page_slug: str, page_url: str, meta: dict, booking_widget: bool, video_iframes: list) -> str:
    """Produce the human-readable page copy markdown."""
    # Remove the header block entirely; remove nav comments; strip footer block.
    lines = md.splitlines()

    out = []
    in_header = False
    in_footer = False
    for line in lines:
        if HEADER_START_RE.search(line):
            in_header = True
            continue
        if HEADER_END_RE.search(line):
            in_header = False
            continue
        if FOOTER_START_RE.search(line):
            in_footer = True
            continue
        if FOOTER_END_RE.search(line):
            in_footer = False
            continue
        if in_header or in_footer:
            continue
        if NAV_RE.search(line):
            continue
        out.append(line)

    body = "\n".join(out)
    # Collapse section comments into readable markers
    body = SECTION_RE.sub(lambda m: f"\n---\n\n_Section: `{m.group(1).strip()}`_\n", body)
    # Collapse excessive blank lines
    body = re.sub(r"\n{3,}", "\n\n", body).strip()

    # Build the front matter
    title = meta.get("title") or ""
    description = meta.get("description") or ""
    header = [
        f"# {page_slug}",
        "",
        f"- Source: {page_url}",
        f"- Page `<title>`: {title}",
        f"- Meta description: {description or '(none)'}",
    ]
    if booking_widget:
        header.append("- Booking widget: YES (third-party iframe, not scraped)")
    if video_iframes:
        for emb in video_iframes:
            header.append(f"- Video embed: {emb}")
    header += ["", "---", "", "## Page copy", ""]

    return "\n".join(header) + "\n" + body + "\n"


def slugify_section(label: str) -> str:
    label = re.sub(r"[^A-Za-z0-9]+", "-", label).strip("-").lower() or "root"
    return label[:40]


def main():
    COPY_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {"generated_at": "2026-04-11", "source": "https://pranawellness.love", "pages": {}, "assets": []}

    problems = []
    asset_counts = {"images": 0, "videos_file": 0, "videos_embed": 0, "images_failed": 0, "videos_failed": 0}

    # Track URLs we've already downloaded so the same asset isn't written to multiple page folders.
    seen_urls: dict[str, str] = {}  # url -> stored path (relative)

    for page_slug, page_url in PAGES:
        extraction_path = EXTRACTION_DIR / f"{page_slug}.json"
        if not extraction_path.exists():
            problems.append(f"{page_slug}: missing extraction JSON at {extraction_path}")
            continue
        data = json.loads(extraction_path.read_text())
        meta = data["meta"]
        images = data.get("images", [])
        videos = data.get("videos", [])
        iframes = data.get("iframes", [])
        booking_widget_present = data.get("bookingWidgetPresent", False)

        video_embeds = [v["url"] for v in videos if v.get("type") == "embed"]

        # Page-level manifest entry
        page_entry = {
            "source_url": page_url,
            "source_page": page_slug,
            "title": meta.get("title"),
            "meta_description": meta.get("description"),
            "canonical": meta.get("canonical"),
            "og": meta.get("og"),
            "twitter": meta.get("twitter"),
            "schema": meta.get("schema", []),
            "booking_widget_present": booking_widget_present,
            "booking_widget_iframes": [
                f
                for f in iframes
                if re.search(r"(mindbody|mariana|acuity|glofox|vagaro|clubready|schedulicity|pike13|walla|clubworx|wellnessliving|momoyoga|punchpass)", f.get("src", ""), re.I)
            ],
            "video_embeds": video_embeds,
        }
        manifest["pages"][page_slug] = page_entry

        # --- Images ---
        page_image_dir = IMAGES_DIR / page_slug
        for img in images:
            src = img["src"]
            alt = img.get("alt", "")
            sections = img.get("sections", [])
            natural_w = img.get("naturalWidth")
            natural_h = img.get("naturalHeight")

            if src in seen_urls:
                asset_path = seen_urls[src]
            else:
                filename = url_filename(src)
                # Avoid collisions within the page folder
                dest = page_image_dir / filename
                suffix = 2
                stem = dest.stem
                ext = dest.suffix
                while dest.exists() and dest in [Path(p) for p in seen_urls.values() if Path(p).name == dest.name]:
                    dest = page_image_dir / f"{stem}-{suffix}{ext}"
                    suffix += 1
                ok, msg = download(src, dest)
                if not ok:
                    asset_counts["images_failed"] += 1
                    problems.append(f"{page_slug}: image download failed: {src} ({msg})")
                    continue
                asset_counts["images"] += 1
                asset_path = str(dest.relative_to(ROOT.parent))
                seen_urls[src] = asset_path

            manifest["assets"].append({
                "source_url": page_url,
                "source_page": page_slug,
                "section": sections[0] if sections else None,
                "all_sections": sections,
                "asset_type": "image",
                "asset_path": asset_path,
                "original_url": src,
                "alt": alt,
                "natural_width": natural_w,
                "natural_height": natural_h,
            })

        # --- Videos (files only; embeds are logged in page entry) ---
        page_video_dir = VIDEOS_DIR / page_slug
        for v in videos:
            if v.get("type") != "file":
                continue
            sources = v.get("sources", [])
            poster = v.get("poster")
            downloaded_for_this_video = []
            for src in sources:
                if src in seen_urls:
                    asset_path = seen_urls[src]
                else:
                    filename = url_filename(src)
                    dest = page_video_dir / filename
                    ok, msg = download(src, dest)
                    if not ok:
                        asset_counts["videos_failed"] += 1
                        problems.append(f"{page_slug}: video download failed: {src} ({msg})")
                        continue
                    asset_counts["videos_file"] += 1
                    asset_path = str(dest.relative_to(ROOT.parent))
                    seen_urls[src] = asset_path
                downloaded_for_this_video.append((src, asset_path))

            for src, asset_path in downloaded_for_this_video:
                manifest["assets"].append({
                    "source_url": page_url,
                    "source_page": page_slug,
                    "section": None,
                    "asset_type": "video",
                    "asset_path": asset_path,
                    "original_url": src,
                    "poster": poster,
                })

        for embed_url in video_embeds:
            asset_counts["videos_embed"] += 1
            manifest["assets"].append({
                "source_url": page_url,
                "source_page": page_slug,
                "section": None,
                "asset_type": "video_embed",
                "asset_path": None,
                "original_url": embed_url,
            })

        # --- Copy markdown ---
        clean = clean_markdown(
            md=data["markdown"],
            page_slug=page_slug,
            page_url=page_url,
            meta=meta,
            booking_widget=booking_widget_present,
            video_iframes=video_embeds,
        )
        (COPY_DIR / f"{page_slug}.md").write_text(clean)

    # Write manifest
    (ROOT / "manifest.json").write_text(json.dumps(manifest, indent=2))

    # Report
    print("=== Build complete ===")
    print(f"Copy files: {len(PAGES)}")
    print(f"Images downloaded: {asset_counts['images']} (failed: {asset_counts['images_failed']})")
    print(f"Video files downloaded: {asset_counts['videos_file']} (failed: {asset_counts['videos_failed']})")
    print(f"Video embeds logged: {asset_counts['videos_embed']}")
    print(f"Manifest entries: {len(manifest['assets'])}")
    if problems:
        print(f"\nProblems ({len(problems)}):")
        for p in problems:
            print(f"  - {p}")
    print()


if __name__ == "__main__":
    main()
