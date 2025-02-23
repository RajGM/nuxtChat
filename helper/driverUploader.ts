// utils/driveUploader.ts
export async function parseAndUploadToServer(file: File): Promise<void> {
    const form = new FormData()
    form.append('file', file)
    form.append('sessionId', 'YOUR_SESSION_ID') // or get from your store
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: form
    })
  
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  
    // If using an event stream, you might need to handle streaming differently
    // or you can parse JSON, depending on your server setup.
    // For demonstration, let's assume it returns JSON or something similar:
    const result = await response.text()
    console.log('Upload server result:', result)
  }
  