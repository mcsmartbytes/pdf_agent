import Link from 'next/link'
import { getDocumentById } from '@/lib/database'
import ResultsView from '@/components/ResultsView'

interface Props {
  params: { id: string }
}

export default async function DocumentDetailPage({ params }: Props) {
  let doc = null
  let fetchError = null

  try {
    doc = await getDocumentById(params.id)
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Document not found'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/documents" className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
          ← Documents
        </Link>
      </div>

      {fetchError ? (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          <span className="font-semibold">Error: </span>{fetchError}
        </div>
      ) : doc?.raw_json ? (
        <ResultsView data={doc.raw_json} filename={doc.filename} />
      ) : (
        <div className="text-gray-500 text-center py-16">No data found for this document.</div>
      )}
    </div>
  )
}
