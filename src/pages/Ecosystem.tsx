import { useState, useEffect } from 'react'
import { Box, Github, Terminal, Zap, ShieldCheck, HeartHandshake, Wallet, Wrench, Globe, Twitter } from 'lucide-react'

const CategoryIconMap: Record<string, React.ReactNode> = {
  'guards': <ShieldCheck size={20} className="text-emerald-500" />,
  'gateways': <Zap size={20} className="text-amber-500" />,
  'agent-skills': <Terminal size={20} className="text-sky-500" />,
  'services': <HeartHandshake size={20} className="text-purple-500" />,
  'wallets': <Wallet size={20} className="text-indigo-500" />,
  'tools': <Wrench size={20} className="text-rose-500" />,
  'misc': <Box size={20} className="text-[var(--text-dim)]" />
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  category: string;
  tagline: string;
  status: string;
  url?: string;
  github?: string;
  author: string;
  logo_url?: string;
}

interface EcosystemData {
  categories: Category[];
  featured_ids: string[];
  projects: Project[];
}

export function Ecosystem() {
  const [data, setData] = useState<EcosystemData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    fetch('https://kyc-rip.github.io/xmr402-ecosystem/ecosystem.json')
      .then(res => res.json())
      .then((json: EcosystemData) => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load ecosystem data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-pulse flex items-center gap-2 text-[var(--text-dim)]">
          <Terminal size={18} />
          <span>INITIALIZING DATALINK...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-32 text-rose-500 border border-rose-500/20 bg-rose-500/5 p-8 max-w-lg mx-auto">
        CONNECTION FAILED: Unable to retrieve ecosystem state.
      </div>
    )
  }

  const filteredCategories = activeCategory === 'all'
    ? data.categories
    : data.categories.filter(c => c.id === activeCategory);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-16 mb-24 flex flex-col md:flex-row gap-8 lg:gap-16 relative items-start">

      {/* SIDEBAR */}
      <aside className="w-full md:w-48 lg:w-56 md:sticky md:top-24 flex-shrink-0">
        <h1 className="text-3xl font-black tracking-tighter mb-8 px-2 text-[var(--text-primary)] uppercase">
          Ecosystem
        </h1>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeCategory === 'all' ? 'bg-[var(--text-primary)]/5 text-[var(--text-primary)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'}`}
          >
            <Box size={18} className={activeCategory === 'all' ? 'text-[var(--text-primary)]' : ''} />
            <span>Everything</span>
          </button>

          <div className="my-2 border-t border-[var(--border-color)]"></div>

          {data.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${activeCategory === cat.id ? 'bg-[var(--text-primary)]/5 text-[var(--text-primary)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'}`}
            >
              <div className={activeCategory === cat.id ? 'opacity-100' : 'opacity-70 grayscale'}>
                {CategoryIconMap[cat.id] || <Box size={18} />}
              </div>
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full min-w-0">
        {/* HERO HEADER */}
        {activeCategory === 'all' && (
          <div className="mb-16 border border-[var(--border-color)] p-8 rounded-xl bg-[var(--bg-panel)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
              <Terminal size={300} />
            </div>
            <div className="relative z-10 max-w-xl">
              <div className="status-badge inline-flex items-center gap-2 mb-4 text-[10px] font-mono bg-[var(--brand-color)]/10 text-[var(--brand-color)] px-2 py-1 border border-[var(--brand-color)]/20 rounded">
                <Box size={10} className="translate-y-[-0.5px]" />
                <span className="leading-none uppercase tracking-tighter">Protocol Ecosystem</span>
              </div>
              <h2 className="text-3xl font-black mb-4 uppercase">The Builders</h2>
              <p className="text-[var(--text-dim)] leading-relaxed text-sm lg:text-base">
                Discover innovative projects, tools, and applications built by our growing community of partners and developers leveraging XMR402 technology. The autonomous economy is here.
              </p>
            </div>
          </div>
        )}

        {/* LISTINGS */}
        {filteredCategories.map(category => {
          const catProjects = data.projects.filter(p => p.category === category.id);

          return (
            <section key={category.id} className="mb-16">
              <div className="flex items-end justify-between mb-6 pb-2 border-b border-[var(--border-color)]">
                <div>
                  <h3 className="text-2xl font-black uppercase text-[var(--text-primary)] leading-tight">{category.name}</h3>
                  <p className="text-[var(--text-dim)] text-sm mt-1">{category.description}</p>
                </div>
              </div>

              {catProjects.length === 0 ? (
                <div className="border border-dashed border-[var(--border-color)] rounded-xl py-12 px-6 text-center bg-[var(--bg-primary)]">
                  <Terminal size={32} className="mx-auto text-[var(--border-color)] mb-4" />
                  <p className="text-[var(--text-dim)] font-mono text-sm uppercase tracking-wider">No active datalinks detected</p>
                  <p className="text-[var(--text-dim)] text-xs mt-2 opacity-70">Be the first to deploy an implementation in this sector.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catProjects.map(project => (
                    <div key={project.id} className="bg-[var(--bg-panel)] border border-[var(--border-color)] border-t-[3px] border-t-[var(--text-primary)] p-0 hover:border-[var(--brand-color)] hover:border-t-[var(--brand-color)] transition-all flex flex-col h-full relative group shadow-sm bg-gradient-to-b from-[var(--bg-panel)] to-transparent">

                      <div className="p-5 flex-grow">
                        {/* CARD HEADER: LOGO/FALLBACK & CATEGORY TAG */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex gap-3 w-full min-w-0 pr-2">
                            {/* LOGO BOX */}
                            <div className="w-12 h-12 rounded-sm border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-center overflow-hidden flex-shrink-0">
                              {project.logo_url ? (
                                <img src={project.logo_url} alt={project.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                <span className="text-xl font-black text-[var(--text-primary)] opacity-80 uppercase tracking-tighter">
                                  {project.name.charAt(0)}{project.name.charAt(1)}
                                </span>
                              )}
                            </div>

                            {/* CATEGORY & TITLE */}
                            <div className="flex flex-col justify-center min-w-0 flex-grow">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                                  {category.name}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-[var(--text-primary)] leading-tight truncate w-full" title={project.name}>{project.name}</h4>
                            </div>
                          </div>

                          {/* STATUS BADGE */}
                          <div className="flex-shrink-0 absolute top-4 right-4">
                            {(project.status === 'Mainnet Live' || project.status === "Production") && (
                              <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-bold rounded">LIVE</div>
                            )}
                            {(project.status === 'Alpha' || project.status === 'Beta') && (
                              <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-[10px] uppercase font-bold rounded">{project.status}</div>
                            )}
                            {project.status === 'Planning' && (
                              <div className="bg-[var(--text-dim)]/10 text-[var(--text-dim)] border border-[var(--border-color)] px-2 py-0.5 text-[10px] uppercase font-bold rounded">DEV</div>
                            )}
                          </div>
                        </div>

                        {/* TAGLINE */}
                        <p className="text-[var(--text-dim)] text-sm leading-relaxed mt-2 line-clamp-6 min-h-[5.5rem]">
                          {project.tagline}
                        </p>
                      </div>

                      {/* CARD FOOTER: LINKS & AUTHOR */}
                      <div className="px-5 py-3 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]/50">
                        <div className="flex items-center gap-3">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-color)] hover:opacity-80 transition-all p-1.5 border border-[var(--border-color)] hover:border-[var(--brand-color)] bg-[var(--bg-primary)] rounded-sm" title="Visit Website">
                              <Globe size={14} />
                            </a>
                          )}
                          {project.github && project.github !== 'PENDING_PR' && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-[var(--text-dim)] hover:text-white transition-all p-1.5 border border-[var(--border-color)] hover:border-white bg-[var(--bg-primary)] rounded-sm" title="View Source">
                              <Github size={14} />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-mono truncate max-w-[120px] flex items-center gap-1.5" title={project.author}>
                          {project.author.startsWith('@') ? (
                            <a
                              href={`https://x.com/${project.author.substring(1)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-[var(--brand-color)] transition-colors"
                            >
                              <Twitter size={10} />
                              {project.author}
                            </a>
                          ) : (
                            project.author
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* OPEN SOURCE CTA */}
        {activeCategory === 'all' && (
          <section className="mt-24 pt-12 border-t border-dashed border-[var(--border-color)] text-center pb-8">
            <div className="max-w-xl mx-auto">
              <Github size={32} className="mx-auto text-[var(--text-dim)] mb-4 opacity-50" />
              <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Deploy to Ecosystem</h3>
              <p className="text-[var(--text-dim)] mb-6 text-sm">
                Built an XMR402 native app or skill? Add your project to this registry transparently through an open Pull Request.
              </p>
              <a
                href="https://github.com/KYC-rip/xmr402-ecosystem/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black uppercase text-xs tracking-widest hover:bg-[var(--brand-color)] hover:opacity-90 transition-all rounded-sm"
              >
                <Terminal size={14} />
                OPEN A PR
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
