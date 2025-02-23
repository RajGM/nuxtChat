<template>
    <div class="flex min-h-screen">
      <!-- Left side: FileUploader, DocumentList, Persona in a vertical list -->
      <div class="w-64 min-w-[400px] flex flex-col space-y-4 p-4 border-r">
        <FileUploader />
        <!-- DocumentList emits the updated selected documents -->
        <DocumentList @update:selectedDocuments="updateSelectedDocs" />
        <!-- Persona receives the selectedDocuments as a prop and emits an analyze event -->
        <Persona :selectedDocuments="selectedDocuments" @analyze="handleAnalyze" />
      </div>
  
      <!-- Right side: Chat component takes the rest of the width -->
      <div class="flex-1 p-4">
        <div class="h-full border rounded-md p-4">
          CHAT HERE
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import FileUploader from '~/components/FileUploader.vue'
  import DocumentList from '~/components/DocumentList.vue'
  import Persona from '~/components/Persona.vue'
  
  interface DocumentItem {
    name: string
    time: string
    url: string
  }
  
  // Holds the documents selected in DocumentList
  const selectedDocuments = ref<DocumentItem[]>([])
  
  // Update the selected documents when DocumentList emits the update event
  function updateSelectedDocs(docs: DocumentItem[]) {
    selectedDocuments.value = docs
  }
  
  // Handle the analyze event emitted by Persona
  function handleAnalyze(payload: { persona: any; documents: DocumentItem[] }) {
    console.log('Analyze triggered:', payload)
    // Here you can add your analysis logic, such as calling an API.
  }
  </script>
  
  <style scoped>
  /* Additional styling if needed */
  </style>
  