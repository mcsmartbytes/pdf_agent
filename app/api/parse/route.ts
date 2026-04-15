import { NextRequest, NextResponse } from 'next/server'
import { extractPDF } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50MB
const PDF_MAGIC = '%PDF-'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    // CAT2: Validate file presence
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // CAT2: Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 50MB)` },
        { status: 400 }
      )
    }

    // CAT2: Validate MIME type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only PDFs are accepted.` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // CAT2: Validate PDF magic bytes — reject disguised files
    if (buffer.slice(0, 5).toString('ascii') !== PDF_MAGIC) {
      return NextResponse.json(
        { error: 'File is not a valid PDF (failed magic byte check)' },
        { status: 400 }
      )
    }

    // CAT3: API key is server-side only — never sent to browser
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: missing API key' },
        { status: 500 }
      )
    }

    const pdfBase64 = buffer.toString('base64')
    const extracted = await extractPDF(pdfBase64)

    return NextResponse.json({ success: true, data: extracted, filename: file.name })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[parse] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
