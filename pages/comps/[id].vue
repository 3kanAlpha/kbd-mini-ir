<template>
  <v-container fluid>
    <div v-if="!isLoading" class="text-center">
      <div class="text-h3 ma-6">{{ compInfo.name }}</div>
      <div class="text-subtitle-2 ma-2">スコア登録期間: {{ formatTimestamp(compInfo.open_until) }} まで</div>

      <div class="text-body-1 ma-4">{{ compInfo.desc }}</div>

      <div class="text-left">
        <v-data-table :items="scoreInfo" :headers="headers" item-key="user_name" v-model:sort-by="sortBy">
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
  { title: 'Player Name', value: 'user_name' },
  { title: 'Score', value: 'score' },
  { title: 'Updated at', value: 'updated_at' },
  { title: 'Result Image URL', value: 'image_url'},
]
const sortBy = [{ key: 'score', order: 'desc' }]

const user = ref(null)

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id)
  compInfo.value = data[0]
}

async function getScoreInfo() {
  const { data } = await supabase.from('score').select('user_name,score,updated_at,image_url').eq('tournament_id', route.params.id)
  scoreInfo.value = data
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  user.value = user
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  getCompInfo()
  getScoreInfo()
  getUser()
  isLoading.value = false
})
</script>