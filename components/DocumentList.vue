<template>
    <div class="w-full max-w-sm rounded-md bg-surface-low p-4">
      <!-- Heading -->
      <h3 class="mb-3 text-lg font-semibold text-slate-700">
        Document History
      </h3>
  
      <!-- Document List -->
      <ul class="space-y-2">
        <li
          v-for="(doc, index) in documents"
          :key="index"
          class="flex items-center justify-between rounded-md bg-surface-high px-3 py-2"
        >
          <div class="flex items-center space-x-2">
            <!-- Checkbox to select document -->
            <input
              type="checkbox"
              v-model="selectedDocuments"
              :value="doc"
              class="form-checkbox h-4 w-4 text-blue-600"
            />
            <span class="text-sm text-slate-800">{{ doc.name }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-500">{{ doc.time }}</span>
            <!-- Preview Button -->
            <button
              class="text-xs text-blue-600 hover:underline"
              @click="openPreview(doc)"
            >
              Preview
            </button>
          </div>
        </li>
      </ul>
    </div>
  
    <!-- Preview Modal -->
    <div
      v-if="previewDoc"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-md p-4 max-w-lg w-full">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold text-lg">{{ previewDoc.name }}</h4>
          <button class="text-red-600" @click="closePreview">Close</button>
        </div>
        <div class="h-64">
          <!-- Display the document preview using an iframe (assumes a PDF or web-viewable URL) -->
          <iframe :src="previewDoc.url" class="w-full h-full" frameborder="0"></iframe>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  
  interface DocumentItem {
    name: string
    time: string
    url: string
  }
  
  const documents = ref<DocumentItem[]>([
    {
      name: 'Q4_Financial_Statement.pdf',
      time: '2:43 PM',
      url: 'https://firebasestorage.googleapis.com/v0/b/voice-vote-bf4ea.appspot.com/o/takshashila%2FCP-101998%20causes%20of%20war%20%26%20conditions%20of%20peace.pdf?alt=media&token=4da61e87-ca49-480d-8887-1f309b7afdb6'
    },
    {
      name: 'Credit_History.pdf',
      time: '2:44 PM',
      url: 'https://firebasestorage.googleapis.com/v0/b/voice-vote-bf4ea.appspot.com/o/takshashila%2FCP23-No%20Yolk_%20Shortages%20and%20Spikes%20in%20the%20Time%20of%20COVID%20-%20Econlib.pdf?alt=media&token=b3c4b28f-20e0-4317-8b3c-b6c4b6bf60fd'
    },
  ])
  
  // Array to hold selected documents
  const selectedDocuments = ref<DocumentItem[]>([])
  
  // This ref will hold the document being previewed
  const previewDoc = ref<DocumentItem | null>(null)
  
  // Open preview modal with selected document
  function openPreview(doc: DocumentItem) {
    previewDoc.value = doc
  }
  
  // Close the preview modal
  function closePreview() {
    previewDoc.value = null
  }
  
  // Emit the selected documents to parent
  const emit = defineEmits<{
    (e: 'update:selectedDocuments', docs: DocumentItem[]): void
  }>()
  
  watch(selectedDocuments, (newDocs) => {
    emit('update:selectedDocuments', newDocs)
  })
  </script>
  
  <style scoped>
  /* Optional: Add custom styles for the modal backdrop animation, etc. */
  </style>
  