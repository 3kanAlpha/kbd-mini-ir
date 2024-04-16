<template>
  <v-layout>
    <v-app-bar
      color="blue"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>IRmania</v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-home" to="/"></v-btn>
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
        <v-btn icon="mdi-account-circle" @click="jumpToAccountPage"></v-btn>
      </template>
    </v-app-bar>

    <v-main class="d-flex justify-center">
      <div id="page-content">
        <slot />
      </div>
    </v-main>
  </v-layout>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()
const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('theme', theme.global.name.value)
}

/** ユーザーが既にログイン済みかどうかを検証する */
async function isLoggedIn() {
  const { data, error } = await supabase.auth.getSession()
  return data.session
}

async function jumpToAccountPage() {
  let flag = await isLoggedIn()
  if (flag) {
    await navigateTo('/account')
  } else {
    await navigateTo('/login')
  }
}

onMounted(() => {
  const userTheme = localStorage.getItem('theme')

  if (userTheme) {
    theme.global.name.value = userTheme
  }
})
</script>

<style>
@import url('~/assets/css/main.css');
</style>
