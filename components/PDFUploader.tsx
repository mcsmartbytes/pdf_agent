'use client'

import { useCallback, useState } from 'react'

interface PDFUploaderProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function PDFUploader({ onFile, disabled }: PDFUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('File is too large. Maximum size is 50MB.')
        return
      }
      setSelected(file.name)
      onFile(file)
    },
    [onFile]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
        ${dragging ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 hover:border-gray-500'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => document.getElementById('pdf-input')?.click()}
    >
      <input
        id="pdf-input"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>

        {selected ? (
          <p className="text-blue-400 font-medium">{selected}</p>
        ) : (
          <>
            <p className="text-gray-300 font-medium">Drop a PDF here or click to browse</p>
            <p className="text-gray-500 text-sm">Any PDF up to 50MB — invoices, manuals, medical records, packing slips</p>
          </>
        )}
      </div>
    </div>
  )
}
