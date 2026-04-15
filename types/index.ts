export interface ExtractedDocument {
  document_type: string
  summary: string
  fields: Record<string, unknown>
  line_items: Record<string, unknown>[]
  dates: string[]
  entities: {
    people: string[]
    companies: string[]
    addresses: string[]
  }
}

export interface DocumentRecord {
  id: string
  created_at: string
  filename: string
  document_type: string | null
  page_count: number | null
  raw_json: ExtractedDocument | null
  source_path: string | null
}
