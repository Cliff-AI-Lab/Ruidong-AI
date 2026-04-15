import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import SectionView from './pages/SectionView'
import History from './pages/History'
import Settings from './pages/Settings'
import { useStore } from './store/useStore'

function App() {
  const s = useStore()
  useEffect(() => { document.documentElement.setAttribute('data-theme', s.theme) }, [s.theme])

  const handleNavigate = (page: any, sectionId?: string) => {
    s.setCurrentPage(page)
    if (sectionId) s.setActiveSectionId(sectionId)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <Sidebar currentPage={s.currentPage} activeSectionId={s.activeSectionId} onNavigate={handleNavigate} theme={s.theme} onToggleTheme={s.toggleTheme} report={s.selectedReport} />

      <main style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {s.reports.length > 1 && !['chat', 'history', 'settings'].includes(s.currentPage) && (
          <div style={{ height: 40, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>周报:</span>
            <select value={s.selectedReportId || ''} onChange={e => s.setSelectedReportId(e.target.value)} className="input" style={{ width: 'auto', height: 28, padding: '0 8px', fontSize: 12 }}>
              {s.reports.map(r => <option key={r.id} value={r.id}>{r.fileName} ({r.date})</option>)}
            </select>
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', width: '100%' }}>
          {s.currentPage === 'chat' && <Chat messages={s.chatMessages} onAddMessage={s.addChatMessage} onClearChat={s.clearChat} onAddReport={s.addReport} onNavigate={s.setCurrentPage} />}
          {s.currentPage === 'dashboard' && <div style={{ padding: 24, width: '100%', minHeight: '100%' }}><Dashboard report={s.selectedReport} onNavigateSection={id => { s.setActiveSectionId(id); s.setCurrentPage('section') }} /></div>}
          {s.currentPage === 'section' && <div style={{ padding: 24, width: '100%', minHeight: '100%' }}><SectionView report={s.selectedReport} sectionId={s.activeSectionId} onUpdate={s.updateReport} /></div>}
          {s.currentPage === 'history' && <div style={{ padding: 24, width: '100%', minHeight: '100%' }}><History reports={s.reports} onDelete={s.deleteReport} /></div>}
          {s.currentPage === 'settings' && <div style={{ padding: 24, width: '100%', minHeight: '100%' }}><Settings /></div>}
        </div>
      </main>
    </div>
  )
}

export default App
