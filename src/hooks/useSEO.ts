import { useEffect } from 'react';

const DEFAULT_OG_IMAGE = 'https://xmr402.org/og-image.jpg';
const DEFAULT_TITLE = 'XMR402 | The Tactical Standard for AI-Native Payments';

interface SEOProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: object;
}

export function useSEO({ title, description, ogImage, ogType, canonicalUrl, jsonLd }: SEOProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (key: string, content: string, isProperty = true) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const image = ogImage || DEFAULT_OG_IMAGE;

    setMeta('description', description, false);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', ogType ?? 'article');
    setMeta('og:image', image);
    if (canonicalUrl) setMeta('og:url', canonicalUrl);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    if (jsonLd) {
      let scriptEl = document.getElementById('blog-jsonld') as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'blog-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('og:image', DEFAULT_OG_IMAGE);
      setMeta('twitter:image', DEFAULT_OG_IMAGE);
      const blogJsonLd = document.getElementById('blog-jsonld');
      if (blogJsonLd) blogJsonLd.remove();
    };
  }, [title, description, ogImage, ogType, canonicalUrl, jsonLd]);
}
