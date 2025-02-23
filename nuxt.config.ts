// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path'

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxthub/core",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/mdc",
    "@vueuse/nuxt",
    "nuxthub-ratelimit",
    "@nuxtjs/tailwindcss",
  ],

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    ai: true,
    blob: true,
    cache: true,
    database: true,
    kv: true,
    vectorize: {
      documents: {
        dimensions: 1024,
        metric: "euclidean",
        metadataIndexes: {
          sessionId: "string",
        },
      },
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
    externals: {
      // Inline these packages so that Nitro bundles them rather than treating them as externals
      inline: ["csv-parse", "readable-stream", "string_decoder"],
    },
  },

});