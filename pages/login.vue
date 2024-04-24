<template>
  <v-container fluid>
    <div class="text-center">
      <div class="text-h3 my-6 mb-12">ログイン</div>
      <div>
        <div class="text-body-1 mb-6">既にアカウントを作成済みの方もそうでない方も、下のボタンから同様にログインできます。</div>
        <div>
          <v-btn 
            :prepend-icon="SvgDiscord" 
            color="indigo" 
            size="large" 
            class="text-none" 
            @click="signInWithDiscord"
            :disabled="isLoggedIn"
          >Log in with Discord</v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
import SvgDiscord from '~/components/svg/SvgDiscord.vue';
const runtimeConfig = useRuntimeConfig()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const isLoggedIn = ref(false)

/** 認証後のリダイレクト先を返す */
function getRedirectURL() {
  return runtimeConfig.public.siteURL
}

async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: getRedirectURL(),
    }
  })
}

async function setLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser()
  isLoggedIn.value = user != null
}

onMounted(() => {
  setLoggedIn()
})
</script>