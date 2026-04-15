'use client'

import { useState, useCallback } from 'react'
import PDFUploader from '@/components/PDFUploader'
import ResultsView from '@/components/ResultsView'
import type { ExtractedDocument } from '@/types'

type Status = 'idle' | 'processing' | 'done' | 'error'

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<ExtractedDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError(null)
    setStatus('idle')
    setSaved(false)
  }, [])

  const handleProcess = async () => {
    if (!file) return

    setStatus('processing')
    setError(null)
    setResult(null)
    setSaved(false)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/parse', { method: 'POST', body: form })

      const text = await res.text()
      let json: { success?: boolean; error?: string; data?: ExtractedDocument }
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`Server error: ${text.slice(0, 300)}`)
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Unknown error from server')
      }

      setResult(json.data)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  const handleSave = async () => {
    if (!result || !file) return
    setSaving(true)

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, data: result }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setSaved(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Extract Data from Any PDF</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Upload a PDF — Claude will detect the document type and extract all structured data.
        </p>
      </div>

      <PDFUploader onFile={handleFile} disabled={status === 'processing'} />

      {file && status !== 'processing' && (
        <button
          onClick={handleProcess}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
        >
          Process PDF
        </button>
      )}

      {status === 'processing' && (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Sending to Claude...</span>
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          <span className="font-semibold">Error: </span>{error}
        </div>
      )}

      {status === 'done' && result && (
        <ResultsView
          data={result}
          filename={file?.name}
          onSave={handleSave}
          saving={saving}
          saved={saved}
        />
      )}
    </div>
  )
}
