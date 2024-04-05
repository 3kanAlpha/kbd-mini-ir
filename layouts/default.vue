<template>
  <v-layout>
    <v-app-bar
      color="blue"
    >
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title><NuxtLink to="/" id="site-title">IRmania</NuxtLink></v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
        <v-btn icon="mdi-account-circle" to="/login"></v-btn>
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

const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<style>
#page-content {
  max-width: 1400px;
}

#site-title {
  text-decoration: none;
  color: #fff;
}
</style>