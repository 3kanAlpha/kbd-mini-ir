<template>
  <v-layout>
    <v-app-bar
      color="blue"
      :class="{ 'px-16': !isPortraitMobile }"
    >
      <v-app-bar-title>IRmania</v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-home" to="/"></v-btn>
        <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
        <v-menu id="user-menu" transition="slide-x-transition" rounded>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-account-circle"></v-btn>
          </template>
          <v-card>
            <v-card-text>
              <div v-if="isLoggedIn" class="mx-auto text-center">
                <v-avatar class="mb-2" size="large">
                  <v-img
                    :src="userData.profile_pic_url"
                  ></v-img>
                </v-avatar>
                <h3>{{ userData.nickname }}</h3>
                <v-divider class="my-3"></v-divider>
                <v-btn variant="text" rounded prepend-icon="mdi-cog" to="/account">アカウント設定</v-btn>
                <v-divider class="my-3"></v-divider>
                <v-btn variant="text" rounded prepend-icon="mdi-logout" @click="signOut">ログアウト</v-btn>
              </div>
              <div v-else class="mx-auto text-center">
                <v-btn variant="text" rounded prepend-icon="mdi-login" to="/login" >ログイン</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
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

const { isPortraitMobile } = useMobileDetector()

const isLoggedIn = ref(false)
const userData = ref(null)

const defaultProfilePicURL = 'https://zczqyrsjbntkitypaaww.supabase.co/storage/v1/object/public/profile-pics/twitter-default.webp'

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  localStorage.setItem('theme', theme.global.name.value)
}

async function fetchUserInfo() {
  const { data: { user } } = await supabase.auth.getUser()

  isLoggedIn.value = user != null
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('user_uid', user.id)
      .limit(1)
      .single()
    
    if (data.profile_pic_url == null) {
      data.profile_pic_url = defaultProfilePicURL
    }

    userData.value = data
  }
}

/** 現在のセッションからサインアウトする */
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    location.reload()
  }
}

onMounted(() => {
  const userTheme = localStorage.getItem('theme')

  if (userTheme) {
    theme.global.name.value = userTheme
  }

  fetchUserInfo()
})
</script>

<style>
@import url('~/assets/css/main.css');

#user-menu {
  min-width: 200px;
}
</style>
