import { useState } from 'react'
import type { ReportItem, WeeklyReport, Importance } from '../types'

interface Props {
  report: WeeklyReport | null
  sectionId: string | null
  onUpdate: (report: WeeklyReport) => void
}

const impLabel: Record<Importance, string> = { high: '重要', medium: '一般', low: '低' }
const impOpts: Importance[] = ['high', 'medium', 'low']

export default function SectionView({ report, sectionId, onUpdate }: Props) {
  const section = report?.sections.find(s => s.id === sectionId)
  const [addingItem, setAddingItem] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  if (!section || !report) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'var(--fg-muted)' }}>请从侧栏选择板块</div>

  const doUpdate = (newReport: WeeklyReport) => {
    onUpdate(newReport) // This triggers save to localStorage via store
  }

  const updateItem = (itemId: string, patch: Partial<ReportItem>) => {
    doUpdate({
      ...report,
      sections: report.sections.map(s => s.id !== sectionId ? s : {
        ...s, items: s.items.map(it => it.id !== itemId ? it : { ...it, ...patch }),
      }),
    })
  }

  const addItem = () => {
    if (!newTitle.trim()) return
    const item: ReportItem = {
      id: `item-new-${Date.now()}`,
      title: newTitle.trim(),
      fields: {},
      importance: 'medium',
      timeline: [],
      notes: '',
      _isNew: true,
    }
    doUpdate({
      ...report,
      sections: report.sections.map(s => s.id !== sectionId ? s : { ...s, items: [...s.items, item] }),
    })
    setNewTitle('')
    setAddingItem(false)
  }

  const deleteItem = (itemId: string) => {
    doUpdate({
      ...report,
      sections: report.sections.map(s => s.id !== sectionId ? s : { ...s, items: s.items.filter(it => it.id !== itemId) }),
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 2 }}>{section.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{section.summary || `${section.items.length} 个条目`} · 点击内容可编辑，自动保存</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAddingItem(true)}>+ 新增条目</button>
      </div>

      {addingItem && (
        <div className="card" style={{ padding: 16, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="输入条目标题..." autoFocus
            onKeyDown={e => e.key === 'Enter' && addItem()} style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={addItem}>添加</button>
          <button className="btn btn-sm" onClick={() => setAddingItem(false)}>取消</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {section.items.map(item => (
          <ItemCard key={item.id} item={item}
            onUpdate={patch => updateItem(item.id, patch)}
            onDelete={() => deleteItem(item.id)} />
        ))}
      </div>
    </div>
  )
}

function ItemCard({ item, onUpdate, onDelete }: { item: ReportItem; onUpdate: (patch: Partial<ReportItem>) => void; onDelete: () => void }) {
  const [editField, setEditField] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [editNotes, setEditNotes] = useState(false)
  const [notesVal, setNotesVal] = useState(item.notes)
  const [addFieldKey, setAddFieldKey] = useState('')
  const [addFieldVal, setAddFieldVal] = useState('')
  const [showAddField, setShowAddField] = useState(false)

  const editedFields = item._editedFields || []
  const isNew = item._isNew

  const commitField = () => {
    if (editField) {
      const newEdited = editedFields.includes(editField) ? editedFields : [...editedFields, editField]
      onUpdate({ fields: { ...item.fields, [editField]: editVal }, _editedFields: newEdited })
    }
    setEditField(null)
  }

  const commitNotes = () => {
    onUpdate({ notes: notesVal, _editedFields: editedFields.includes('_notes') ? editedFields : [...editedFields, '_notes'] })
    setEditNotes(false)
  }

  const addField = () => {
    if (!addFieldKey.trim()) return
    const key = addFieldKey.trim()
    onUpdate({
      fields: { ...item.fields, [key]: addFieldVal },
      _editedFields: [...editedFields, key],
    })
    setAddFieldKey(''); setAddFieldVal(''); setShowAddField(false)
  }

  return (
    <div className="card" style={{
      padding: '16px 20px',
      borderLeft: isNew ? '3px solid var(--blue)' : editedFields.length > 0 ? '3px solid var(--amber)' : undefined,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <select value={item.importance} onChange={e => onUpdate({ importance: e.target.value as Importance })}
          className="badge" style={{
            cursor: 'pointer', border: 'none', outline: 'none', fontSize: 11,
            background: item.importance === 'high' ? 'var(--red-soft)' : item.importance === 'medium' ? 'var(--amber-soft)' : 'var(--bg-muted)',
            color: item.importance === 'high' ? 'var(--red)' : item.importance === 'medium' ? 'var(--amber)' : 'var(--fg-subtle)',
            appearance: 'none', WebkitAppearance: 'none', paddingRight: 8,
          }}>
          {impOpts.map(v => <option key={v} value={v}>{impLabel[v]}</option>)}
        </select>

        {isNew && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-soft)', padding: '1px 6px', borderRadius: 4 }}>新增</span>}
        {!isNew && editedFields.length > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-soft)', padding: '1px 6px', borderRadius: 4 }}>已编辑</span>}

        <h3 style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: '-0.2px' }}>{item.title}</h3>
        <button className="btn btn-ghost btn-sm btn-destructive" style={{ padding: '2px 6px' }} onClick={onDelete}>删除</button>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginBottom: item.timeline.length > 0 || item.notes ? 12 : 0 }}>
        {Object.entries(item.fields).map(([k, v]) => {
          const wasEdited = editedFields.includes(k)
          return (
            <div key={k} style={{ fontSize: 13, lineHeight: 1.6 }}>
              <span style={{ color: 'var(--fg-subtle)', fontWeight: 500 }}>{k}: </span>
              {editField === k ? (
                <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                  onBlur={commitField} onKeyDown={e => e.key === 'Enter' && commitField()}
                  className="input" style={{ width: 160, height: 26, padding: '2px 6px', fontSize: 13, display: 'inline-flex' }} />
              ) : (
                <span
                  style={{
                    cursor: 'text',
                    color: wasEdited ? 'var(--blue)' : 'var(--fg)',
                    fontWeight: wasEdited ? 600 : 400,
                  }}
                  onClick={() => { setEditField(k); setEditVal(v) }}
                >
                  {v || '—'}
                </span>
              )}
            </div>
          )
        })}
        {!showAddField && (
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, height: 22, padding: '0 6px', color: 'var(--blue)' }}
            onClick={() => setShowAddField(true)}>+ 字段</button>
        )}
      </div>

      {showAddField && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
          <input className="input" placeholder="字段名" value={addFieldKey} onChange={e => setAddFieldKey(e.target.value)}
            style={{ width: 100, height: 28, padding: '0 6px', fontSize: 12 }} />
          <input className="input" placeholder="值" value={addFieldVal} onChange={e => setAddFieldVal(e.target.value)}
            style={{ width: 140, height: 28, padding: '0 6px', fontSize: 12 }} onKeyDown={e => e.key === 'Enter' && addField()} />
          <button className="btn btn-sm" style={{ height: 28 }} onClick={addField}>添加</button>
          <button className="btn btn-ghost btn-sm" style={{ height: 28 }} onClick={() => setShowAddField(false)}>取消</button>
        </div>
      )}

      {/* Timeline */}
      {item.timeline.length > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: item.notes ? 10 : 0 }}>
          {item.timeline.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
              <span className="metric" style={{ color: 'var(--fg-subtle)', fontSize: 11 }}>{t.date}</span>
              <span style={{ color: 'var(--fg-muted)' }}>{t.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {(item.notes || editNotes) && (
        editNotes ? (
          <textarea autoFocus value={notesVal} onChange={e => setNotesVal(e.target.value)}
            onBlur={commitNotes} rows={3}
            className="input" style={{ marginTop: 4, fontSize: 12, resize: 'vertical', lineHeight: 1.6 }} />
        ) : (
          <div onClick={() => { setEditNotes(true); setNotesVal(item.notes) }}
            style={{
              marginTop: 4, padding: '8px 12px', borderRadius: 6, fontSize: 12, lineHeight: 1.6, cursor: 'text',
              background: editedFields.includes('_notes') ? 'var(--blue-soft)' : 'var(--bg-muted)',
              color: editedFields.includes('_notes') ? 'var(--blue)' : 'var(--fg-muted)',
              fontWeight: editedFields.includes('_notes') ? 500 : 400,
            }}>
            {item.notes}
          </div>
        )
      )}
    </div>
  )
}
