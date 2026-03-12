import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'
import QRCode from 'react-qr-code'

export function Donate() {
  const { t } = useTranslation()
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
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="donate-page animate-fade-in text-left max-w-3xl mx-auto px-4 mt-8 pb-16">
      <h1 className="text-4xl font-black mb-6 tracking-tight text-[var(--text-primary)]">{t('donate.title')}</h1>
      <p className="text-[var(--text-dim)] mb-10 leading-relaxed text-lg">
        {t('donate.description')}
      </p>

      <h2 className="text-2xl font-bold mb-6 border-b border-[var(--border-color)] pb-3 text-[var(--text-primary)]">{t('donate.general_fund')}</h2>
      <p className="mb-6 text-[var(--text-dim)]">{t('donate.general_fund_desc')}</p>

      <p className="mb-2 font-bold text-sm tracking-widest uppercase text-[var(--text-primary)]">{t('donate.monero_label')}</p>
      <div
        className="flex mb-6 cursor-pointer group"
        onClick={() => { navigator.clipboard.writeText(xmrAddress); copyToClipboard(); }}
        title={t('donate.click_to_copy')}
      >
        <code className="bg-[var(--bg-code)] border border-[var(--border-color)] p-4 rounded font-mono break-all text-[14px] leading-relaxed text-[var(--brand-color)] flex-1 relative transition-all group-hover:border-[var(--brand-color)] shadow-sm">
          {xmrAddress}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-panel)] p-1 rounded border border-[var(--border-color)]">
            {copied ? <Check size={18} className="text-[var(--brand-color)]" /> : <Copy size={18} className="text-[var(--text-dim)] hover:text-[var(--brand-color)]" />}
          </div>
        </code>
      </div>

      <p className="mb-10 text-[var(--text-dim)] flex items-center flex-wrap gap-2">
        <span className="font-bold text-sm tracking-widest uppercase">{t('donate.openalias_label')}</span>
        <code className="bg-[var(--bg-code)] border border-[var(--border-color)] px-3 py-1.5 rounded font-mono text-[var(--brand-color)]">{openAlias}</code>
      </p>

      <div className="flex flex-col sm:flex-row gap-8 mb-16">
        <div className="text-center group hover:cursor-pointer" onClick={() => { location.href = `monero:${xmrAddress}` }}>
          <div className="bg-white p-3 rounded shadow-sm border-2 border-[var(--border-color)] inline-block relative transition-transform group-hover:scale-105">
            <QRCode
              value={`monero:${xmrAddress}`}
              size={180}
              level="H"
              style={{ height: "auto", maxWidth: "100%", width: "100%", display: "block" }}
              viewBox={`0 0 180 180`}
            />
            {/* Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white p-1 rounded-full w-14 h-14 flex items-center justify-center shadow-sm">
                <img src="/monero.svg" alt="Monero Logo" className="w-10 h-10" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs font-black uppercase tracking-widest text-[var(--text-dim)]">{t('donate.scan_qr')}</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 border-b border-[var(--border-color)] pb-3 text-[var(--text-primary)]">{t('donate.support_devs')}</h2>
      <p className="text-[var(--text-dim)] leading-relaxed mb-6 text-lg">
        {t('donate.support_devs_desc')}
      </p>
      <p className="text-[var(--text-dim)] leading-relaxed mb-6 text-lg">
        <Trans i18nKey="donate.support_builders" components={{ 1: <a href="/ecosystem" className="text-[var(--brand-color)] hover:underline font-bold" /> }} />
      </p>

      <div className="mt-20 border-t border-[var(--border-color)] pt-8">
        <a href="https://xmr402.org" className="text-[var(--text-dim)] hover:text-[var(--brand-color)] transition-colors font-bold tracking-widest uppercase text-xs flex items-center gap-2 w-fit">
          <span>&larr;</span> {t('donate.back_link')}
        </a>
      </div>
    </div>
  )
}
