import { NextRequest, NextResponse } from 'next/server'
import { saveDocument } from '@/lib/supabase'
import type { ExtractedDocument } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { filename, data } = body as { filename: string; data: ExtractedDocument }

    if (!filename || !data) {
      return NextResponse.json({ error: 'filename and data are required' }, { status: 400 })
    }

    const record = await saveDocument(filename, data)
    return NextResponse.json({ success: true, id: record.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed'
    console.error('[save] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
