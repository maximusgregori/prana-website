// Extraction function for Playwright browser_evaluate.
// Returns a structured capture of the current page.
() => {
  const getMeta = (sel) => document.querySelector(sel)?.getAttribute('content') || null;

  function normalizeImg(raw) {
    if (!raw) return raw;
    try {
      const u = new URL(raw, location.href);
      if (u.pathname === '/_next/image') {
        const inner = u.searchParams.get('url');
        if (inner) return new URL(inner, location.href).href;
      }
      return u.href;
    } catch (e) { return raw; }
  }

  function largestFromSrcset(ss) {
    if (!ss) return null;
    let best = null, bestSize = -1;
    ss.split(',').forEach((entry) => {
      const m = entry.trim().match(/(\S+)\s+(\d+)(w|x)/);
      if (m) {
        const size = parseInt(m[2], 10);
        if (size > bestSize) { bestSize = size; best = m[1]; }
      }
    });
    return best;
  }

  function getImgSrc(img) {
    let best = null;
    const pic = img.closest('picture');
    if (pic) pic.querySelectorAll('source').forEach((s) => {
      const c = largestFromSrcset(s.srcset || '');
      if (c) best = c;
    });
    if (!best) best = largestFromSrcset(img.srcset || img.getAttribute('data-srcset') || '');
    if (!best) best = img.currentSrc || img.src || img.getAttribute('data-src') || '';
    return normalizeImg(best);
  }

  // Heading/text reconstruction that handles per-word and per-letter animation wrappers.
  // Strategy: if the node's textContent already contains spaces, trust it.
  // Otherwise, traverse direct children and join them with spaces (assumes each child is a word).
  // If that still yields single-character "words" dominating the result, try one more level deeper.
  function reconstructText(node) {
    if (!node) return '';
    const tc = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (!tc) return '';
    if (tc.includes(' ')) return tc;
    // No spaces in textContent — look at children.
    const kids = Array.from(node.children || []);
    if (kids.length <= 1) return tc;
    const joined = kids.map((k) => (k.textContent || '').trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    // Check if result has reasonable word lengths
    const tokens = joined.split(' ');
    const singleCharRatio = tokens.filter((t) => t.replace(/[^A-Za-z0-9]/g, '').length <= 1).length / Math.max(tokens.length, 1);
    if (singleCharRatio < 0.5) return joined;
    // Too many single-char tokens — assume per-letter wrappers at this level, recurse into first-level children
    // Walk down until we find a level where children look like words.
    function walkForWords(root) {
      const levelChildren = Array.from(root.children || []);
      if (levelChildren.length === 0) return root.textContent.trim();
      const joinedAtLevel = levelChildren.map((k) => (k.textContent || '').trim()).filter(Boolean).join(' ');
      const levelTokens = joinedAtLevel.split(/\s+/);
      const ratio = levelTokens.filter((t) => t.replace(/[^A-Za-z0-9]/g, '').length <= 1).length / Math.max(levelTokens.length, 1);
      if (ratio < 0.5) return joinedAtLevel;
      // Recurse one level up (into the first child that looks like a word wrapper)
      for (const c of levelChildren) {
        const r = walkForWords(c);
        if (r.includes(' ')) return r;
      }
      return joinedAtLevel;
    }
    return walkForWords(node).replace(/\s+/g, ' ').trim();
  }

  // Metadata
  const meta = {
    url: location.href,
    title: document.title,
    description: getMeta('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
    og: {
      title: getMeta('meta[property="og:title"]'),
      description: getMeta('meta[property="og:description"]'),
      image: getMeta('meta[property="og:image"]'),
      type: getMeta('meta[property="og:type"]'),
      url: getMeta('meta[property="og:url"]'),
      site_name: getMeta('meta[property="og:site_name"]'),
    },
    twitter: {
      card: getMeta('meta[name="twitter:card"]'),
      title: getMeta('meta[name="twitter:title"]'),
      description: getMeta('meta[name="twitter:description"]'),
      image: getMeta('meta[name="twitter:image"]'),
    },
    schema: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
      try { return JSON.parse(s.textContent); } catch (e) { return s.textContent; }
    }),
  };

  const imageMap = new Map();
  const addImg = (rawSrc, alt, section) => {
    if (!rawSrc || rawSrc.startsWith('data:')) return null;
    const src = normalizeImg(rawSrc);
    if (!src) return null;
    if (!imageMap.has(src)) imageMap.set(src, { src, alt: alt || '', sections: [] });
    if (alt && !imageMap.get(src).alt) imageMap.get(src).alt = alt;
    if (section && !imageMap.get(src).sections.includes(section)) imageMap.get(src).sections.push(section);
    return src;
  };

  const videos = [];
  const iframesAll = [];
  const BOOKING_HOSTS = /(mindbody|marianatek|mariana-tek|fitgrid|acuityscheduling|acuity|wellnessliving|glofox|vagaro|clubready|schedulicity|pike13|walla|clubworx|xplor|momoyoga|punchpass)/i;
  const EMBED_HOSTS = /(vimeo|youtube|youtu\.be|wistia|loom)/i;
  let bookingWidgetPresent = false;

  document.querySelectorAll('iframe').forEach((f) => {
    const src = f.src || f.getAttribute('data-src') || '';
    const title = f.title || '';
    iframesAll.push({ src, title });
    if (EMBED_HOSTS.test(src)) videos.push({ type: 'embed', url: src, title });
    if (BOOKING_HOSTS.test(src) || BOOKING_HOSTS.test(title)) bookingWidgetPresent = true;
  });

  document.querySelectorAll('video').forEach((v) => {
    const sources = new Set();
    if (v.src) sources.add(v.src);
    if (v.currentSrc) sources.add(v.currentSrc);
    v.querySelectorAll('source').forEach((s) => { if (s.src) sources.add(s.src); });
    const abs = Array.from(sources).map((s) => { try { return new URL(s, location.href).href; } catch (e) { return s; } }).filter(Boolean);
    videos.push({ type: 'file', sources: abs, poster: v.poster || null });
    if (v.poster) addImg(v.poster, '', 'video-poster');
  });

  function renderNode(node, ctx) {
    if (node.nodeType === 3) return node.textContent.replace(/[ \t]+/g, ' ');
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (['script','style','noscript','svg','template','head'].includes(tag)) return '';
    try {
      const st = window.getComputedStyle(node);
      if (st.display === 'none' || st.visibility === 'hidden') return '';
    } catch (e) {}
    if (tag === 'nav') return '\n\n<!-- nav: ' + reconstructText(node) + ' -->\n';
    if (tag === 'footer') return '\n\n<!-- footer-start -->\n' + renderChildren(node, ctx) + '\n<!-- footer-end -->\n';
    if (tag === 'header') return '\n\n<!-- header-start -->\n' + renderChildren(node, ctx) + '\n<!-- header-end -->\n';
    if (/^h[1-6]$/.test(tag)) {
      const level = +tag[1];
      const text = reconstructText(node);
      return text ? '\n\n' + '#'.repeat(level) + ' ' + text + '\n' : '';
    }
    if (tag === 'p') {
      const text = reconstructText(node);
      return text ? '\n\n' + text : '';
    }
    if (tag === 'br') return '  \n';
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(node.querySelectorAll(':scope > li')).map((li) => '- ' + reconstructText(li)).filter((s) => s.length > 2);
      return items.length ? '\n\n' + items.join('\n') + '\n' : '';
    }
    if (tag === 'li') {
      const text = reconstructText(node);
      return text ? '\n- ' + text : '';
    }
    if (tag === 'blockquote') {
      const text = reconstructText(node);
      return text ? '\n\n> ' + text : '';
    }
    if (tag === 'img') {
      const src = getImgSrc(node);
      const alt = node.alt || '';
      if (src) addImg(src, alt, ctx.section);
      return src ? `\n\n![${alt}](${src})` : '';
    }
    if (tag === 'picture') {
      const img = node.querySelector('img');
      if (img) {
        const src = getImgSrc(img);
        const alt = img.alt || '';
        if (src) addImg(src, alt, ctx.section);
        return src ? `\n\n![${alt}](${src})` : '';
      }
      return '';
    }
    if (tag === 'video') {
      const sources = [];
      if (node.src) sources.push(node.src);
      node.querySelectorAll('source').forEach((s) => { if (s.src) sources.push(s.src); });
      const label = sources[0] || '';
      return label ? `\n\n<!-- video: ${label} -->` : '';
    }
    if (tag === 'iframe') {
      const src = node.src || '';
      return src ? `\n\n<!-- iframe: ${src} -->` : '';
    }
    if (tag === 'a') {
      const innerImg = node.querySelector('img');
      if (innerImg) {
        const src = getImgSrc(innerImg);
        const alt = innerImg.alt || '';
        if (src) addImg(src, alt, ctx.section);
        return src ? `\n\n![${alt}](${src})` : '';
      }
      const text = reconstructText(node);
      const href = node.href || '';
      if (!text) return '';
      try {
        const d = window.getComputedStyle(node).display;
        if (d === 'block' || d === 'flex' || d === 'inline-block') return `\n\n[${text}](${href})`;
      } catch (e) {}
      return ` [${text}](${href}) `;
    }
    if (tag === 'button') {
      const text = reconstructText(node);
      return text ? `\n\n[Button: ${text}]` : '';
    }
    if (tag === 'section') {
      const label = node.id || (node.className || '').toString().split(' ').filter(Boolean).slice(0, 2).join('.') || 'section';
      const prev = ctx.section;
      ctx.section = label;
      const out = '\n\n<!-- section: ' + label + ' -->' + renderChildren(node, ctx);
      ctx.section = prev;
      return out;
    }
    return renderChildren(node, ctx);
  }
  function renderChildren(node, ctx) {
    let out = '';
    for (const child of node.childNodes) out += renderNode(child, ctx);
    return out;
  }

  const ctx = { section: 'root' };
  let md = renderChildren(document.body, ctx);
  md = md.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  document.querySelectorAll('img').forEach((img) => {
    const src = getImgSrc(img);
    if (src) addImg(src, img.alt || '', 'fallback-sweep');
  });
  document.querySelectorAll('[style*="background-image"]').forEach((el) => {
    const m = (el.getAttribute('style') || '').match(/background-image:\s*url\(["']?([^"')]+)["']?\)/);
    if (m) addImg(m[1], '', 'background');
  });

  const images = Array.from(imageMap.values()).map((img) => {
    let naturalWidth = null, naturalHeight = null;
    document.querySelectorAll('img').forEach((domImg) => {
      if (normalizeImg(domImg.currentSrc || domImg.src) === img.src && domImg.naturalWidth) {
        if (!naturalWidth || domImg.naturalWidth > naturalWidth) {
          naturalWidth = domImg.naturalWidth;
          naturalHeight = domImg.naturalHeight;
        }
      }
    });
    return { ...img, naturalWidth, naturalHeight };
  });

  return { meta, markdown: md, images, videos, iframes: iframesAll, bookingWidgetPresent };
}
