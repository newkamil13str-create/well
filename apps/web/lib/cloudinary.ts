// apps/web/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload dari URL eksternal ke Cloudinary
 */
export async function uploadFromURL(imageUrl: string) {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: 'kamilshop/produk',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  return result
}

/**
 * Upload dari Buffer (file multipart)
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'kamilshop/produk',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve(result as any)
      }
    )
    stream.end(buffer)
  })
}

/**
 * Hapus gambar dari Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
