export interface TimelineNode { date: string; label: string }
export type Importance = 'high' | 'medium' | 'low'

export interface ReportItem {
  id: string; title: string; fields: Record<string, string>
  importance: Importance; timeline: TimelineNode[]; notes: string
  _isNew?: boolean
  _editedFields?: string[]
}

export interface ReportSection {
  id: string; name: string; items: ReportItem[]; summary: string
}

export interface WeeklyReport {
  id: string; date: string; fileName: string
  sections: ReportSection[]; uploadedAt: string; rawText: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  attachedFile?: string
  generatedReport?: WeeklyReport
}

export type Page = 'chat' | 'dashboard' | 'section' | 'history' | 'settings'
export type Theme = 'light' | 'dark'

export interface LLMSettings {
  provider: 'zhipu' | 'openai' | 'claude' | 'custom'
  apiKey: string; model: string; endpoint?: string
}
