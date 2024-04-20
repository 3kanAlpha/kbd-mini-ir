<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script lang="ts" setup>
const appName = 'IRmania（原宿）'
const desc = '色んなゲームでカジュアル大会を開くためのプラットフォーム'
 
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName}` : appName
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

useSeoMeta({
  ogTitle: appName,
  description: desc,
  ogDescription: desc,
})
</script>