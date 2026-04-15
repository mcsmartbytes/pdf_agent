import Link from 'next/link'
import { getAllDocuments } from '@/lib/database'
import DocumentsTable from '@/components/DocumentsTable'
import type { DocumentRecord } from '@/types'

export const revalidate = 0

export default async function DocumentsPage() {
  let documents: DocumentRecord[] = []
  let fetchError: string | null = null

  try {
    documents = await getAllDocuments()
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Failed to load documents'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Documents</h1>
          <p className="text-gray-400 mt-1 text-sm">All PDFs you have processed and saved.</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + New PDF
        </Link>
      </div>

      {fetchError ? (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          <span className="font-semibold">Error: </span>{fetchError}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <DocumentsTable documents={documents} />
        </div>
      )}
    </div>
  )
}
