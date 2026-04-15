import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PDF Vision Agent',
  description: 'Extract structured data from any PDF using Claude AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="font-semibold text-white tracking-tight">PDF Vision Agent</a>
            <a href="/documents" className="text-gray-400 hover:text-gray-200 text-sm transition-colors">
              Documents
            </a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
