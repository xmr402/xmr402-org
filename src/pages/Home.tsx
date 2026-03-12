import { useState } from 'react'
import { Link } from 'wouter'
import { ShieldCheck, Zap, UserCheck, Share2, GlobeLock, Terminal, Copy, Check, ExternalLink, Box, Cpu, Laptop, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'
import { XMR402Demo } from '../components/XMR402Demo'

const ProtocolStep = ({ number, title, actor, description }: { number: string, title: string, actor: string, description: string }) => (
  <div className="flow-step">
    <div className="step-badge-container">
      <div className="step-number">{number}</div>
      <div className="step-line" />
    </div>
    <div className="step-content">
      <div className="step-header">
        <h4>{title}</h4>
        <span className="step-actor">{actor}</span>
      </div>
      <p>{description}</p>
    </div>
  </div>
)

const FAQItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`faq-item border-b border-[var(--border-color)] py-4 cursor-pointer transition-all duration-300 ${isOpen ? 'bg-[var(--brand-color)]/5 px-4' : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className="flex justify-between items-center group">
        <h4 className={`text-lg mx-2 transition-colors ${isOpen ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-dim)] group-hover:text-[var(--text-primary)]'}`}>{question}</h4>
        {isOpen ? <ChevronUp className="text-[var(--text-dim)]" size={20} /> : <ChevronDown className="text-[var(--text-dim)]" size={20} />}
      </div>
      {isOpen && <div className="mt-4 mx-4 text-[var(--text-dim)] animate-in fade-in slide-in-from-top-2 duration-300 leading-relaxed">{answer}</div>}
    </div>
  )
}

const CodeBlock = ({ code, label }: { code: string, label?: string }) => {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block group">
      {label && <h3>{label}</h3>}
      <button
        onClick={handleCopy}
        className={`copy-btn ${copied ? 'text-emerald-500' : ''}`}
        title={t('home.copy_tooltip')}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied && <span className="text-[10px] ml-1 uppercase tracking-tighter">{t('home.copied')}</span>}
      </button>
      <div className="code-scroll-container">
        <code>{code}</code>
      </div>
    </div>
  )
}

