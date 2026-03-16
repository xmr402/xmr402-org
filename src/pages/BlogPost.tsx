import { useState, useEffect, lazy, Suspense } from 'react'
import { useRoute, Link } from 'wouter'
import { Terminal, Calendar, Tag, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const MermaidBlock = lazy(() =>
  import('../components/MermaidBlock').then((m) => ({ default: m.MermaidBlock }))
)
import { getLocalizedContent } from '../utils/i18n-content'
import { useSEO } from '../hooks/useSEO'

interface BlogPostData {
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  content: Record<string, string>
  author: string
  date: string
  tags: string[]
  ogImage: string
  coverImage?: string
  updatedAt?: string
}

const markdownComponents: Components = {
  pre({ children, ...props }) {
    // Check if the child is a mermaid code block
    const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>
    if (child?.props?.className === 'language-mermaid') {
      const text = String(child.props.children).replace(/\n$/, '')
      return (
        <Suspense fallback={<pre><code>{text}</code></pre>}>
          <MermaidBlock chart={text} />
        </Suspense>
      )
    }
    return <pre {...props}>{children}</pre>
  },
}

export function BlogPost() {
  const { t } = useTranslation()
  const [, params] = useRoute('/blog/:slug')
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const title = post ? getLocalizedContent(post.title) : ''
  const description = post ? getLocalizedContent(post.description) : ''
  const content = post ? getLocalizedContent(post.content) : ''

  useSEO({
    title: post ? `${title} | XMR402 Blog` : 'Blog | XMR402',
    description: description || 'XMR402 Blog',
    ogImage: post?.coverImage || post?.ogImage,
    ogType: 'article',
    canonicalUrl: post ? `https://xmr402.org/blog/${post.slug}` : undefined,
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: title,
          description: description,
          image: post.coverImage || post.ogImage,
          datePublished: post.date,
          dateModified: post.updatedAt ?? post.date,
          author: { '@type': 'Person', name: post.author },
          publisher: {
            '@type': 'Organization',
            name: 'XMR402',
            url: 'https://xmr402.org',
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://xmr402.org/blog/${post.slug}`,
          },
        }
      : undefined,
  })

  useEffect(() => {
    if (!params?.slug) return
    fetch(`/api/blog/${params.slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data: BlogPostData) => {
        setPost(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [params?.slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-pulse flex items-center gap-2 text-[var(--text-dim)]">
          <Terminal size={18} />
          <span>{t('blog.loading')}</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-32">
        <h1 className="text-4xl font-black mb-4 text-[var(--text-primary)]">404</h1>
        <p className="text-[var(--text-dim)] mb-6">{t('blog.not_found')}</p>
        <Link href="/blog" className="text-[var(--brand-color)] hover:underline">
          {t('blog.back_to_blog')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 mt-16 mb-24">
      {/* BACK LINK */}
      <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[var(--text-dim)] hover:text-[var(--brand-color)] transition-colors mb-8">
        <ArrowLeft size={12} />
        {t('blog.back_to_blog')}
      </Link>

      {/* COVER IMAGE */}
      {post.coverImage && (
        <div className="w-full rounded-lg overflow-hidden mb-8 border border-[var(--border-color)]">
          <img
            src={post.coverImage}
            alt={title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* POST HEADER */}
      <header className="mb-10 pb-8 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4 mb-4 text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-mono">
          <span className="flex items-center gap-1.5">
            <Calendar size={10} />
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>•</span>
          <span>{post.author}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4 leading-tight">
          {title}
        </h1>

        <p className="text-[var(--text-dim)] text-base leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-sm"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* POST CONTENT */}
      <article className="blog-content">
        <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </Markdown>
      </article>

      {/* FOOTER */}
      <footer className="mt-16 pt-8 border-t border-[var(--border-color)]">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[var(--brand-color)] hover:gap-3 transition-all">
          <ArrowLeft size={12} />
          {t('blog.back_to_blog')}
        </Link>
      </footer>
    </div>
  )
}
