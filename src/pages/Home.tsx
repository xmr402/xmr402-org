import { useState } from 'react'
import { Link } from 'wouter'
import { ShieldCheck, Zap, UserCheck, Share2, GlobeLock, Terminal, Copy, Check, ExternalLink, Box, Cpu, Laptop, FileText, ChevronDown, ChevronUp } from 'lucide-react'
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
        title="Copy to clipboard"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied && <span className="text-[10px] ml-1 uppercase tracking-tighter">Copied</span>}
      </button>
      <div className="code-scroll-container">
        <code>{code}</code>
      </div>
    </div>
  )
}

export function Home() {
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
        <div className="status-badge inline-flex!">PROTOCOL v{import.meta.env.VITE_PROTOCOL_VERSION || '2.0.0'} • TRANSPORT AGNOSTIC</div>
        <h1>XMR402</h1>
        <p className="subtitle">The Internet’s Sovereign Payment Primitive for Agents, APIs, & Relays.</p>
        <p className="max-w-2xl mx-auto mt-6 text-[var(--text-dim)] leading-relaxed">
          XMR402 is an open, neutral standard for internet-native payments. In v2.0, it evolves into a decoupled, transport-agnostic primitive. Whether you're gating REST APIs via HTTP 402 or streaming P2P JSON frames over WebSockets, XMR402 enables any client to buy network resources in milliseconds. 
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-8 py-3 bg-[var(--brand-color)] text-black font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            INTERACT WITH PROTOCOL
          </button>
          <a
            href="/XMR402_Whitepaper.pdf"
            target="_blank"
            className="px-8 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase text-sm tracking-widest hover:bg-[var(--brand-color)]/10 transition-all flex items-center justify-center gap-2 text-center"
          >
            <FileText size={18} />
            WHITEPAPER
          </a>
          <Link
            href="/ecosystem"
            className="px-8 py-3 border border-[var(--border-color)] text-[var(--text-primary)] font-black uppercase text-sm tracking-widest hover:bg-[var(--brand-color)]/10 transition-all flex items-center justify-center gap-2 text-center"
          >
            <Box size={18} />
            ECOSYSTEM
          </Link>
        </div>
      </header>

      {/* ONE-LINER SECTION */}
      <section id="one-liner">
        <div className="one-liner-box">
          <div className="one-liner-header">
            <Terminal size={20} />
            <span>Accept payments with a single line of code</span>
          </div>
          <CodeBlock code={oneLinerCode} label="With Ripley Guard" />
          <div className="one-liner-footer">
            That's it. Add one line of code to require payment for each incoming request. If a request arrives without payment, the server responds with HTTP 402, prompting the client to pay and retry.
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="introduction">
        <h2>Protocol Pillars</h2>
        <div className="advantages-grid">
          <div className="advantage-card border-l-2 border-amber-500">
            <h3><Zap size={18} className="text-amber-500" /> <span>Transport Agnostic</span></h3>
            <p>From IETF HTTP 402 Headers to persistent JSON WebSocket relays. Dumb pipes, smart cryptographic edges.</p>
          </div>
          <div className="advantage-card border-l-2 border-emerald-500">
            <h3><ShieldCheck size={18} className="text-emerald-500" /> <span>Payload Binding</span></h3>
            <p>Intent matters. Every payment is cryptographically HMAC-bound to the request payload to kill instruction-spoofing.</p>
          </div>
          <div className="advantage-card border-l-2 border-sky-500">
            <h3><UserCheck size={18} className="text-sky-500" /> <span>Zero friction</span></h3>
            <p>No accounts, no email, no personal information needed. Just a Monero wallet and a challenge.</p>
          </div>
          <div className="advantage-card border-l-2 border-purple-500">
            <h3><Share2 size={18} className="text-purple-500" /> <span>Absolute Speed</span></h3>
            <p>Money moves at the speed of the internet. 0-conf verification ensures 200ms resource access.</p>
          </div>
          <div className="advantage-card border-l-2 border-rose-500">
            <h3><GlobeLock size={18} className="text-rose-500" /> <span>Stateless Purity</span></h3>
            <p>No databases. No polling. No wallet tracking bloat. XMR402 architecture relies purely on math and node RPCs.</p>
          </div>
        </div>
      </section>

      {/* CODE DEMO */}
      <section id="demo">
        <h2>Tactical Implementation</h2>
        <div className="spec-preview">
          <CodeBlock label="Standard 402 Response (Server-side)" code={server402Code} />
          <CodeBlock label="Authorization Header (Client-side)" code={clientAuthCode} />
        </div>
        <div className="spec-link-box" style={{ marginTop: '2rem' }}>
          <p className="mb-4">It's how the internet should be: open, free, and effortless.</p>
          <a href="https://github.com/xmr402/XMR402-org/blob/main/SPEC.md" target="_blank" rel="noopener noreferrer">
            READ THE FULL SPECIFICATION ON GITHUB
          </a>
        </div>
      </section>

      {/* SEQUENCE FLOW */}
      <section id="flow">
        <div className="flow-header">
          <h2>The Tactical Flow</h2>
          <div className="tab-switcher">
            <button
              className={activeFlow === 'human' ? 'active' : ''}
              onClick={() => setActiveFlow('human')}
            >
              HUMAN (Terminal)
            </button>
            <button
              className={activeFlow === 'agent' ? 'active' : ''}
              onClick={() => setActiveFlow('agent')}
            >
              AGENT (HTTP)
            </button>
            <button
              className={activeFlow === 'relay' ? 'active' : ''}
              onClick={() => setActiveFlow('relay')}
            >
              RELAY (WebSocket)
            </button>
          </div>
        </div>

        <div className="flow-steps-container">
          {activeFlow === 'human' ? (
            <>
              <ProtocolStep
                number="01"
                title="Resource Request"
                actor="Web Browser"
                description="User visits a paywalled page or triggers a protected API call."
              />
              <ProtocolStep
                number="02"
                title="Protocol Challenge"
                actor="Server Guard"
                description="Server rejects with 402 Payment Required + WWW-Authenticate: XMR402 challenge."
              />
              <ProtocolStep
                number="03"
                title="OS Deep-Link"
                actor="Deep Link"
                description="Browser catches the 402 response and triggers xmr402:// to wake up the local terminal."
              />
              <ProtocolStep
                number="04"
                title="Interactive Pay"
                actor="Ripley Terminal"
                description="Terminal displays a tactical modal. User clicks EXECUTE to sign and send XMR."
              />
              <ProtocolStep
                number="05"
                title="Submission"
                actor="Authorization"
                description="Terminal submits the TXID and TX-Proof back to the server via the return_url."
              />
              <ProtocolStep
                number="06"
                title="Instant Unlock"
                actor="Unlocked"
                description="Server verifies 0-conf proof against its node and unlocks the resource in real-time."
              />
            </>
          ) : activeFlow === 'agent' ? (
            <>
              <ProtocolStep
                number="01"
                title="Agent Request"
                actor="AI Agent"
                description="Agent script requests a protected API resource."
              />
              <ProtocolStep
                number="02"
                title="Dry Challenge"
                actor="Server Guard"
                description="Server issues a 402 Payment Required with the payment challenge payload."
              />
              <ProtocolStep
                number="03"
                title="Gateway Hook"
                actor="XMR Gateway"
                description="Agent pipes the challenge to its local Ripley XMR Gateway for processing."
              />
              <ProtocolStep
                number="04"
                title="Auto-Signature"
                actor="Sovereign Node"
                description="Gateway automatically creates a transaction and generates an IETF-compliant Authorization header."
              />
              <ProtocolStep
                number="05"
                title="Protocol Payload"
                actor="Auth Header"
                description="Agent re-submits the request with the Authorization: XMR402 header included."
              />
              <ProtocolStep
                number="06"
                title="Machine Unlock"
                actor="Access API"
                description="Guard verifies proof instantly. Agent receives the resource data without human intervention."
              />
            </>
            ) : (
              <>
                <ProtocolStep
                  number="01"
                  title="P2P Connection"
                  actor="WS Client"
                  description="Agent opens a persistent WebSocket connection to a Nostr relay or P2P host."
                />
                <ProtocolStep
                  number="02"
                  title="Resource Demand"
                  actor="JSON Frame"
                  description="Client pushes a JSON request frame to access a specific data stream."
                />
                <ProtocolStep
                  number="03"
                  title="Protocol Payload"
                  actor="Edge Guard"
                  description="Server pushes back a PAYMENT_CHALLENGE JSON frame containing the XMR402 specs."
                />
                <ProtocolStep
                  number="04"
                  title="Sovereign Execution"
                  actor="XMR Gateway"
                  description="Agent invokes local Ripley Gateway to execute transaction and generate proof."
                />
                <ProtocolStep
                  number="05"
                  title="Proof Submission"
                  actor="JSON Frame"
                  description="Agent pushes a PAYMENT_PROOF JSON frame containing the TXID and cryptographic signature."
                />
                <ProtocolStep
                  number="06"
                  title="Stream Unlocked"
                  actor="Edge Router"
                  description="Server verifies the proof statelessly and opens the data firehose on the current socket."
                />
              </>
          )}
        </div>
      </section>

      {/* COMPARISONS */}
      <section id="comparisons">
        <h2>Evolution of Payment</h2>
        <div className="table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Legacy XMR Payment</th>
                <th>XMR402 Standard</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature">Verification Speed</td>
                <td>Minutes (Wait for block)</td>
                <td>Seconds (0-conf TX Proof)</td>
              </tr>
              <tr>
                <td className="feature">Friction</td>
                <td>Manual Address Copy-Paste</td>
                <td>Zero-click Deep-link Union</td>
              </tr>
              <tr>
                <td className="feature">UI/UX</td>
                <td>Polling / Refreshing</td>
                <td>Real-time Gate Unlocking</td>
              </tr>
              <tr>
                <td className="feature">Agent Support</td>
                <td>Impossible for AI</td>
                <td>Native HTTP Standard</td>
              </tr>
              <tr>
                <td className="feature">Payload Security</td>
                <td>Blind Payments</td>
                <td>Instruction Binding (HMAC)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* IMPLEMENTATIONS SHOWCASE */}
      <section id="implementations">
        <h2>Reference Implementations</h2>
        <div className="implementations-grid">
          <div className="impl-card border-t-2 border-emerald-500">
            <div className="impl-header">
              <div className="impl-icon"><Box size={24} /></div>
            </div>
            <div className="impl-meta">
              <a href="https://kyc.rip/guard" target="_blank" rel="noopener noreferrer">
                <h3>Ripley Guard</h3>
              </a>
              <p>Industrial-grade middleware for Hono, Express, and standard HTTP servers.</p>
              <a href="https://kyc.rip/guard" target="_blank" rel="noopener noreferrer" className="impl-action">
                LEARN MORE <ExternalLink size={14} />
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
              <p>High-availability payment gateway for autonomous AI agent micro-transactions.</p>
              <a href="https://kyc.rip/ripley" target="_blank" rel="noopener noreferrer" className="impl-action">
                LEARN MORE <ExternalLink size={14} />
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
              <p>Tactical desktop terminal for sovereign identity and deep-link payment unions.</p>
              <a href="https://kyc.rip/wallet" target="_blank" rel="noopener noreferrer" className="impl-action">
                LEARN MORE <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid flex flex-col gap-0 border-t border-[var(--border-color)]">
          <FAQItem
            question="What is XMR402 used for?"
            answer="XMR402 is designed for high-frequency, low-friction micro-payments. Key use cases include pay-per-request API access, dynamic content gating, autonomous AI agent interactions, and decentralized service monetization without the need for traditional account systems."
          />
          <FAQItem
            question="Is XMR402 production ready?"
            answer="The XMR402 v1.0.1 specification is finalized. Stable reference implementations are available in TypeScript, Go, and Rust. It is currently undergoing production-grade integration within the Ripley AI ecosystem and the Ghost Protocol."
          />
          <FAQItem
            question="How do I integrate XMR402?"
            answer="Integration is straightforward. Developers can deploy the Ripley Guard middleware on the server-side to intercept requests and issue challenges. Clients must be configured to handle HTTP 402 responses by initiating the XMR402 deep-link protocol with a compatible wallet."
          />
          <FAQItem
            question="What blockchains does XMR402 support?"
            answer={
              <>
                While the XMR402 standard is blockchain-agnostic, it prioritizes <strong>Monero (XMR)</strong> due to its superior privacy primitives and native transaction proof capabilities. Compatibility with other privacy-preserving networks is currently under research.
              </>
            }
          />
          <FAQItem
            question="Is 0-conf safe from double-spend attacks?"
            answer="XMR402 relies on 0-confirmation (mempool) transactions to ensure the zero-latency access required by AI agents and active API streams. While 0-conf carries a theoretical risk of double-spending or chain reorgs, the economic incentive to attack a micro-payment (e.g., $0.005) is vastly outweighed by the cost and difficulty of the attack. XMR402 is strictly optimized for high-frequency, low-value digital interactions where this tactical trade-off is mathematically sound."
          />
          <FAQItem
            question="Does it require a special wallet?"
            answer="XMR402 is compatible with any wallet that supports the Monero Transaction Proof (TX Proof) standard. For the most seamless and tactical experience, we recommend using the Ripley Terminal."
          />
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
