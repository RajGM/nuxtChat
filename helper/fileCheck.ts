// ~/utils/documentType.ts
import type { Document } from '~/types'

export function detectDocumentType(file: File): Document['type'] {
  // You can do a more robust check, but a quick approach is by MIME type or extension:
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mime = file.type
  console.log(extension, mime)

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(extension)) {
    return 'image';
  }

  // If you want to rely more on extension:
  if (extension === 'pdf' || mime === 'application/pdf') {
    return 'pdf'
  }
  else if (extension === 'docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx'
  }
  else if (extension === 'txt' || mime === 'text/plain') {
    return 'txt'
  }
  else if (extension === 'csv' || mime === 'text/csv') {
    return 'csv'
  }
  else if (extension === 'xlsx' || mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'xlsx'
  }
  
  // If none of the above, you can handle unknown or throw an error
  throw new Error(`Unsupported file type: ${file.name}`)
}
