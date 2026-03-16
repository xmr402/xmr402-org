import { useEffect } from 'react';

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

    setMeta('description', description, false);
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:type', ogType ?? 'article');
    if (ogImage) setMeta('og:image', ogImage);
    if (canonicalUrl) setMeta('og:url', canonicalUrl);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (ogImage) setMeta('twitter:image', ogImage);

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
      document.title = 'XMR402 | The Tactical Standard for AI-Native Payments';
      const blogJsonLd = document.getElementById('blog-jsonld');
      if (blogJsonLd) blogJsonLd.remove();
    };
  }, [title, description, ogImage, ogType, canonicalUrl, jsonLd]);
}
