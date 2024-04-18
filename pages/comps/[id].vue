<template>
  <v-container fluid>
    <div v-if="!isLoading" class="text-center">
      <div class="text-h3 my-4">{{ compInfo.name }}</div>
      <div class="text-h6 ma-1">{{ compInfo.song_title }} [{{ compInfo.difficulty }}]</div>
      <div class="text-subtitle-2 ma-1">スコア登録期間: {{ formatTimestamp(compInfo.open_until) }} まで <span v-if="!isCompOpen(compInfo.open_until)">(開催終了)</span></div>

      <div class="text-body-1 ma-4" style="white-space: pre-wrap;">{{ compInfo.desc }}</div>

      <div v-if="(isLoggedIn && isCompOpen(compInfo.open_until)) || canDelete" class="my-4">
        <div style="max-width: 500px;" class="mx-auto">
          <v-row>
            <v-col v-if="isCompOpen(compInfo.open_until)">
              <v-btn size="large" :to="submissionPageUrl" color="blue" prepend-icon="mdi-pencil-box">スコア提出</v-btn>
            </v-col>
            <v-col v-if="canDelete">
              <v-btn size="large" color="red" prepend-icon="mdi-calendar-remove" @click="deleteDialog = true">大会を削除する</v-btn>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="text-left">
        <v-data-table :items="scoreInfo" :headers="headers" item-key="user_uid" v-model:sort-by="sortBy" multi-sort :loading="scoreLoading">
          <template v-slot:item.rank="{ item }">
            <div class="text-center">
              <div v-if="item.rank == 1"><v-icon icon="mdi-crown" color="amber"></v-icon></div>
              <div v-else-if="item.rank <= 3" class="font-weight-bold">{{ item.rank }}</div>
              <div v-else>{{ item.rank }}</div>
            </div>
          </template>
          <template v-slot:item.user_uid="{ item }">
            {{ item.users.nickname }}
          </template>
          <template v-slot:item.updated_at="{ item }">
            {{ formatTimestamp(item.updated_at) }}
          </template>
          <template v-slot:item.image_url="{ item }">
            <div v-if="getHostnameFromURL(item.image_url) === 'twitter.com' || getHostnameFromURL(item.image_url) === 'x.com'">
              <NuxtLink :to="item.image_url" target="_blank"><v-icon color="blue" :icon="SvgTwitter" size="x-small" class="mr-1"></v-icon>Twitter</NuxtLink>
            </div>
            <div v-else-if="getHostnameFromURL(item.image_url) === 'imgur.com'">
              <NuxtLink :to="item.image_url" target="_blank">imgur.com</NuxtLink><span class="text-caption text-blue-grey-lighten-1">（外部リンク）</span>
            </div>
            <div v-else-if="getHostnameFromURL(item.image_url) === 'irpics.mgcup.net'">
              <v-btn density="comfortable" variant="text" color="blue" @click="openPreviewDialog(item.image_url)">Click to preview</v-btn>
            </div>
            <div v-else>
              {{ item.image_url }}
            </div>
          </template>
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@1"></v-skeleton-loader>
          </template>
        </v-data-table>
      </div>
    </div>
    <v-dialog
      v-model="deleteDialog"
      width="auto"
    >
      <v-card
        max-width="700"
        prepend-icon="mdi-alert"
        title="警告"
        color="red-darken-4"
      >
        <v-card-text>本当に大会を削除しますか？<br />大会を削除した場合、この大会に登録されたスコアも同時に削除されます。<br />この操作は<span class="font-weight-bold">取り消すことができません</span>。</v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>

          <v-btn
            text="キャンセル"
            variant="outlined"
            @click="deleteDialog = false"
          ></v-btn>

          <v-btn
            text="削除"
            variant="flat"
            color="white text-red-darken-4 font-weight-bold"
            @click="deleteComp"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-overlay
      v-model="previewImageDialog"
      class="align-center justify-center"
      width="auto"
    >
      <v-img style="max-height: 75%;" :width="1000" :src="previewImageUrl"></v-img>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
import SvgTwitter from '~/components/svg/SvgTwitter.vue';
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const compInfo = ref(null)
const scoreInfo = ref([])
const scoreLoading = ref(true)
const isLoading = ref(true)
const headers = [
  { title: 'Rank', value: 'rank'},
  { title: 'Player Name', value: 'user_uid' },
  { title: 'Score', value: 'score' },
  { title: 'Updated at', value: 'updated_at' },
  { title: 'Result Image', value: 'image_url'},
  { title: 'Comment', value: 'comment' },
]
/** スコア降順、スコアが同じ場合提出が速い方が順位を上にする */
const sortBy = [{ key: 'score', order: 'desc' }, { key: 'updated_at', order: 'asc' }]

const isLoggedIn = ref(false)
const canDelete = ref(false)
const deleteDialog = ref(false)

const previewImageDialog = ref(false)
const previewImageUrl = ref("")

const submissionPageUrl = `/submit/${route.params.id}`

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data

  // ユーザーが作成した大会かどうかを確認
  const { data: { user } } = await supabase.auth.getUser()
  if (user != null && user.id === data.created_by) {
    canDelete.value = true
  }
}

async function getScoreInfo() {
  const { data } = await supabase
    .from('score')
    .select(`
      user_uid,
      score,
      updated_at,
      image_url,
      comment,
      users (nickname)`)
    .eq('tournament_id', route.params.id)
    .order('score', { ascending: false })
    .order('updated_at', { ascending: true })
  appendRank(data)
  scoreInfo.value = data
  scoreLoading.value = false
}

/** ユーザーが既にログイン済みかどうかを検証する */
async function setLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser()
  isLoggedIn.value = user != null
}

/** 大会を削除する */
async function deleteComp() {
  const { data: { user } } = await supabase.auth.getUser()

  if (user == null) {
    return
  }

  const uid = user.id

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', route.params.id)
    .eq('created_by', uid)
  
    if (error == null) {
      await navigateTo('/')
    }
}

function openPreviewDialog(image_url) {
  previewImageUrl.value = image_url
  previewImageDialog.value = true
}

onMounted(() => {
  getCompInfo()
  getScoreInfo()
  setLoggedIn()
  isLoading.value = false
})
</script>