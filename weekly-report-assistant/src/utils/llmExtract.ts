import type { ReportSection, ReportItem } from '../types'
import type { SheetData } from './parseExcel'

const SYSTEM_PROMPT = `你是一个专业的周报数据提取助手。你的任务是将用户提供的周报原始数据（Excel表格或文字）精确提取为结构化JSON。

## 核心规则

1. **按sheet页/板块划分**：如果数据来自多个Excel Sheet页，每个sheet页作为一个独立section，section.name 保持原sheet名
2. **逐行提取**：Excel中每一行数据都必须提取为一个item，不要遗漏任何行
3. **title取值**：取"机会点名称"、"项目名称"、"客户名称"等最能代表这一行的字段作为title
4. **fields完整提取**：将该行所有非空字段都放入fields中，字段名使用原始表头名称，如"区域"、"销售姓名"、"预计合同额（万）"、"商机阶段"、"现状及风险"等
5. **金额字段**：保留数字和单位，如"100万"、"80万"
6. **importance判断**：
   - high：包含"风险"、"逾期"、"紧急"、"延期"关键词，或金额>=80万
   - medium：正常推进的项目
   - low：已完成、暂缓的项目
7. **timeline提取**：从文本中提取所有日期（如"4月13日"→"2026-04-13"，"20260330"→"2026-03-30"），以及对应的节点说明
8. **notes**：将"备注"、"现状及风险"、"现状描述"等长文本字段内容放入notes

## 输出格式

严格返回以下JSON格式，不要返回任何其他文字：
{
  "sections": [
    {
      "name": "直签商机",
      "summary": "共3个直签商机，预计合同总额200万",
      "items": [
        {
          "title": "温氏AI兽医项目",
          "fields": {
            "区域": "云浮",
            "销售": "杨晗",
            "售前": "高胜寒",
            "客户": "温氏集团",
            "预计金额": "50万",
            "阶段": "规划方案",
            "负责人": "王兵兵"
          },
          "importance": "medium",
          "timeline": [
            { "date": "2026-03-09", "label": "后续方案汇报" }
          ],
          "notes": "第一版合同已签订完成，目前正在进行大华农功能评审"
        }
      ]
    }
  ]
}

## 注意
- 不要合并行，每行Excel数据对应一个item
- 不要省略字段，所有非空单元格都要提取到fields
- summary要包含条目数量和关键统计（如总金额）
- 如果是文字输入（非表格），按内容主题自动分3-4个板块`

export async function extractWithLLM(rawText: string): Promise<ReportSection[]> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `请精确提取以下周报数据：\n\n${rawText}` },
      ],
    }),
  })

  if (!resp.ok) {
    const err = await resp.json()
    throw new Error(err.error || '请求失败')
  }

  const { content } = await resp.json()
  let jsonStr = content
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) jsonStr = match[1]

  // Clean up potential JSON issues
  jsonStr = jsonStr.trim()
  if (!jsonStr.startsWith('{')) {
    const idx = jsonStr.indexOf('{')
    if (idx >= 0) jsonStr = jsonStr.substring(idx)
  }

  const parsed = JSON.parse(jsonStr)
  const now = Date.now()
  return (parsed.sections || []).map((s: any, si: number) => ({
    id: `sec-${si}-${now}`,
    name: s.name || `板块${si + 1}`,
    summary: s.summary || '',
    items: (s.items || []).map((item: any, ii: number) => ({
      id: `item-${si}-${ii}-${now}`,
      title: item.title || '',
      fields: item.fields || {},
      importance: ['high', 'medium', 'low'].includes(item.importance) ? item.importance : 'medium',
      timeline: (item.timeline || []).map((t: any) => ({ date: t.date || '', label: t.label || '' })),
      notes: item.notes || '',
      _isNew: false,
    })),
  }))
}

export function sheetsToSections(sheets: SheetData[]): ReportSection[] {
  const now = Date.now()
  return sheets.map((sheet, si) => ({
    id: `sec-${si}-${now}`,
    name: sheet.name,
    summary: `${sheet.rows.length} 条数据`,
    items: sheet.rows.map((row, ri): ReportItem => {
      const fields: Record<string, string> = {}
      sheet.headers.forEach((h, ci) => {
        if (row[ci] && row[ci].trim()) fields[h] = row[ci]
      })
      return {
        id: `item-${si}-${ri}-${now}`,
        title: row[2] || row[1] || row[0] || `第${ri + 1}项`,
        fields,
        importance: 'medium',
        timeline: [],
        notes: '',
      }
    }),
  }))
}
