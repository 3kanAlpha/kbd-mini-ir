<template>
  <v-container fluid>
    <div id="site-description" class="mx-auto">
      <div class="text-h3 my-6">
        <img src="/logo.png" width="300px" />
      </div>
      <div class="mt-4 mb-6">
        <p class="text-body-1 mb-2">色々な音ゲーでカジュアルに大会を開くためのプラットフォーム</p>
        <v-btn size="small" rounded="lg" variant="outlined" :prepend-icon="SvgGitHub" href="https://github.com/3kanAlpha/kbd-mini-ir">GitHub</v-btn>
      </div>
      <div class="my-4 pl-4 mb-6">
        <p class="text-body-2" v-if="!isLoggedIn">
          スコア登録のやり方:<br />
          1. <NuxtLink to="/login">ログインページ</NuxtLink>からログインする。<br />
          2. アカウント設定ページから名前を登録する。<br />
          3. 各大会のページからスコアを登録する。
        </p>
        <p class="text-body-2" v-else>
          スコア登録のやり方:<br />
          1. ログインページからログインする。<br />
          2. <NuxtLink to="/account">アカウント設定ページ</NuxtLink>から名前を登録する。<br />
          3. 各大会のページからスコアを登録する。
        </p>
      </div>
    </div>
    <div v-if="isLoggedIn" class="mb-6 text-center">
      <v-btn to="/comps/new" color="blue" prepend-icon="mdi-calendar-edit">大会を作成する</v-btn>
    </div>
    <div>
      <v-card flat>
        <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-3">
          <v-tab value="open">開催中</v-tab>
          <v-tab value="upcoming">開催予定</v-tab>
          <v-tab value="closed">終了済み</v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="open">
            <CompTable table-title="開催中の大会" />
          </v-window-item>
          <v-window-item value="upcoming">
            <CompTable type="upcoming" table-title="開催予定の大会" />
          </v-window-item>
          <v-window-item value="closed">
            <CompTable type="closed" table-title="終了済みの大会" />
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
import SvgGitHub from '~/components/svg/SvgGitHub.vue';
const runtimeConfig = useRuntimeConfig()
const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const isLoggedIn = ref(false)

const tab = ref(null)

/** ユーザーが既にログイン済みかどうかを検証する */
async function setLoggedIn() {
  const { data, error } = await supabase.auth.getSession()
  isLoggedIn.value = data.session != null
}

onMounted(() => {
  setLoggedIn()
})
</script>

<style>
#site-description {
  max-width: 700px;
}
</style>