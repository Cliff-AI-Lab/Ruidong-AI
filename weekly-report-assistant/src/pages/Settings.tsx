import { useState, useEffect, useCallback } from 'react'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [endpoint, setEndpoint] = useState('https://api.openai.com/v1/chat/completions')
  const [models, setModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState('')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => {
      setApiKey(s.apiKey || '')
      setModel(s.model || '')
      setEndpoint(s.endpoint || 'https://api.openai.com/v1/chat/completions')
    }).catch(() => {})
  }, [])

  const fetchModels = useCallback(async () => {
    setLoadingModels(true)
    setModels([])
    try {
      const r = await fetch('/api/models')
      const data = await r.json()
      if (data.models?.length > 0) {
        setModels(data.models)
        if (!model || !data.models.includes(model)) setModel(data.models[0])
      } else {
        setTestResult(data.error ? `获取模型失败: ${data.error}` : '未获取到模型，请检查 Key')
      }
    } catch (e: any) { setTestResult('获取模型失败: ' + e.message) }
    setLoadingModels(false)
  }, [model])

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, model, endpoint }),
    })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    setTestResult('测试中...')
    try {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: '回复OK' }] }),
      })
      const data = await r.json()
      setTestResult(r.ok ? `连接成功 ✓ 回复: ${(data.content || '').substring(0, 30)}` : '失败: ' + (data.error || '未知'))
    } catch (e: any) { setTestResult('错误: ' + e.message) }
  }

  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: 'var(--fg)', display: 'block', marginBottom: 6 }
  const hint: React.CSSProperties = { fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }

  return (
    <div style={{ minHeight: '100%' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 2 }}>设置</h1>
      <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 24 }}>配置 AI 平台连接（支持 OpenAI 兼容接口）</p>

      <div className="card" style={{ padding: 28, maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 16px', background: 'var(--bg-muted)', borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', color: 'var(--primary-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>R</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>AI Platform</div>
            <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>OpenAI Compatible API</div>
          </div>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-..." className="input" />
          <div style={hint}>向管理员获取 API Key</div>
        </div>

        {/* Endpoint */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>API 地址</label>
          <input value={endpoint} onChange={e => setEndpoint(e.target.value)} className="input" />
          <div style={hint}>默认 https://api.openai.com/v1/chat/completions</div>
        </div>

        {/* Model */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>模型</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {models.length > 0 ? (
              <select value={model} onChange={e => setModel(e.target.value)} className="input" style={{ flex: 1, cursor: 'pointer' }}>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input value={model} onChange={e => setModel(e.target.value)} placeholder="输入模型名或点击刷新获取" className="input" style={{ flex: 1 }} />
            )}
            <button className="btn btn-sm" onClick={fetchModels} disabled={loadingModels} style={{ flexShrink: 0 }}>
              {loadingModels ? '加载...' : '刷新模型'}
            </button>
          </div>
          {models.length > 0 && <div style={hint}>共 {models.length} 个可用模型</div>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handleSave} className="btn btn-primary">保存配置</button>
          <button onClick={handleTest} className="btn">测试连接</button>
          {saved && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>已保存 ✓</span>}
        </div>

        {testResult && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 6, fontSize: 13, lineHeight: 1.5,
            background: testResult.includes('成功') ? 'var(--green-soft)' : testResult.includes('测试中') ? 'var(--bg-muted)' : 'var(--red-soft)',
            color: testResult.includes('成功') ? 'var(--green)' : testResult.includes('测试中') ? 'var(--fg-muted)' : 'var(--red)',
          }}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  )
}
