import { useState } from 'react'
import type { WeeklyReport } from '../types'

interface Props {
  reports: WeeklyReport[]
  onDelete: (id: string) => void
}

export default function History({ reports, onDelete }: Props) {
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')
  const a = reports.find(r => r.id === idA)
  const b = reports.find(r => r.id === idB)

  return (
    <div style={{ minHeight: '100%' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px', marginBottom: 3 }}>历史记录</h1>
      <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginBottom: 16 }}>选择两份周报进行对比</p>

      <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>{['日期', '来源', '板块', '条目', '操作'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {reports.length === 0 && <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--fg-subtle)', padding: 30 }}>暂无记录</td></tr>}
            {reports.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.date}</td>
                <td style={td}>{r.fileName}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{r.sections.length}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{r.sections.reduce((s, sec) => s + sec.items.length, 0)}</td>
                <td style={td}>
                  <button className={`btn btn-sm ${idA === r.id ? 'btn-primary' : ''}`} onClick={() => setIdA(r.id)}>A</button>
                  <button className={`btn btn-sm ${idB === r.id ? 'btn-primary' : ''}`} onClick={() => setIdB(r.id)} style={{ marginLeft: 4 }}>B</button>
                  <button className="btn btn-sm" onClick={() => { if (confirm('删除?')) onDelete(r.id) }} style={{ marginLeft: 4, color: 'var(--red)' }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {a && b && a.id !== b.id && <CompareView a={a} b={b} />}
      {idA && idB && idA === idB && <p style={{ textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 13 }}>请选两份不同周报</p>}
    </div>
  )
}

function CompareView({ a, b }: { a: WeeklyReport; b: WeeklyReport }) {
  const [older, newer] = new Date(a.uploadedAt) < new Date(b.uploadedAt) ? [a, b] : [b, a]
  const allNames = new Set([...older.sections.map(s => s.name), ...newer.sections.map(s => s.name)])

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>对比: {older.date} → {newer.date}</h3>
      <p style={{ fontSize: 11, color: 'var(--fg-subtle)', marginBottom: 16 }}>{older.fileName} vs {newer.fileName}</p>

      {Array.from(allNames).map(name => {
        const oldSec = older.sections.find(s => s.name === name)
        const newSec = newer.sections.find(s => s.name === name)
        const maxLen = Math.max(oldSec?.items.length || 0, newSec?.items.length || 0)

        return (
          <div key={name} style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>{name}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={th}>条目</th>
                  <th style={th}>上周</th>
                  <th style={th}>本周</th>
                  <th style={{ ...th, width: 50 }}>变化</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxLen }, (_, i) => {
                  const oldItem = oldSec?.items[i]
                  const newItem = newSec?.items[i]
                  const title = newItem?.title || oldItem?.title || `#${i + 1}`
                  const oldText = oldItem ? Object.values(oldItem.fields).join(' | ') : ''
                  const newText = newItem ? Object.values(newItem.fields).join(' | ') : ''
                  const diff = !oldText ? 'new' : !newText ? 'removed' : oldText !== newText ? 'changed' : 'same'

                  return (
                    <tr key={i}>
                      <td style={{ ...td, fontWeight: 500, color: 'var(--fg)' }}>{title}</td>
                      <td style={{ ...td, color: 'var(--fg-subtle)' }}>{oldText || '—'}</td>
                      <td style={{ ...td, color: diff !== 'same' ? diffColor[diff] : 'var(--fg-muted)', fontWeight: diff !== 'same' ? 500 : 400 }}>{newText || '—'}</td>
                      <td style={td}>{diff !== 'same' && <span className={`badge badge-${diff === 'new' ? 'low' : diff === 'removed' ? 'high' : 'medium'}`} style={diff === 'new' ? { background: 'var(--green-soft)', color: 'var(--green)' } : {}}>{diffLabel[diff]}</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '7px 10px', fontSize: 11, color: 'var(--fg-subtle)', borderBottom: '1px solid var(--border)', fontWeight: 500, background: 'var(--bg-secondary)' }
const td: React.CSSProperties = { padding: '7px 10px', borderBottom: '1px solid var(--border)', lineHeight: 1.5, verticalAlign: 'top' }
const diffColor: Record<string, string> = { changed: 'var(--amber)', new: 'var(--green)', removed: 'var(--red)', same: 'var(--fg-muted)' }
const diffLabel: Record<string, string> = { changed: '变更', new: '新增', removed: '移除' }
