import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Terminal, Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLocalizedContent } from '../utils/i18n-content'
import { useSEO } from '../hooks/useSEO'

interface BlogPostMeta {
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  author: string
  date: string
  tags: string[]
  ogImage: string
}

export function Blog() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<BlogPostMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useSEO({
    title: 'Blog | XMR402',
    description: 'Latest news, guides, and insights about XMR402, HTTP 402, and the agentic economy.',
    ogType: 'website',
    canonicalUrl: 'https://xmr402.org/blog',
  })

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data: BlogPostMeta[]) => {
        setPosts(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

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

  if (error) {
    return (
      <div className="text-center py-32 text-rose-500 border border-rose-500/20 bg-rose-500/5 p-8 max-w-lg mx-auto">
        {t('blog.error')}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-16 mb-24">
      {/* HEADER */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="status-badge inline-flex items-center gap-2 text-[10px] font-mono bg-[var(--brand-color)]/10 text-[var(--brand-color)] px-2 py-1 border border-[var(--brand-color)]/20 rounded">
            <BookOpen size={10} className="translate-y-[-0.5px]" />
            <span className="leading-none uppercase tracking-tighter">{t('blog.badge')}</span>
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-4 text-[var(--text-primary)] uppercase">
          {t('blog.title')}
        </h1>
        <p className="text-[var(--text-dim)] text-sm leading-relaxed max-w-2xl">
          {t('blog.subtitle')}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-[var(--border-color)] rounded-xl py-12 px-6 text-center bg-[var(--bg-primary)]">
          <Terminal size={32} className="mx-auto text-[var(--border-color)] mb-4" />
          <p className="text-[var(--text-dim)] font-mono text-sm uppercase tracking-wider">{t('blog.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group bg-[var(--bg-panel)] border border-[var(--border-color)] border-t-[3px] border-t-[var(--text-primary)] p-0 hover:border-[var(--brand-color)] hover:border-t-[var(--brand-color)] transition-all shadow-sm cursor-pointer">
                <div className="p-6 sm:p-8">
                  {/* DATE & AUTHOR */}
                  <div className="flex items-center gap-4 mb-3 text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-mono">
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

                  {/* TITLE */}
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-3 group-hover:text-[var(--brand-color)] transition-colors">
                    {getLocalizedContent(post.title)}
                  </h2>

                  {/* EXCERPT */}
                  <p className="text-[var(--text-dim)] text-sm leading-relaxed mb-4 line-clamp-3">
                    {getLocalizedContent(post.description)}
                  </p>

                  {/* TAGS & READ MORE */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-[9px] uppercase font-bold text-[var(--text-dim)] tracking-wider bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-sm"
                        >
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[var(--brand-color)] group-hover:gap-3 transition-all">
                      {t('blog.read_more')}
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
