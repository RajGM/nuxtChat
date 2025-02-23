<template>
    <!-- Parent card container with max width and centered -->
    <div class="max-w-md mx-auto p-4 border rounded-md shadow-md space-y-4">
      <!-- Persona List -->
      <ul class="space-y-2">
        <li
          v-for="persona in personas"
          :key="persona.id"
          class="border p-4 rounded-md cursor-pointer transition-colors flex items-start space-x-3 hover:shadow-sm"
          :class="{ 'bg-blue-50 border-blue-500': selectedPersona?.id === persona.id }"
          @click="selectPersona(persona)"
        >
          <!-- Round avatar with shortName text -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-lg font-bold"
          >
            {{ persona.shortName }}
          </div>
          <!-- Persona Info -->
          <div>
            <h3 class="font-semibold">{{ persona.name }}</h3>
            <p class="text-sm text-gray-600">{{ persona.description }}</p>
            <!-- Persona Tags -->
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in personaTags[persona.id]"
                :key="tag"
                class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </li>
      </ul>
  
      <!-- Selected Persona Card -->
      <div v-if="selectedPersona" class="border p-4 rounded-md shadow-md">
        <h2 class="font-bold text-lg mb-2">Selected Persona</h2>
        <div class="flex items-start space-x-3">
          <!-- Round avatar for the selected persona -->
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-lg font-bold"
          >
            {{ selectedPersona.shortName }}
          </div>
          <div>
            <h3 class="font-semibold">{{ selectedPersona.name }}</h3>
            <p class="text-sm text-gray-600">{{ selectedPersona.description }}</p>
            <!-- Tags for Selected Persona -->
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="tag in personaTags[selectedPersona.id]"
                :key="tag"
                class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
    
        <!-- Analyze Button -->
        <button
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          @click="triggerAnalyze"
        >
          Analyze
        </button>
      </div>
    </div>
  </template>
    
  <script setup lang="ts">
  import { ref, defineProps, defineEmits } from 'vue'
  
  interface Persona {
    id: string
    shortName: string
    name: string
    description: string
  }
  
  interface DocumentItem {
    name: string
    time: string
    url: string
  }
  
  // Props: receive the selected documents from the parent
  const props = defineProps<{
    selectedDocuments: DocumentItem[]
  }>()
  
  // Emit an event when Analyze is triggered with the selected persona and documents
  const emit = defineEmits<{
    (e: 'analyze', payload: { persona: Persona; documents: DocumentItem[] }): void
  }>()
  
  const personas: Persona[] = [
    {
      id: 'financialAnalyst',
      shortName: '10X',
      name: '10x Underwriter',
      description: 'Focuses on financial metrics, risk assessment, and financial analysis.'
    },
    {
      id: 'legalOperations',
      shortName: 'RC',
      name: 'Risk Checker',
      description: 'Expert in legal compliance and operational risk assessment.'
    },
    {
      id: 'generalAdvisor',
      shortName: 'SB',
      name: 'Sounding Board',
      description: 'Open-ended strategic insights for general discussions.'
    }
  ]
  
  const personaTags: Record<string, string[]> = {
    financialAnalyst: ['Financial Analysis', 'Credit Check'],
    legalOperations: ['Risk Assessment', 'Payment Analysis'],
    generalAdvisor: ['Strategy', 'General Discussion']
  }
  
  const selectedPersona = ref<Persona | null>(null)
  
  function selectPersona(persona: Persona) {
    selectedPersona.value = persona
  }
  
  function triggerAnalyze() {
    if (!selectedPersona.value) return
    emit('analyze', { persona: selectedPersona.value, documents: props.selectedDocuments })
  }
  </script>
    
  <style scoped>
  /* Optional additional styling */
  </style>
  