import React, { useState, useEffect } from 'react'
import { BuildProvider } from './context/BuildContext'
import HomePage from './pages/HomePage'
import BuilderPage from './pages/BuilderPage'
import RecommendPage from './pages/RecommendPage'
import ComparePage from './pages/ComparePage'
import SavedPage from './pages/SavedPage'
import AiPage from './pages/AiPage'
import AdminPage from './pages/AdminPage'
import PartsPage from './pages/PartsPage'

const NAV = [
  { id: 'home', label: 'Нүүр', icon: 'home' },
  { id: 'builder', label: 'Builder', icon: 'build' },
  { id: 'recommend', label: 'Санал', icon: 'auto_awesome' },
  { id: 'compare', label: 'Харьцуулах', icon: 'compare' },
  { id: 'saved', label: 'Хадгалсан', icon: 'bookmark' },
  { id: 'ai', label: 'AI Туслах', icon: 'smart_toy' },
  { id: 'admin', label: 'Админ', icon: 'admin_panel_settings' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [partCategory, setPartCategory] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('bm-theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bm-theme', theme)
  }, [theme])

  const goToParts = (category) => { setPartCategory(category); setPage('parts') }
  const goBack = () => setPage('builder')

  return (
    <BuildProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100
        }}>
          {/* Logo */}
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#fff', fontSize: 20 }}>memory</span>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text)', letterSpacing: -0.5 }}>BuildMate</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>PC BUILDER</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2, fontSize: 13, fontWeight: 600,
                  background: page === n.id ? 'var(--accent-dim)' : 'transparent',
                  color: page === n.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                  transition: 'all 0.15s', cursor: 'pointer', border: 'none',
                }}
                onMouseEnter={e => { if (page !== n.id) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                onMouseLeave={e => { if (page !== n.id) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Theme toggle */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              {theme === 'dark' ? 'Цайвар горим' : 'Харанхуй горим'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', background: 'var(--bg)', overflow: 'auto' }}>
          {page === 'home' && <HomePage navigate={setPage} />}
          {page === 'builder' && <BuilderPage goToParts={goToParts} />}
          {page === 'parts' && <PartsPage category={partCategory} goBack={goBack} />}
          {page === 'recommend' && <RecommendPage navigate={setPage} />}
          {page === 'compare' && <ComparePage />}
          {page === 'saved' && <SavedPage navigate={setPage} />}
          {page === 'ai' && <AiPage />}
          {page === 'admin' && <AdminPage />}
        </main>
      </div>
    </BuildProvider>
  )
}
