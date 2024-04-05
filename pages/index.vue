<template>
  <v-container fluid>
    <div class="text-h3 ma-6">IRmania</div>
    <div>
      <v-data-table :items="comps" :headers="headers" item-key="name" v-model:sort-by="sortBy">
        <template v-slot:item.name="{ item }">
          <a :href="'comps/' + item.id">{{ item.name }}</a>
        </template>
        <template v-slot:item.open_until="{ item }">
          {{ formatTimestamp(item.open_until) }}
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

async function getComps() {
  const { data } = await supabase.from('tournaments').select()
  comps.value = data
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  getComps()
})
</script>