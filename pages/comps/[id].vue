<template>
  <v-container fluid>
    <div v-if="!isLoading" class="text-center">
      <div class="text-h3 my-4">{{ compInfo.name }}</div>
      <div class="text-h6 ma-1">{{ compInfo.song_title }} [{{ compInfo.difficulty }}]</div>
      <div class="text-subtitle-2 ma-1">スコア登録期間: {{ formatTimestamp(compInfo.open_until) }} まで <span v-if="!isCompOpen(compInfo.open_until)">(開催終了)</span></div>

      <div class="text-body-1 ma-4" style="white-space: pre-wrap;">{{ compInfo.desc }}</div>

      <div v-if="isLoggedIn && isCompOpen(compInfo.open_until)" class="my-4">
        <v-btn size="large" :to="submissionPageUrl" color="blue" prepend-icon="mdi-pencil-box">スコア提出</v-btn>
      </div>

      <div class="text-left">
        <v-data-table :items="scoreInfo" :headers="headers" item-key="user_uid" v-model:sort-by="sortBy">
          <template v-slot:item.user_uid="{ item }">
            {{ item.users.nickname }}
          </template>
          <template v-slot:item.updated_at="{ item }">
            {{ formatTimestamp(item.updated_at) }}
          </template>
        </v-data-table>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const compInfo = ref(null)
const scoreInfo = ref([])
const isLoading = ref(true)
const headers = [
  { title: 'Player Name', value: 'user_uid' },
  { title: 'Score', value: 'score' },
  { title: 'Updated at', value: 'updated_at' },
  { title: 'Result Image URL', value: 'image_url'},
]
const sortBy = [{ key: 'score', order: 'desc' }]

const isLoggedIn = ref(false)

const submissionPageUrl = `/submit/${route.params.id}`

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data
}

async function getScoreInfo() {
  const { data } = await supabase
    .from('score')
    .select(`
      user_uid,
      score,
      updated_at,
      image_url,
      users (nickname)`)
    .eq('tournament_id', route.params.id)
  scoreInfo.value = data
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
  getCompInfo()
  getScoreInfo()
  setLoggedIn()
  isLoading.value = false
})
</script>