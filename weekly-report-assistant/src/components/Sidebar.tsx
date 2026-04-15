import type { Page, Theme, WeeklyReport } from '../types'

interface Props {
  currentPage: Page; activeSectionId: string | null
  onNavigate: (page: Page, sectionId?: string) => void
  theme: Theme; onToggleTheme: () => void; report: WeeklyReport | null
}

export default function Sidebar({ currentPage, activeSectionId, onNavigate, theme, onToggleTheme, report }: Props) {
  const sections = report?.sections || []
  const A = (p: Page, sid?: string) => currentPage === p && (!sid || activeSectionId === sid)

  return (
    <aside style={{ width: 220, height: '100%', background: 'var(--bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ height: 52, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primary)', color: 'var(--primary-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>周</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>周报助手</div>
          <div style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>AI Agent</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 8px' }}>
        <N label="对话" active={A('chat')} onClick={() => onNavigate('chat')} />
        <N label="概览" active={A('dashboard')} onClick={() => onNavigate('dashboard')} />

        {sections.length > 0 && <Sep text="数据板块" />}
        {sections.map(s => (
          <N key={s.id} label={s.name} count={s.items.length} active={A('section', s.id)} onClick={() => onNavigate('section', s.id)} />
        ))}

        <Sep text="管理" />
        <N label="历史记录" active={A('history')} onClick={() => onNavigate('history')} />
        <N label="设置" active={A('settings')} onClick={() => onNavigate('settings')} />
      </div>

      <div style={{ height: 44, padding: '0 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>v5.0</span>
        <button onClick={onToggleTheme} className="btn btn-ghost btn-sm" style={{ height: 26, padding: '0 6px' }}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </aside>
  )
}

function Sep({ text }: { text: string }) {
  return <div style={{ padding: '12px 8px 4px', fontSize: 11, fontWeight: 500, color: 'var(--fg-subtle)', letterSpacing: '0.05em' }}>{text}</div>
}

function N({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
      height: 32, padding: '0 8px', marginBottom: 1, border: 'none', borderRadius: 6,
      cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
      fontWeight: active ? 500 : 400,
      color: active ? 'var(--fg)' : 'var(--fg-muted)',
      background: active ? 'var(--accent)' : 'transparent',
    }}>
      <span>{label}</span>
      {count != null && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', background: active ? 'var(--bg)' : 'var(--bg-muted)', padding: '0 6px', borderRadius: 9999, lineHeight: '18px' }}>{count}</span>}
    </button>
  )
}
