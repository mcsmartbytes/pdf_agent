// TODO: AWS migration — swap this client for AWS equivalents when ready.
// All database access is isolated here. No Supabase imports anywhere else.

import { createClient } from '@supabase/supabase-js'
import type { DocumentRecord, ExtractedDocument } from '@/types'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  return createClient(url, key)
}

export async function saveDocument(
  filename: string,
  extracted: ExtractedDocument,
  pageCount: number = 0
): Promise<DocumentRecord> {
  const client = getClient()

  const { data, error } = await client
    .from('documents')
    .insert({
      filename,
      document_type: extracted.document_type,
      page_count: pageCount,
      raw_json: extracted,
      source_path: filename,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save document: ${error.message}`)
  }

  return data as DocumentRecord
}

export async function getAllDocuments(): Promise<DocumentRecord[]> {
  const client = getClient()

  const { data, error } = await client
    .from('documents')
    .select('id, created_at, filename, document_type, page_count')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return (data ?? []) as DocumentRecord[]
}

export async function getDocumentById(id: string): Promise<DocumentRecord> {
  const client = getClient()

  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Document not found: ${error.message}`)
  }

  return data as DocumentRecord
}