export function Home() {
  const { t } = useTranslation()
  const [activeFlow, setActiveFlow] = useState<'human' | 'agent' | 'relay'>('human')
  const [showDemoModal, setShowDemoModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('xmr402_txid');
    }
    return false;
  });

  const oneLinerCode = `app.use(
  paymentMiddleware({
    "GET /weather": {
      accepts: ["XMR"],
      amount: 0.001,
      description: "Weather data",
    },
  })
);`

  const server402Code = `WWW-Authenticate: XMR402 address="8...", amount="1000", message="nonce_123", timestamp="1710500000000"`
  const clientAuthCode = `Authorization: XMR402 txid="<hash>", proof="<signature>"`

  return (
    <>
      {/* HERO */}
      <header className="hero mt-16">
        <div className="status-badge inline-flex!">{t('home.hero.badge', { version: import.meta.env.VITE_PROTOCOL_VERSION || '2.0.0' })}</div>
        <h1>XMR402</h1>
        <p className="subtitle">{t('home.hero.subtitle')}</p>
        <p className="max-w-2xl mx-auto mt-6 text-[var(--text-dim)] leading-relaxed">
          {t('home.hero.description')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-8 py-3 bg-[var(--brand-color)] text-black font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {t('home.hero.cta_interact')}
          </button>
          <a
            href="/XMR402_Whitepaper.pdf"
            target="_blank"
            className="px-8 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase text-sm tracking-widest hover:bg-[var(--brand-color)]/10 transition-all flex items-center justify-center gap-2 text-center"
          >
            <FileText size={18} />
            {t('home.hero.cta_whitepaper')}
          </a>
          <Link
            href="/ecosystem"
            className="px-8 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase text-sm tracking-widest hover:bg-[var(--brand-color)]/10 transition-all flex items-center justify-center gap-2 text-center"
          >
            <Box size={18} />
            {t('home.hero.cta_ecosystem')}
          </Link>
        </div>
      </header>

      {/* ONE-LINER SECTION */}
      <section id="one-liner">
        <div className="one-liner-box">
          <div className="one-liner-header">
            <Terminal size={20} />
            <span>{t('home.oneliner.header')}</span>
          </div>
          <CodeBlock code={oneLinerCode} label={t('home.oneliner.code_label')} />
          <div className="one-liner-footer">
            {t('home.oneliner.footer')}
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="introduction">
        <h2>{t('home.pillars.title')}</h2>
        <div className="advantages-grid">
          <div className="advantage-card border-l-2 border-amber-500">
            <h3><Zap size={18} className="text-amber-500" /> <span>{t('home.pillars.transport_agnostic')}</span></h3>
            <p>{t('home.pillars.transport_agnostic_desc')}</p>
          </div>
          <div className="advantage-card border-l-2 border-emerald-500">
            <h3><ShieldCheck size={18} className="text-emerald-500" /> <span>{t('home.pillars.payload_binding')}</span></h3>
            <p>{t('home.pillars.payload_binding_desc')}</p>
          </div>
          <div className="advantage-card border-l-2 border-sky-500">
            <h3><UserCheck size={18} className="text-sky-500" /> <span>{t('home.pillars.zero_friction')}</span></h3>
            <p>{t('home.pillars.zero_friction_desc')}</p>
          </div>
          <div className="advantage-card border-l-2 border-purple-500">
            <h3><Share2 size={18} className="text-purple-500" /> <span>{t('home.pillars.absolute_speed')}</span></h3>
            <p>{t('home.pillars.absolute_speed_desc')}</p>
          </div>
          <div className="advantage-card border-l-2 border-rose-500">
            <h3><GlobeLock size={18} className="text-rose-500" /> <span>{t('home.pillars.stateless_purity')}</span></h3>
            <p>{t('home.pillars.stateless_purity_desc')}</p>
          </div>
          <div className="advantage-card border-l-2 border-emerald-500">
            <h3><Zap size={18} className="text-emerald-500" /> <span>{t('home.pillars.zero_fees')}</span></h3>
            <p>{t('home.pillars.zero_fees_desc')}</p>
          </div>
        </div>
      </section>

      {/* CODE DEMO */}
      <section id="demo">
        <h2>{t('home.tactical.title')}</h2>
        <div className="spec-preview">
          <CodeBlock label={t('home.tactical.server_label')} code={server402Code} />
          <CodeBlock label={t('home.tactical.client_label')} code={clientAuthCode} />
        </div>
        <div className="spec-link-box" style={{ marginTop: '2rem' }}>
          <p className="mb-4">{t('home.tactical.spec_text')}</p>
          <a href="https://github.com/xmr402/XMR402-org/blob/main/SPEC.md" target="_blank" rel="noopener noreferrer">
            {t('home.tactical.spec_link')}
          </a>
        </div>
      </section>

      {/* SEQUENCE FLOW */}
      <section id="flow">
        <div className="flow-header">
          <h2>{t('home.flow.title')}</h2>
          <div className="tab-switcher">
            <button
              className={activeFlow === 'human' ? 'active' : ''}
              onClick={() => setActiveFlow('human')}
            >
              {t('home.flow.tab_human')}
            </button>
            <button
              className={activeFlow === 'agent' ? 'active' : ''}
              onClick={() => setActiveFlow('agent')}
            >
              {t('home.flow.tab_agent')}
            </button>
            <button
              className={activeFlow === 'relay' ? 'active' : ''}
              onClick={() => setActiveFlow('relay')}
            >
              {t('home.flow.tab_relay')}
            </button>
          </div>
        </div>

        <div className="flow-steps-container">
          {activeFlow === 'human' ? (
            <>
              <ProtocolStep number="01" title={t('home.flow.human.s1_title')} actor={t('home.flow.human.s1_actor')} description={t('home.flow.human.s1_desc')} />
              <ProtocolStep number="02" title={t('home.flow.human.s2_title')} actor={t('home.flow.human.s2_actor')} description={t('home.flow.human.s2_desc')} />
              <ProtocolStep number="03" title={t('home.flow.human.s3_title')} actor={t('home.flow.human.s3_actor')} description={t('home.flow.human.s3_desc')} />
              <ProtocolStep number="04" title={t('home.flow.human.s4_title')} actor={t('home.flow.human.s4_actor')} description={t('home.flow.human.s4_desc')} />
              <ProtocolStep number="05" title={t('home.flow.human.s5_title')} actor={t('home.flow.human.s5_actor')} description={t('home.flow.human.s5_desc')} />
              <ProtocolStep number="06" title={t('home.flow.human.s6_title')} actor={t('home.flow.human.s6_actor')} description={t('home.flow.human.s6_desc')} />
            </>
          ) : activeFlow === 'agent' ? (
            <>
              <ProtocolStep number="01" title={t('home.flow.agent.s1_title')} actor={t('home.flow.agent.s1_actor')} description={t('home.flow.agent.s1_desc')} />
              <ProtocolStep number="02" title={t('home.flow.agent.s2_title')} actor={t('home.flow.agent.s2_actor')} description={t('home.flow.agent.s2_desc')} />
              <ProtocolStep number="03" title={t('home.flow.agent.s3_title')} actor={t('home.flow.agent.s3_actor')} description={t('home.flow.agent.s3_desc')} />
              <ProtocolStep number="04" title={t('home.flow.agent.s4_title')} actor={t('home.flow.agent.s4_actor')} description={t('home.flow.agent.s4_desc')} />
              <ProtocolStep number="05" title={t('home.flow.agent.s5_title')} actor={t('home.flow.agent.s5_actor')} description={t('home.flow.agent.s5_desc')} />
              <ProtocolStep number="06" title={t('home.flow.agent.s6_title')} actor={t('home.flow.agent.s6_actor')} description={t('home.flow.agent.s6_desc')} />
            </>
            ) : (
              <>
                <ProtocolStep number="01" title={t('home.flow.relay.s1_title')} actor={t('home.flow.relay.s1_actor')} description={t('home.flow.relay.s1_desc')} />
                <ProtocolStep number="02" title={t('home.flow.relay.s2_title')} actor={t('home.flow.relay.s2_actor')} description={t('home.flow.relay.s2_desc')} />
                <ProtocolStep number="03" title={t('home.flow.relay.s3_title')} actor={t('home.flow.relay.s3_actor')} description={t('home.flow.relay.s3_desc')} />
                <ProtocolStep number="04" title={t('home.flow.relay.s4_title')} actor={t('home.flow.relay.s4_actor')} description={t('home.flow.relay.s4_desc')} />
                <ProtocolStep number="05" title={t('home.flow.relay.s5_title')} actor={t('home.flow.relay.s5_actor')} description={t('home.flow.relay.s5_desc')} />
                <ProtocolStep number="06" title={t('home.flow.relay.s6_title')} actor={t('home.flow.relay.s6_actor')} description={t('home.flow.relay.s6_desc')} />
              </>
          )}
        </div>
      </section>

      {/* COMPARISONS */}
      <section id="comparisons">
        <h2>{t('home.comparison.title')}</h2>
        <div className="table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{t('home.comparison.col_feature')}</th>
                <th>{t('home.comparison.col_legacy')}</th>
                <th>{t('home.comparison.col_xmr402')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature">{t('home.comparison.speed')}</td>
                <td>{t('home.comparison.speed_legacy')}</td>
                <td>{t('home.comparison.speed_xmr402')}</td>
              </tr>
              <tr>
                <td className="feature">{t('home.comparison.friction')}</td>
                <td>{t('home.comparison.friction_legacy')}</td>
                <td>{t('home.comparison.friction_xmr402')}</td>
              </tr>
              <tr>
                <td className="feature">{t('home.comparison.ux')}</td>
                <td>{t('home.comparison.ux_legacy')}</td>
                <td>{t('home.comparison.ux_xmr402')}</td>
              </tr>
              <tr>
                <td className="feature">{t('home.comparison.agent')}</td>
                <td>{t('home.comparison.agent_legacy')}</td>
                <td>{t('home.comparison.agent_xmr402')}</td>
              </tr>
              <tr>
                <td className="feature">{t('home.comparison.security')}</td>
                <td>{t('home.comparison.security_legacy')}</td>
                <td>{t('home.comparison.security_xmr402')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* IMPLEMENTATIONS SHOWCASE */}
      <section id="implementations">
        <h2>{t('home.implementations.title')}</h2>
        <div className="implementations-grid">
          <div className="impl-card border-t-2 border-emerald-500">
            <div className="impl-header">
              <div className="impl-icon"><Box size={24} /></div>
            </div>
            <div className="impl-meta">
              <a href="https://kyc.rip/guard" target="_blank" rel="noopener noreferrer">
                <h3>Ripley Guard</h3>
              </a>
              <p>{t('home.implementations.guard_desc')}</p>
              <a href="https://kyc.rip/guard" target="_blank" rel="noopener noreferrer" className="impl-action">
                {t('home.implementations.learn_more')} <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="impl-card border-t-2 border-amber-500">
            <div className="impl-header">
              <div className="impl-icon"><Cpu size={24} /></div>
            </div>
            <div className="impl-meta">
              <a href="https://kyc.rip/ripley" target="_blank" rel="noopener noreferrer">
                <h3>Ripley XMR Gateway</h3>
              </a>
              <p>{t('home.implementations.gateway_desc')}</p>
              <a href="https://kyc.rip/ripley" target="_blank" rel="noopener noreferrer" className="impl-action">
                {t('home.implementations.learn_more')} <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className="impl-card border-t-2 border-sky-500">
            <div className="impl-header">
              <div className="impl-icon"><Laptop size={24} /></div>
            </div>
            <div className="impl-meta">
              <a href="https://kyc.rip/wallet" target="_blank" rel="noopener noreferrer">
                <h3>Ripley Terminal</h3>
              </a>
              <p>{t('home.implementations.terminal_desc')}</p>
              <a href="https://kyc.rip/wallet" target="_blank" rel="noopener noreferrer" className="impl-action">
                {t('home.implementations.learn_more')} <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER SANDBOX */}
      <section id="sandbox" className="mt-24">
        <div className="border border-[var(--border-color)] bg-[var(--bg-panel)] p-10 sm:p-16 rounded-lg text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Terminal size={120} />
          </div>
          <h2 className="!mt-0 mb-6">{t('home.sandbox.title')}</h2>
          <p className="max-w-xl mx-auto text-[var(--text-dim)] mb-10">
            {t('home.sandbox.description')}
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-code)] p-2 border border-[var(--border-color)] rounded">
            <div className="px-6 py-3 font-mono text-[var(--brand-color)] text-sm sm:text-base select-all">
              https://demo-api.xmr402.org
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText("https://demo-api.xmr402.org");
                const btn = document.getElementById('copy-sandbox-btn');
                if (btn) btn.innerText = t('home.sandbox.copied');
                setTimeout(() => { if (btn) btn.innerText = t('home.sandbox.copy_url'); }, 2000);
              }}
              id="copy-sandbox-btn"
              className="px-6 py-3 bg-[var(--brand-color)] text-[var(--bg-primary)] font-black uppercase text-xs tracking-widest hover:opacity-90 min-w-[120px]"
            >
              {t('home.sandbox.copy_url')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-left">
            <div className="space-y-2">
              <h4 className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-black">{t('home.sandbox.http_gate')}</h4>
              <div className="text-xs font-mono text-[var(--brand-color)]">/intel</div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-black">{t('home.sandbox.ws_relay')}</h4>
              <div className="text-xs font-mono text-[var(--brand-color)]">/relay</div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-black">{t('home.sandbox.sdk_ts')}</h4>
              <a href="https://www.npmjs.com/package/@kyc-rip/ripley-guard-ts" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[var(--brand-color)] border-b border-[var(--brand-color)]/20 hover:border-[var(--brand-color)] cursor-pointer">@kyc-rip/ripley-guard-ts</a>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] text-[var(--text-dim)] uppercase tracking-widest font-black">{t('home.sandbox.environment')}</h4>
              <div className="text-xs font-mono text-[var(--brand-color)]">{t('home.sandbox.env_value')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <h2>{t('home.faq.title')}</h2>
        <div className="faq-grid flex flex-col gap-0 border-t border-[var(--border-color)]">
          <FAQItem question={t('home.faq.q1')} answer={t('home.faq.a1')} />
          <FAQItem question={t('home.faq.q2')} answer={t('home.faq.a2')} />
          <FAQItem question={t('home.faq.q3')} answer={t('home.faq.a3')} />
          <FAQItem question={t('home.faq.q4')} answer={t('home.faq.a4')} />
          <FAQItem
            question={t('home.faq.q5')}
            answer={
              <Trans i18nKey="home.faq.a5" components={{ 1: <strong /> }} />
            }
          />
          <FAQItem question={t('home.faq.q6')} answer={t('home.faq.a6')} />
          <FAQItem question={t('home.faq.q7')} answer={t('home.faq.a7')} />
        </div>
      </section>

      {showDemoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fade-in" onClick={() => setShowDemoModal(false)}>
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto relative shadow-[0_20px_40px_rgba(0,0,0,0.4)]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-1 right-2 bg-transparent text-[var(--text-dim)] hover:text-[var(--brand-color)] transition-colors p-2 text-2xl z-[1010]" onClick={() => setShowDemoModal(false)}>
              &times;
            </button>
            <XMR402Demo />
          </div>
        </div>
      )}
    </>
  )
}
