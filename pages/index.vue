<template>
  <v-container fluid>
    <div class="text-h3 my-6 caveat-bold">IRmania</div>
    <div class="mt-4 mb-6">
      <p class="text-body-1 mb-2">色々な音ゲーでカジュアルに大会を開くためのプラットフォーム</p>
      <v-btn size="small" rounded="lg" variant="outlined" :prepend-icon="SvgGitHub" href="https://github.com/3kanAlpha/kbd-mini-ir">GitHub</v-btn>
    </div>
    <div class="my-4 pl-4 mb-6">
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
    <div v-if="isLoggedIn" class="my-4 text-center">
      <v-btn to="/comps/new" color="blue" prepend-icon="mdi-calendar-edit">大会を作成する</v-btn>
    </div>
    <div>
      <v-data-table :items="comps" :headers="headers" item-key="name" v-model:sort-by="sortBy" :loading="tableLoading">
        <template v-slot:item="{ item }">
          <tr>
            <td data-label="Name">
              <NuxtLink :to="'comps/' + item.id">{{ item.name }}</NuxtLink>
            </td>
            <td data-label="Game Title">{{ item.game_title }}</td>
            <td data-label="Song Title">{{ item.song_title }}</td>
            <td data-label="Difficulty">{{ item.difficulty }}</td>
            <td data-label="Open Until">
              <div :class="{'text-grey-lighten-1': !isCompOpen(item.open_until)}">
                {{ formatTimestamp(item.open_until) }}
              </div>
            </td>
          </tr>
        </template>
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@1"></v-skeleton-loader>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
import SvgGitHub from '~/components/svg/SvgGitHub.vue';
const runtimeConfig = useRuntimeConfig()
const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const comps = ref([])
const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Game Title', value: 'game_title' },
  { title: 'Song Title', value: 'song_title' },
  { title: 'Difficulty', value: 'difficulty' },
  { title: 'Open Until', value: 'open_until'},
]
const sortBy = [{ key: 'id', order: 'desc' }] // 新しい大会が上に来るように

const isLoggedIn = ref(false)

const tableLoading = ref(true)

async function getComps() {
  const { data } = await supabase.from('tournaments').select()
  comps.value = data
  tableLoading.value = false
}

/** ユーザーが既にログイン済みかどうかを検証する */
async function setLoggedIn() {
  const { data, error } = await supabase.auth.getSession()
  isLoggedIn.value = data.session != null
}

onMounted(() => {
  getComps()
  setLoggedIn()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');

.caveat-bold {
  font-family: "Caveat", cursive;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>