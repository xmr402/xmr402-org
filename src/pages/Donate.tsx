import { useState, useEffect } from 'react'
import { Copy, Check, Heart, Shield, Zap } from 'lucide-react'
import QRCode from 'react-qr-code'

export function Donate() {
  const [copied, setCopied] = useState(false)
  const [xmrAddress, setXmrAddress] = useState<string>('82txTMTFiXihfBeJL5E6keb1p8pzGhdAMb1u6dwnCu66hBgP8orJSKAMuAMjg5HkaTaSTRUVDHo67WAv3FFjt4CW73b8scF') // Fallback
  const openAlias = 'donate.xmr402.org'

  useEffect(() => {
    fetch('https://demo-api.xmr402.org/intel')
      .then(res => {
        const authHeader = res.headers.get('WWW-Authenticate')
        if (authHeader && authHeader.startsWith('XMR402')) {
          const match = authHeader.match(/address="([^"]+)"/)
          if (match && match[1]) {
            setXmrAddress(match[1])
          }
        }
      })
      .catch(err => console.error('Failed to fetch donation address:', err))
  }, [])

  const copyToClipboard = () => {
    // Note: In a real app, uses navigator.clipboard.writeText
    // For this demo, we just show the success state
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="donate-page animate-fade-in">
      <header className="hero">
        <div className="status-badge inline-flex!">DIRECT CONTRIBUTION • OPENALIAS ACTIVE</div>
        <h1>SUPPORT</h1>
        <p className="subtitle">Powering the Sovereignty Layer for AI & Human Micro-payments.</p>
      </header>

      <div className="donation-grid mt-16">
        {/* OPENALIAS CARD */}
        <div className="advantage-card border-brand!">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-[var(--brand-color)]" size={24} />
            <h3 className="m-0! uppercase tracking-wider">OpenAlias</h3>
          </div>
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded font-mono text-center relative group">
            <span className="text-xl font-bold tracking-tighter">{openAlias}</span>
            <div className="text-[10px] text-[var(--text-dim)] mt-2 uppercase font-bold">Standardized Monero Routing</div>
          </div>
          <p className="mt-6 text-sm text-[var(--text-dim)] leading-relaxed">
            Send directly from any Monero wallet by typing <code className="text-[var(--brand-color)]">{openAlias}</code>.
            No long strings, just resolve and execute.
          </p>
        </div>

        {/* ADDRESS CARD */}
        <div className="advantage-card relative overflow-hidden h-full">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[var(--brand-color)]" size={24} />
            <h3 className="m-0! uppercase tracking-wider">Monero Address</h3>
          </div>

          <div className="address-container relative mt-4">
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded break-all font-mono text-[11px] leading-relaxed text-emerald-500/80">
              {xmrAddress}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(xmrAddress);
                copyToClipboard();
              }}
              className="absolute top-2 right-2 p-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-all"
              title="Copy Address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <div className="flex justify-center mt-8 p-4 bg-white rounded-lg w-fit mx-auto shadow-[0_0_30px_rgba(255,255,255,0.05)] border-4 border-[var(--border-color)]">
            <div className="w-32 h-32 flex items-center justify-center">
              <QRCode
                value={`monero:${xmrAddress}`}
                size={128}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 128 128`}
              />
            </div>
          </div>
          <div className="text-center mt-2 text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-widest">Scan to Support</div>
        </div>
      </div>

      <section className="mt-24 max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Heart className="text-rose-500 animate-pulse" size={32} />
        </div>
        <h2 className="justify-center! after:hidden!">Why Donate?</h2>
        <p className="text-[var(--text-dim)] leading-relaxed text-lg">
          Donations fund the development of the XMR402 standard, infrastructure for the Ecosystem directory,
          and high-availability Monero RPC nodes for public usage.
          Help us build a future where AI agents can trade value without gatekeepers.
        </p>
      </section>

      <div className="text-center mt-12">
        <a href="/" className="text-[var(--brand-color)] hover:underline font-bold tracking-widest uppercase text-xs">
          ← Back to Protocol Base
        </a>
      </div>
    </div>
  )
}
