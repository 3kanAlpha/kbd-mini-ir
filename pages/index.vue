<template>
  <v-container fluid>
    <div class="text-h3 ma-6">IRmania</div>
    <div class="ma-4">
      <p class="text-body-2" v-if="!isLoggedIn">
        スコア登録のやり方:<br />
        1. <NuxtLink to="/login">ログインページ</NuxtLink>からログインする。<br />
        2. アカウント情報ページから名前を登録する。<br />
        3. 各大会のページからスコアを登録する。
      </p>
      <p class="text-body-2" v-else>
        スコア登録のやり方:<br />
        1. ログインページからログインする。<br />
        2. <NuxtLink to="/account">アカウント情報ページ</NuxtLink>から名前を登録する。<br />
        3. 各大会のページからスコアを登録する。
      </p>
    </div>
    <div>
      <v-data-table :items="comps" :headers="headers" item-key="name" v-model:sort-by="sortBy">
        <template v-slot:item.name="{ item }">
          <a :href="'comps/' + item.id">{{ item.name }}</a>
        </template>
        <template v-slot:item.open_until="{ item }">
          <div :class="{'text-grey-lighten-1': !isCompOpen(item.open_until)}">
            {{ formatTimestamp(item.open_until) }}
          </div>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()
const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const comps = ref([])
const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Game title', value: 'game_title' },
  { title: 'Song title', value: 'song_title' },
  { title: 'Difficulty', value: 'difficulty' },
  { title: 'Open Until', value: 'open_until'},
]
const sortBy = [{ key: 'id', order: 'desc' }] // 新しい大会が上に来るように

const isLoggedIn = ref(false)

async function getComps() {
  const { data } = await supabase.from('tournaments').select()
  comps.value = data
}

/** ユーザーが既にログイン済みかどうかを検証する */
async function setLoggedIn() {
  const { data, error } = await supabase.auth.getSession()
  isLoggedIn.value = data.session != null
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function isCompOpen(timestamp) {
  return new Date(timestamp) > new Date()
}

onMounted(() => {
  getComps()
  setLoggedIn()
})
</script>