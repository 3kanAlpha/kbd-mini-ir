<template>
  <v-container fluid>
    <div class="text-center">
      <div class="text-h3 ma-6">ログイン</div>
      <div>
        <div class="text-body-1 ma-2">既にアカウントを作成済みの方もそうでない方も、下のボタンから同様にログインできます。</div>
        <div class="mt-6">
          <v-btn prepend-icon="mdi-login" color="indigo" size="large" @click="signInWithDiscord">Login with Discord</v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
  })
}
</script>