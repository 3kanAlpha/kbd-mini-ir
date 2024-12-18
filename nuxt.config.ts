import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    ['@nuxtjs/robots', {
      rules: {
        UserAgent: '*',
        Disallow: '/',
      }
    }],
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      supabaseURL: process.env.SUPABASE_URL,
      anonKey: process.env.ANON_KEY,
      s3Endpoint: process.env.S3_ENDPOINT,
      s3AccessKey: process.env.S3_ACCESS_KEY_ID,
      s3Secret: process.env.S3_SECRET,
      siteURL: process.env.SITE_URL,
      imageUploaderDomain: process.env.IMAGE_UPLOADER_DOMAIN,
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    }
  },

  compatibilityDate: '2024-11-04',
})