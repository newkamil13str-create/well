'use client'
// apps/web/app/error.tsx
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-500 mb-8">Maaf, ada masalah. Silakan coba lagi.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Coba Lagi
          </button>
          <a href="/" className="px-6 py-3 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50">
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
