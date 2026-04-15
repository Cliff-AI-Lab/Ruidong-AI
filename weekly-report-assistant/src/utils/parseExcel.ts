import * as XLSX from 'xlsx'

/** Parse Excel: return per-sheet text + sheet names for section structure */
export interface SheetData {
  name: string
  text: string
  headers: string[]
  rows: string[][]
}

export function parseExcelSheets(file: File): Promise<SheetData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const sheets: SheetData[] = []

        for (const name of wb.SheetNames) {
          const sheet = wb.Sheets[name]
          const merges = sheet['!merges'] || []
          const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' }) as unknown[][]

          // Fill merged cells
          for (const range of merges) {
            const origin = rawRows[range.s.r]?.[range.s.c]
            if (origin == null || origin === '') continue
            for (let r = range.s.r; r <= range.e.r; r++) {
              if (!rawRows[r]) continue
              for (let c = range.s.c; c <= range.e.c; c++) {
                if (r === range.s.r && c === range.s.c) continue
                rawRows[r][c] = origin
              }
            }
          }

          if (rawRows.length === 0) continue
          const headers = rawRows[0].map(h => String(h || '').trim()).filter(Boolean)
          const rows: string[][] = []
          const textLines = [`## ${name}\n| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`]

          for (let i = 1; i < rawRows.length; i++) {
            const vals = rawRows[i].map((v: any) => String(v ?? '').replace(/\n/g, ' ').trim())
            if (vals.every(v => !v)) continue
            rows.push(vals.slice(0, headers.length))
            textLines.push(`| ${vals.slice(0, headers.length).join(' | ')} |`)
          }

          sheets.push({ name, text: textLines.join('\n'), headers, rows })
        }
        resolve(sheets)
      } catch (err: any) { reject(err) }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

/** Convert all sheets to combined text for LLM */
export function sheetsToText(sheets: SheetData[]): string {
  return sheets.map(s => s.text).join('\n\n')
}
