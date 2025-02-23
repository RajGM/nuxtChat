<template>
    <div class="w-full max-w-lg">
      <!-- Drag & Drop / Click-to-Upload Zone -->
      <div
        ref="dropZoneRef"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
        :class="[
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors animate-fade-in cursor-pointer',
          isOverDropZone ? 'border-slate-400 bg-slate-50' : 'border-slate-200'
        ]"
        @click="open"
      >
        <div class="mb-4 h-8 w-8 flex items-center justify-center text-slate-400">
          Upload
        </div>
        <p class="mb-1 text-sm font-medium text-slate-700">
          Drop files to upload
        </p>
        <p class="text-xs text-slate-500">or click to browse</p>
        <!-- Hidden file input is managed by useFileDialog -->
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="onChangeHandler"
        />
      </div>
  
      <!-- File Preview List -->
      <div v-if="files.length > 0" class="mt-4 space-y-2">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center justify-between p-2 bg-slate-100 rounded-md"
        >
          <div class="flex items-center space-x-2">
            <div class="h-5 w-5 text-slate-500">File</div>
            <span class="text-sm text-slate-700">{{ file.name }}</span>
          </div>
          <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
            <div class="h-4 w-4">X</div>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  const toast = useToast();
//   const isExampleSession = useIsExampleSession()

  // Allowed file types
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
  ]
  
  // Local state for files (mock implementation)
  const files = ref<File[]>([])
    interface DocumentItem {
    name: string
    time: string
  }
  
  const documents = ref<DocumentItem[]>([
    { name: 'Q4_Financial_Statement.pdf', time: '2:43 PM' , url:'https://firebasestorage.googleapis.com/v0/b/voice-vote-bf4ea.appspot.com/o/takshashila%2FCP-101998%20causes%20of%20war%20%26%20conditions%20of%20peace.pdf?alt=media&token=4da61e87-ca49-480d-8887-1f309b7afdb6'},
    { name: 'Credit_History.pdf', time: '2:44 PM', url:'gs://voice-vote-bf4ea.appspot.com/takshashila/CP23-No Yolk_ Shortages and Spikes in the Time of COVID - Econlib.pdf' },
  ])
  // Reference to the native file input element
  const fileInput = ref<HTMLInputElement | null>(null)
  
  // Standard drag/drop and file input handlers
  function handleDragOver(e: DragEvent) {
    e.preventDefault()
  }
  
  function handleDragLeave() {
    // Optionally add logic when dragging leaves the drop zone
  }

  function detectDocumentType(file){
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
  
  function handleDrop(e: DragEvent) {
    e.preventDefault()
    const newFiles = e.dataTransfer ? Array.from(e.dataTransfer.files) : []
    uploadFile(newFiles)
  }
  
  function onChangeHandler(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files) {
      uploadFile(Array.from(target.files))
      target.value = ''
    }
  }
  
  function removeFile(index: number) {
    files.value.splice(index, 1)
  }
  
  function open() {
    fileInput.value?.click()
  }
  
  // Mock upload function that validates and adds files to local state
  async function uploadFile(files: File[] | FileList | null) {
  if (!files) return
//   if (isExampleSession.value) {
//     return toast.add({
//       title: 'Example session',
//       description: 'Files cannot be uploaded to example sessions. Reload the page to start a new session.',
//       color: 'error',
//     })
//   }

  for (const file of files) {
    try {
      detectDocumentType(file)
    } catch (error) {
      toast.add({
        title: 'Invalid file type',
        description: `File ${file.name} is not supported. 
                    Please upload PDF, DOCX, TXT, CSV, or XLSX only.`,
        color: 'error',
      })
      console.error('Skipping file', file, error)
      continue // Skip this file
    }

    const form = new FormData()
    form.append('file', file)
    //form.append('sessionId', sessionId.value)

    documents.value.push({
      name: file.name,
      size: (Math.round((file.size / 1024 / 1024) * 1000) / 1000), // truncate up to 3 decimal places
      chunks: null,
      progress: 'Starting upload...',
    })
    const document = documents.value.find(doc => doc.name === file.name)

    try {
      const response = useStream<UploadStreamResponse>('/api/upload', form)()
      for await (const chunk of response) {
        if (chunk.message) document!.progress = chunk.message
        if (chunk.chunks) document!.chunks = chunk.chunks
        if (chunk.error) throw new Error(chunk.error)
      }

      if (document) delete document.progress // remove progress when done

      toast.add({
        id: file.name,
        title: 'File uploaded',
        description: file.name,
      })
    }
    catch (error) {
      toast.add({
        id: file.name,
        title: 'Error uploading file',
        // @ts-expect-error unknown error type
        description: `An error occurred while uploading ${file.name}. ${error?.message}`,
        color: 'error',
      })
      documents.value = documents.value.filter(doc => doc.name !== file.name)
    }
  }
  reset()
}
  
  // ----- Composables Integration -----
  // Set up the file dialog composable
  const { open: openFileDialog, onChange, reset } = useFileDialog({
    accept: '.pdf, .docx, .txt, .csv, .xlsx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    multiple: true,
  })
  // When files are selected via the file dialog, trigger uploadFile
  onChange(selectedFiles => uploadFile(selectedFiles))
  
  // Set up the drop zone composable
  const dropZoneRef = ref<HTMLDivElement>()
  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: uploadFile,
    dataTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    multiple: true,
    preventDefaultForUnhandled: true,
  })


  </script>
  
  <style scoped>
  /* Optional additional styling */
  </style>
  