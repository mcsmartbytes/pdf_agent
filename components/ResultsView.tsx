'use client'

import type { ExtractedDocument } from '@/types'

interface ResultsViewProps {
  data: ExtractedDocument
  filename?: string
  onSave?: () => void
  saving?: boolean
  saved?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  packing_slip: 'bg-blue-900 text-blue-300',
  invoice: 'bg-green-900 text-green-300',
  medical_record: 'bg-red-900 text-red-300',
  manual: 'bg-purple-900 text-purple-300',
  contract: 'bg-yellow-900 text-yellow-300',
  receipt: 'bg-orange-900 text-orange-300',
  form: 'bg-pink-900 text-pink-300',
  report: 'bg-indigo-900 text-indigo-300',
  other: 'bg-gray-800 text-gray-300',
}

function typeColor(type: string) {
  return TYPE_COLORS[type?.toLowerCase()] ?? TYPE_COLORS.other
}

export default function ResultsView({ data, filename, onSave, saving, saved }: ResultsViewProps) {
  const fields = Object.entries(data.fields ?? {})
  const lineItemKeys = data.line_items?.length > 0 ? Object.keys(data.line_items[0]) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${typeColor(data.document_type)}`}>
              {data.document_type?.replace(/_/g, ' ')}
            </span>
            {filename && <p className="text-gray-400 text-sm">{filename}</p>}
            <p className="text-gray-200">{data.summary}</p>
          </div>

          {onSave && (
            <button
              onClick={onSave}
              disabled={saving || saved}
              className={`shrink-0 px-5 py-2 rounded-lg font-medium text-sm transition-colors
                ${saved
                  ? 'bg-green-800 text-green-300 cursor-default'
                  : saving
                  ? 'bg-gray-700 text-gray-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
              {saved ? 'Saved' : saving ? 'Saving...' : 'Save to Database'}
            </button>
          )}
        </div>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <Section title="Fields">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-800">
                {fields.map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-2 pr-4 text-gray-400 font-medium whitespace-nowrap w-48">
                      {key.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2 text-gray-200 break-all">
                      {value === null || value === undefined || value === ''
                        ? <span className="text-gray-600">—</span>
                        : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Line Items */}
      {data.line_items?.length > 0 && (
        <Section title={`Line Items (${data.line_items.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {lineItemKeys.map((k) => (
                    <th key={k} className="py-2 pr-4 text-left text-gray-400 font-medium whitespace-nowrap">
                      {k.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.line_items.map((item, i) => (
                  <tr key={i}>
                    {lineItemKeys.map((k) => (
                      <td key={k} className="py-2 pr-4 text-gray-200 whitespace-nowrap">
                        {item[k] === null || item[k] === undefined || item[k] === ''
                          ? <span className="text-gray-600">—</span>
                          : String(item[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Dates */}
      {data.dates?.length > 0 && (
        <Section title="Dates">
          <div className="flex flex-wrap gap-2">
            {data.dates.map((d, i) => (
              <span key={i} className="px-3 py-1 bg-gray-800 rounded-lg text-gray-300 text-sm">{d}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Entities */}
      {(data.entities?.companies?.length > 0 || data.entities?.people?.length > 0 || data.entities?.addresses?.length > 0) && (
        <Section title="Entities">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EntityGroup label="Companies" items={data.entities?.companies} />
            <EntityGroup label="People" items={data.entities?.people} />
            <EntityGroup label="Addresses" items={data.entities?.addresses} />
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  )
}

function EntityGroup({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase mb-2">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-gray-300 text-sm">{item}</li>
        ))}
      </ul>
    </div>
  )
}
