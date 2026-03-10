import { Route, Switch } from 'wouter'
import { Sun, Moon, Monitor, Github, Twitter } from 'lucide-react'
import { useTheme } from './hooks/useTheme'
import { Home } from './pages/Home'
import { Ecosystem } from './pages/Ecosystem'
import { Donate } from './pages/Donate'
import './index.css'

function App() {
  const { mode, cycleTheme } = useTheme()
  const isDonateSubdomain = window.location.hostname === 'donate.xmr402.org' || window.location.search.includes('donate=true');

  return (
    <div className="portal-container">
      {/* HEADER ACTIONS */}
      <div className="header-actions">
        <a href="https://x.com/xmr402" target="_blank" rel="noopener noreferrer" className="action-btn" title="X (Twitter)">
          <Twitter size={20} />
        </a>
        <a href="https://github.com/xmr402/XMR402-org" target="_blank" rel="noopener noreferrer" className="action-btn" title="GitHub Repository">
          <Github size={20} />
        </a>
        <button onClick={cycleTheme} className="action-btn">
          {mode === 'light' && <Sun size={20} />}
          {mode === 'dark' && <Moon size={20} />}
          {mode === 'system' && <Monitor size={20} />}
        </button>
      </div>

      {/* ROUTES */}
      <Switch>
        {isDonateSubdomain ? (
          <Route path="/" component={Donate} />
        ) : (
            <Route path="/" component={Home} />
        )}
        <Route path="/donate" component={Donate} />
        <Route path="/ecosystem" component={Ecosystem} />
        <Route>
          {/* 404 Fallback */}
          <div className="text-center py-32">
            <h1 className="text-4xl font-black mb-4">404 - TERMINAL LOST</h1>
            <a href="/" className="text-emerald-500 hover:underline">RETURN TO BASE</a>
          </div>
        </Route>
      </Switch>

      <footer>
        <p><a href="https://x.com/xmr402" target="_blank" className="text-emerald-500">@XMR402</a> • <a href="https://github.com/xmr402/XMR402-org" target="_blank">XMR402 REPO</a> • <a href="/donate">DONATE</a> • Standardized v2.0.0 • 2026</p>
      </footer>
    </div>
  )
}

export default App
