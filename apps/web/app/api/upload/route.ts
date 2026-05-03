// apps/web/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary, uploadFromURL } from '@/lib/cloudinary'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''

    // Mode 1: Upload via URL
    if (contentType.includes('application/json')) {
      const { imageUrl } = await req.json()
      if (!imageUrl) return NextResponse.json({ error: 'URL gambar diperlukan' }, { status: 400 })

      const result = await uploadFromURL(imageUrl)
      return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
    }

    // Mode 2: Upload via file multipart
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) return NextResponse.json({ error: 'File diperlukan' }, { status: 400 })

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Hanya file gambar yang diizinkan' }, { status: 400 })
      }

      // Validasi ukuran (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const result = await uploadToCloudinary(buffer, file.type)
      return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
    }

    return NextResponse.json({ error: 'Content-type tidak didukung' }, { status: 400 })
  } catch (error) {
    console.error('[UPLOAD]', error)
    return NextResponse.json({ error: 'Gagal mengupload gambar' }, { status: 500 })
  }
}
