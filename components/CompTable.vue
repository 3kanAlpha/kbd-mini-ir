<template>
  <div class="comp-table">
    <v-card flat>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-web"></v-icon> &nbsp;
        {{ tableTitle }}

        <v-spacer></v-spacer>

        <v-text-field
          v-model="searchText"
          density="compact"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
        ></v-text-field>
      </v-card-title>

      <v-divider></v-divider>
      <v-data-table :items="comps" :headers="headers" item-key="name" v-model:sort-by="sortBy" :loading="tableLoading" :search="searchText">
        <template v-slot:item="{ item }">
          <tr>
            <td data-label="Name">
              <NuxtLink :to="'/comps/' + item.id">{{ item.name }}</NuxtLink>
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
    </v-card>
  </div>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'

const props = defineProps({
  showClosed: Boolean,
  tableTitle: String,
})

const runtimeConfig = useRuntimeConfig()
const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const comps = ref([])
const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Game Title', value: 'game_title' },
  { title: 'Song Title', value: 'song_title' },
  { title: 'Difficulty', value: 'difficulty' },
  { title: 'Open Until', value: 'open_until', filterable: false },
]
const sortBy = [{ key: 'id', order: 'desc' }] // 新しい大会が上に来るように

const searchText = ref('')

const tableLoading = ref(true)

const compTableName = 'tournaments'

async function getComps() {
  const data = props.showClosed ? await getClosedComps() : await getOpenComps()
  comps.value = data
  tableLoading.value = false
}

/** 開催中の大会を取得する */
async function getOpenComps() {
  const currentDate = new Date().toISOString()

  const { data } = await supabase
    .from(compTableName)
    .select()
    .gte('open_until', currentDate)
  return data
}

/** 終了済みの大会を取得する */
async function getClosedComps() {
  const currentDate = new Date().toISOString()

  const { data } = await supabase
    .from(compTableName)
    .select()
    .lt('open_until', currentDate)
  return data
}

onMounted(() => {
  getComps()
})
</script>

<style>
@media screen and (min-width: 960px) {
  .comp-table {
    min-width: 780px;
  }
}
</style>