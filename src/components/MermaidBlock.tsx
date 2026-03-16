import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#004d13',
    primaryTextColor: '#00ff41',
    primaryBorderColor: '#00ff41',
    lineColor: '#00661a',
    secondaryColor: '#0a0a0a',
    tertiaryColor: '#050505',
    background: '#0a0a0a',
    mainBkg: '#0a0a0a',
    nodeBorder: '#00ff41',
    clusterBkg: '#050505',
    titleColor: '#00ff41',
    edgeLabelBackground: '#0a0a0a',
  },
  fontFamily: 'JetBrains Mono, Fira Code, monospace',
})

let mermaidId = 0

export function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const id = `mermaid-${++mermaidId}`
    mermaid
      .render(id, chart)
      .then(({ svg }) => setSvg(svg))
      .catch((err) => setError(String(err)))
  }, [chart])

  if (error) {
    return (
      <pre className="text-rose-400 text-sm border border-rose-500/20 bg-rose-500/5 p-4 overflow-x-auto">
        <code>{chart}</code>
      </pre>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart my-6 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
