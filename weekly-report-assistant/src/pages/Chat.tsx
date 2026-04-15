import { useState, useRef, useEffect, useCallback } from 'react'
import { parseExcelSheets, sheetsToText } from '../utils/parseExcel'
import { wordToText } from '../utils/parseWord'
import { extractWithLLM } from '../utils/llmExtract'
import { startVoiceInput } from '../utils/voiceInput'
import type { WeeklyReport, ChatMessage, Page } from '../types'

interface Props {
  messages: ChatMessage[]
  onAddMessage: (msg: ChatMessage) => void
  onClearChat: () => void
  onAddReport: (report: WeeklyReport) => void
  onNavigate: (page: Page) => void
}

function msg(role: 'user' | 'assistant', content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date().toISOString(), ...extra }
}

export default function Chat({ messages, onAddMessage, onClearChat, onAddReport, onNavigate }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const voiceRef = useRef<any>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const analyze = useCallback(async (text: string, name: string) => {
    setLoading(true)
    onAddMessage(msg('assistant', '正在分析，自动识别板块和重要度...'))
    try {
      const sections = await extractWithLLM(text)
      const report: WeeklyReport = { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], fileName: name, sections, uploadedAt: new Date().toISOString(), rawText: text }
      onAddReport(report)
      const lines = sections.map(s => `• ${s.name}（${s.items.length}条）${s.summary ? ' — ' + s.summary : ''}`).join('\n')
      onAddMessage(msg('assistant', `已完成分析，生成 ${sections.length} 个板块：\n\n${lines}\n\n点击左侧「概览」查看全部数据，或继续输入。`, { generatedReport: report }))
    } catch (e: any) {
      onAddMessage(msg('assistant', `分析失败：${e.message}\n请检查「设置」中的 API Key。`))
    }
    setLoading(false)
  }, [onAddMessage, onAddReport])

  const send = useCallback(async () => {
    const t = input.trim(); if (!t || loading) return
    setInput(''); if (taRef.current) taRef.current.style.height = 'auto'
    onAddMessage(msg('user', t))
    await analyze(t, '对话录入 ' + new Date().toLocaleDateString())
  }, [input, loading, onAddMessage, analyze])

  const onFile = useCallback(async (f: File) => {
    const n = f.name.toLowerCase()
    if (!/\.(xlsx?|docx?)$/.test(n)) { onAddMessage(msg('assistant', '支持 .xlsx / .docx 文件')); return }
    onAddMessage(msg('user', `📎 ${f.name}`, { attachedFile: f.name }))
    try {
      const text = /\.xlsx?$/.test(n) ? sheetsToText(await parseExcelSheets(f)) : await wordToText(f)
      await analyze(text, f.name)
    } catch (e: any) { onAddMessage(msg('assistant', `解析失败：${e.message}`)) }
  }, [onAddMessage, analyze])

  const toggleVoice = useCallback(() => {
    if (recording && voiceRef.current) { voiceRef.current.stop(); voiceRef.current = null; setRecording(false); return }
    const s = startVoiceInput((t, f) => { if (f) setInput(p => p + t) }, e => { onAddMessage(msg('assistant', e)); setRecording(false) })
    if (s) { voiceRef.current = s; setRecording(true) }
  }, [recording, onAddMessage])

  const empty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
        {empty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>周报助手</h2>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', textAlign: 'center', maxWidth: 380, lineHeight: 1.7, marginBottom: 20 }}>
              直接输入本周工作内容，上传 Excel / Word，或语音录入。<br />我会自动整理、分类并标注重要度。
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>📎 上传文件</button>
              <button className="btn btn-sm" onClick={() => { setInput('本周工作：\n1. '); taRef.current?.focus() }}>✏️ 开始录入</button>
              <button className="btn btn-sm" onClick={toggleVoice}>🎤 语音</button>
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', marginBottom: 16, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginRight: 8, flexShrink: 0 }}>周</div>
            )}
            <div style={{
              maxWidth: '65%', padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
              ...(m.role === 'user'
                ? { background: 'var(--primary)', color: 'var(--primary-fg)', borderBottomRightRadius: 4 }
                : { background: 'var(--bg-muted)', color: 'var(--fg)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }),
            }}>
              {m.content}
              {m.generatedReport && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn btn-sm" style={{ height: 26 }} onClick={() => onNavigate('dashboard')}>查看概览 →</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginRight: 8 }}>周</div>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-muted)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--fg-muted)' }}>思考中...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 24px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.docx,.doc" hidden onChange={e => { e.target.files?.[0] && onFile(e.target.files[0]); e.target.value = '' }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} style={{ height: 36, flexShrink: 0 }} title="上传文件">📎</button>
          <button className={`btn btn-sm ${recording ? '' : 'btn-ghost'}`} onClick={toggleVoice} style={{ height: 36, flexShrink: 0, ...(recording ? { color: 'var(--destructive)', borderColor: 'var(--destructive)' } : {}) }} title="语音">{recording ? '⏹' : '🎤'}</button>
          <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="输入工作内容，或上传 Excel / Word 文件..."
            className="input" rows={1}
            style={{ flex: 1, minHeight: 36, maxHeight: 120, resize: 'none', lineHeight: '20px', padding: '7px 12px' }}
            onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px' }}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ height: 36, flexShrink: 0 }}>发送</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>Shift+Enter 换行 · 支持 .xlsx .docx</span>
          {messages.length > 0 && <button className="btn btn-ghost btn-sm" style={{ height: 20, fontSize: 11, color: 'var(--fg-subtle)' }} onClick={onClearChat}>清空对话</button>}
        </div>
      </div>
    </div>
  )
}
