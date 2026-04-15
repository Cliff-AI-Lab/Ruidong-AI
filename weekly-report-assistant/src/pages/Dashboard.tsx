import { useState } from 'react'
import type { WeeklyReport } from '../types'

interface Props {
  report: WeeklyReport | null
  onNavigateSection: (sectionId: string) => void
}

export default function Dashboard({ report, onNavigateSection }: Props) {
  const [activeTab, setActiveTab] = useState(0)

  if (!report) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 26 }}>📋</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>还没有周报数据</div>
      <div style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>前往「数据录入」上传 Excel / Word 或手动输入</div>
    </div>
  )

  const sections = report.sections
  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0)
  const highCount = sections.reduce((s, sec) => s + sec.items.filter(i => i.importance === 'high').length, 0)
  const activeSection = sections[activeTab]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 2 }}>概览</h1>
        <p style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>{report.fileName} · {report.date}</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KPI label="总板块" value={sections.length} />
        <KPI label="总条目" value={totalItems} />
        {highCount > 0 && <KPI label="重点项" value={highCount} color="var(--red)" />}
        {sections.map((s, i) => (
          <KPI key={s.id} label={s.name} value={s.items.length} suffix="条" onClick={() => setActiveTab(i)} active={activeTab === i} />
        ))}
      </div>

      {/* Main content: all sections displayed as big blocks */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Tab bar for switching focus */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="tab-list" style={{ flexShrink: 0 }}>
            {sections.map((s, i) => (
              <button key={s.id} className="tab-trigger" data-active={activeTab === i} onClick={() => setActiveTab(i)}>
                {s.name}
                <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>{s.items.length}</span>
              </button>
            ))}
          </div>

          {activeSection && (
            <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
              {activeSection.summary && (
                <div style={{ padding: '10px 14px', background: 'var(--blue-soft)', borderRadius: 6, marginBottom: 16, fontSize: 13, color: 'var(--blue)', lineHeight: 1.6 }}>
                  {activeSection.summary}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 70 }}>重要度</th>
                    <th style={th}>项目</th>
                    <th style={th}>关键信息</th>
                    <th style={{ ...th, width: 200 }}>时间节点</th>
                    <th style={{ ...th, width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {activeSection.items.length === 0 && (
                    <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--fg-subtle)', padding: 40 }}>暂无数据</td></tr>
                  )}
                  {activeSection.items.map(item => (
                    <tr key={item.id}>
                      <td style={td}>
                        <span className={`badge badge-${item.importance}`}>
                          {item.importance === 'high' ? '重要' : item.importance === 'medium' ? '一般' : '低'}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 500, color: 'var(--fg)' }}>{item.title}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px' }}>
                          {Object.entries(item.fields).slice(0, 5).map(([k, v]) => (
                            <span key={k} style={{ fontSize: 12 }}>
                              <span style={{ color: 'var(--fg-subtle)' }}>{k}:</span> <span style={{ color: 'var(--fg-muted)' }}>{v}</span>
                            </span>
                          ))}
                        </div>
                        {item.notes && <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginTop: 3 }}>{item.notes}</div>}
                      </td>
                      <td style={td}>
                        {item.timeline.map((t, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, marginBottom: 2 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                            <span className="metric" style={{ color: 'var(--fg-subtle)' }}>{t.date}</span>
                            <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
                          </div>
                        ))}
                      </td>
                      <td style={td}>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => onNavigateSection(activeSection.id)}>编辑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, suffix, color, onClick, active }: { label: string; value: number; suffix?: string; color?: string; onClick?: () => void; active?: boolean }) {
  return (
    <div className="card" style={{
      padding: '12px 16px', cursor: onClick ? 'pointer' : 'default', flex: '1 1 120px', minWidth: 120,
      borderColor: active ? 'var(--primary)' : undefined,
      boxShadow: active ? '0 0 0 2px var(--accent), var(--shadow-sm)' : undefined,
    }} onClick={onClick}>
      <div style={{ fontSize: 11, color: 'var(--fg-subtle)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <span className="metric" style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--fg)' }}>{value}</span>
      {suffix && <span style={{ fontSize: 11, color: 'var(--fg-subtle)', marginLeft: 2 }}>{suffix}</span>}
    </div>
  )
}

const th: React.CSSProperties = {
  textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600,
  color: 'var(--fg-subtle)', borderBottom: '1px solid var(--border)',
  letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap',
}
const td: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid var(--border)',
  fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, verticalAlign: 'top',
}
