import { useState, useCallback, useEffect } from 'react'
import type { WeeklyReport, Page, Theme, ChatMessage } from '../types'

const REPORTS_KEY = 'weekly-reports-v4'
const CHAT_KEY = 'chat-history'
const THEME_KEY = 'theme'

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}
function save(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)) }

function loadTheme(): Theme {
  const s = localStorage.getItem(THEME_KEY)
  if (s === 'light' || s === 'dark') return s
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useStore() {
  const [reports, setReports] = useState<WeeklyReport[]>(() => load(REPORTS_KEY, []))
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => load(CHAT_KEY, []))
  const [currentPage, setCurrentPage] = useState<Page>('chat')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => { const n = prev === 'dark' ? 'light' : 'dark'; localStorage.setItem(THEME_KEY, n); return n })
  }, [])

  const addReport = useCallback((report: WeeklyReport) => {
    setReports(prev => { const n = [report, ...prev]; save(REPORTS_KEY, n); return n })
  }, [])
  const updateReport = useCallback((updated: WeeklyReport) => {
    setReports(prev => { const n = prev.map(r => r.id === updated.id ? updated : r); save(REPORTS_KEY, n); return n })
  }, [])
  const deleteReport = useCallback((id: string) => {
    setReports(prev => { const n = prev.filter(r => r.id !== id); save(REPORTS_KEY, n); return n })
  }, [])

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages(prev => { const n = [...prev, msg]; save(CHAT_KEY, n); return n })
  }, [])
  const clearChat = useCallback(() => { setChatMessages([]); save(CHAT_KEY, []) }, [])

  const latestReport = reports[0] || null
  const selectedReport = reports.find(r => r.id === selectedReportId) || latestReport

  return {
    reports, latestReport, selectedReport,
    currentPage, setCurrentPage,
    selectedReportId, setSelectedReportId,
    activeSectionId, setActiveSectionId,
    addReport, updateReport, deleteReport,
    chatMessages, addChatMessage, clearChat,
    theme, toggleTheme,
  }
}
