import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { extractPDF } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_SIZE_BYTES = 50 * 1024 * 1024
const PDF_MAGIC = '%PDF-'

async function slicePages(buffer: Buffer<ArrayBuffer>, start: number, end: number): Promise<Buffer<ArrayBuffer>> {
  const src = await PDFDocument.load(buffer)
  const total = src.getPageCount()

  const startIdx = Math.max(0, start - 1)
  const endIdx = Math.min(end, total) - 1

  if (startIdx > endIdx) {
    throw new Error(`Page range ${start}–${end} is out of range — document has ${total} pages`)
  }

  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, Array.from({ length: endIdx - startIdx + 1 }, (_, i) => startIdx + i))
  pages.forEach((p) => out.addPage(p))

  return Buffer.from(await out.save()) as Buffer<ArrayBuffer>
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const startPage = formData.get('startPage') as string | null
    const endPage = formData.get('endPage') as string | null

    // CAT2: Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 50MB)` },
        { status: 400 }
      )
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only PDFs are accepted.` },
        { status: 400 }
      )
    }

    let buffer = Buffer.from(await file.arrayBuffer())

    // CAT2: Validate PDF magic bytes
    if (buffer.slice(0, 5).toString('ascii') !== PDF_MAGIC) {
      return NextResponse.json(
        { error: 'File is not a valid PDF (failed magic byte check)' },
        { status: 400 }
      )
    }

    // Slice pages if range provided
    if (startPage || endPage) {
      const start = startPage ? parseInt(startPage, 10) : 1
      const end = endPage ? parseInt(endPage, 10) : 999999

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        return NextResponse.json(
          { error: 'Invalid page range. Start and end must be positive numbers, start ≤ end.' },
          { status: 400 }
        )
      }

      buffer = await slicePages(buffer, start, end)
      console.log(`[parse] sliced to pages ${start}–${end} (${(buffer.length / 1024).toFixed(0)}KB)`)
    }

    // CAT3: API key server-side only
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
