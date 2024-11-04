<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script lang="ts" setup>
const appName = 'IRmania:Q'
const desc = '色んなゲームでカジュアル大会を開くためのプラットフォーム'
 
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName}` : appName
  },
})

useSeoMeta({
  ogTitle: appName,
  description: desc,
  ogDescription: desc,
})
</script>