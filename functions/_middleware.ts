interface Env {
  BLOG_KV: KVNamespace;
}

interface BlogPost {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  content: Record<string, string>;
  author: string;
  date: string;
  tags: string[];
  ogImage: string;
  coverImage?: string;
}

interface BlogPostMeta {
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
}

const BOT_UA = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot',
  'slurp', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot',
];

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA.some((b) => lower.includes(b));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const LANGS = ['en', 'zh-TW', 'ru', 'es', 'pt', 'ja'] as const;

export const onRequest: PagesFunction<Env> = async (context) => {
  const ua = context.request.headers.get('user-agent') ?? '';
  if (!isBot(ua)) return context.next();

  const url = new URL(context.request.url);
  const path = url.pathname;

  // Match /blog/:slug or /:lang/blog/:slug
  const postMatch = path.match(
    /^(?:\/(en|zh-TW|ru|es|pt|ja))?\/blog\/([a-z0-9-]+)\/?$/
  );
  if (postMatch) {
    const lang = postMatch[1] ?? 'en';
    const slug = postMatch[2];
    const post = await context.env.BLOG_KV.get<BlogPost>(`post:${slug}`, 'json');
    if (!post) return context.next();

    const title = escapeHtml(post.title[lang] ?? post.title.en);
    const desc = escapeHtml(post.description[lang] ?? post.description.en);
    const img = escapeHtml(post.coverImage ?? post.ogImage ?? '');

    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title[lang] ?? post.title.en,
      description: post.description[lang] ?? post.description.en,
      image: post.ogImage,
      datePublished: post.date,
      author: { '@type': 'Person', name: post.author },
      publisher: { '@type': 'Organization', name: 'XMR402', url: 'https://xmr402.org' },
    });

    const hreflangs = LANGS.map((l) => {
      const href = l === 'en' ? `https://xmr402.org/blog/${slug}` : `https://xmr402.org/${l}/blog/${slug}`;
      return `<link rel="alternate" hreflang="${l === 'zh-TW' ? 'zh-Hant' : l}" href="${href}" />`;
    }).join('\n    ');

    return new Response(
      `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${title} | XMR402 Blog</title>
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title} | XMR402 Blog">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${img}">
    <meta property="og:url" content="${escapeHtml(url.href)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} | XMR402 Blog">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">
    ${hreflangs}
    <link rel="alternate" hreflang="x-default" href="https://xmr402.org/blog/${slug}" />
    <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
    <h1>${title}</h1>
    <p>${desc}</p>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Match /blog or /:lang/blog
  const listMatch = path.match(/^(?:\/(en|zh-TW|ru|es|pt|ja))?\/blog\/?$/);
  if (listMatch) {
    const lang = listMatch[1] ?? 'en';
    const index: BlogPostMeta[] =
      (await context.env.BLOG_KV.get('posts:index', 'json')) ?? [];

    const links = index
      .map((p) => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title[lang] ?? p.title.en)}</a></li>`)
      .join('\n      ');

    return new Response(
      `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>Blog | XMR402</title>
    <meta name="description" content="Latest news, guides, and insights about XMR402, HTTP 402, and the agentic economy.">
    <meta property="og:title" content="Blog | XMR402">
    <meta property="og:type" content="website">
</head>
<body>
    <h1>XMR402 Blog</h1>
    <ul>${links}</ul>
</body>
</html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return context.next();
};
