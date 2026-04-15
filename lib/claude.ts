import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedDocument } from '@/types'

// System prompt is cached on first call — subsequent calls are much cheaper
const SYSTEM_PROMPT = `You are a document data extraction expert. When given a PDF document:

1. Identify the document type (invoice, packing_slip, manual, medical_record, contract, receipt, form, report, other)
2. Extract ALL structured data from every page
3. Return ONLY valid JSON in this exact format — no markdown, no explanation:

{
  "document_type": "type of document",
  "summary": "one sentence describing what this document is",
  "fields": {
    "any_header_or_metadata_key": "value"
  },
  "line_items": [
    { "include": "all columns you find per row" }
  ],
  "dates": ["all dates found, ISO format when possible"],
  "entities": {
    "people": ["names of people"],
    "companies": ["company or organization names"],
    "addresses": ["full addresses found"]
  }
}

Extraction rules:
- Return ONLY valid JSON. Never wrap in markdown code blocks.
- Extract every piece of data visible on every page.
- line_items is [] if no tabular line items exist.
- Adapt "fields" to the document type — do not limit to a fixed set of keys.
- packing_slip: include order_number, po_number, job_name, designer in fields.
- invoice: include invoice_number, subtotal, tax, total, payment_terms in fields.
- medical_record: include patient_name, dob, provider, diagnoses, medications in fields.
- manual/report: include title, section_headings, key_specs in fields.
- If a value is unclear, include it with a note like "value (partially legible)".
- Never skip data because it seems unimportant.`

export async function extractPDF(pdfBase64: string): Promise<ExtractedDocument> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.beta.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    betas: ['pdfs-2024-09-25'],
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache_control: { type: 'ephemeral' } as any,
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          } as never,
          {
            type: 'text',
            text: 'Extract all structured data from this document.',
          },
        ],
      },
    ],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  if (!raw) {
    throw new Error('Claude returned an empty response')
  }

  // Strip markdown code blocks if Claude adds them despite instructions
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(cleaned) as ExtractedDocument
  } catch {
    throw new Error(`Claude returned invalid JSON. Raw response: ${cleaned.slice(0, 300)}`)
  }
}
