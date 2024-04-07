<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script lang="ts" setup>
const appName = 'IRmania（α）'
 
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - ${appName}` : appName
  },
})
</script>