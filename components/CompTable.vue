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
      <v-data-table v-if="type === 'upcoming'" :items="comps" :headers="upcomingHeaders" item-key="name" v-model:sort-by="sortBy" :loading="tableLoading" :search="searchText">
        <template v-slot:item="{ item }">
          <tr>
            <td class="table-td-name" data-label="Name">
              <NuxtLink :to="'/comps/' + item.id">{{ item.name }}</NuxtLink>
            </td>
            <td class="table-td-game-title" data-label="Game Title">{{ item.game_title }}</td>
            <td class="table-td-song-title" data-label="Song Title">{{ item.song_title }}</td>
            <td data-label="Difficulty">{{ item.difficulty }}</td>
            <td data-label="Duration">
              {{ formatTimestamp(item.open_since) }} - {{ formatTimestamp(item.open_until) }}
            </td>
          </tr>
        </template>
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@1"></v-skeleton-loader>
        </template>
      </v-data-table>
      <v-data-table v-else :items="comps" :headers="headers" item-key="name" v-model:sort-by="sortBy" :loading="tableLoading" :search="searchText">
        <template v-slot:item="{ item }">
          <tr>
            <td class="table-td-name" data-label="Name">
              <NuxtLink :to="'/comps/' + item.id">{{ item.name }}</NuxtLink>
            </td>
            <td class="table-td-game-title" data-label="Game Title">{{ item.game_title }}</td>
            <td class="table-td-song-title" data-label="Song Title">{{ item.song_title }}</td>
            <td data-label="Difficulty">{{ item.difficulty }}</td>
            <td data-label="Open Until">
              <div :class="{'text-grey-lighten-1': !isCompOpen(item.open_since, item.open_until)}">
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
  tableTitle: String,
  type: String,
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
const upcomingHeaders = [
  { title: 'Name', value: 'name' },
  { title: 'Game Title', value: 'game_title' },
  { title: 'Song Title', value: 'song_title' },
  { title: 'Difficulty', value: 'difficulty' },
  { title: 'Duration', filterable: false },
]
const sortBy = [{ key: 'id', order: 'desc' }] // 新しい大会が上に来るように

const searchText = ref('')

const tableLoading = ref(true)

const compTableName = 'tournaments'

async function getComps() {
  const currentDate = new Date().toISOString()
  let query = supabase.from(compTableName).select()

  if (props.type === 'upcoming') {
    query = query.gt('open_since', currentDate)
  } else if (props.type === 'closed') {
    query = query.lt('open_until', currentDate)
  } else {
    query = query.gt('open_until', currentDate).lte('open_since', currentDate)
  }

  const { data } = await query
  comps.value = data
  tableLoading.value = false
}

onMounted(() => {
  getComps()
})
</script>

<style>
@media screen and (max-width: 600px) {
  .comp-table {
    max-width: 92vw;
  }

  .comp-table td {
    width: 100%;
  }
}

@media screen and (min-width: 960px) {
  .comp-table {
    min-width: 780px;
  }

  .table-td-name {
    width: 200px;
    max-width: 220px;
  }

  .table-td-song-title {
    width: 200px;
    max-width: 250px;
  }
}
</style>