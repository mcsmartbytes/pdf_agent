'use client'

import Link from 'next/link'
import type { DocumentRecord } from '@/types'

interface DocumentsTableProps {
  documents: DocumentRecord[]
}

export default function DocumentsTable({ documents }: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No documents saved yet.</p>
        <p className="text-sm mt-1">Process and save a PDF to see it here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="pb-3 text-left text-gray-400 font-medium">Filename</th>
            <th className="pb-3 text-left text-gray-400 font-medium">Type</th>
            <th className="pb-3 text-left text-gray-400 font-medium">Pages</th>
            <th className="pb-3 text-left text-gray-400 font-medium">Saved</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-900/50 transition-colors">
              <td className="py-3 pr-4 text-gray-200 max-w-xs truncate">{doc.filename}</td>
              <td className="py-3 pr-4">
                <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-300 text-xs capitalize">
                  {doc.document_type?.replace(/_/g, ' ') ?? '—'}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-400">{doc.page_count ?? '—'}</td>
              <td className="py-3 pr-4 text-gray-400">
                {new Date(doc.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
