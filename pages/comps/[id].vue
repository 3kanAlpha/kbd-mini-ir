<template>
  <v-container fluid>
    <div v-if="!isLoading && compInfo != null" class="text-center">
      <div v-if="isPortraitMobile">
        <h2 class="my-2">{{ compInfo.name }}</h2>
        <h4 class="mb-2">{{ compInfo.song_title }}<br />[{{ compInfo.difficulty }}]</h4>
        <div class="text-subtitle-2 ma-1">
          スコア登録期間<br />{{ formatTimestamp(compInfo.open_since) }} - {{ formatTimestamp(compInfo.open_until) }} 
          <span v-if="isCompClosed(compInfo.open_until)">(開催終了)</span>
          <span v-else-if="isCompUpcoming(compInfo.open_since)">(開催予定)</span>
        </div>

        <v-row v-if="isPrivate || hiddenLeaderboard || frozenLeaderboard" style="max-width: 300px;" class="mx-auto mb-4">
          <v-col v-if="isPrivate">
            <v-chip color="orange" size="small">
              <v-icon icon="mdi-key-variant" start></v-icon>
              プライベート
            </v-chip>
          </v-col>
          <v-col v-if="hiddenLeaderboard">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" color="deep-purple-accent-2" size="small">
                  <v-icon icon="mdi-eye-off" start></v-icon>
                  他人のスコア非表示
                </v-chip>
              </template>
              <span>大会が終了するまで他プレイヤーのスコアが非表示になります</span>
            </v-tooltip>
          </v-col>
          <v-col v-if="frozenLeaderboard">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" color="pink-accent-2" size="small">
                  <v-icon icon="mdi-lock" start></v-icon>
                  順位表ロック
                </v-chip>
              </template>
              <span>大会終了直前のため、一時的にスコアが非表示となっています</span>
            </v-tooltip>
          </v-col>
        </v-row>

        <div class="text-body-2 my-4 mb-6" style="white-space: pre-wrap;">{{ compInfo.desc }}</div>
      </div>
      <div v-else>
        <div class="text-h3 my-4">{{ compInfo.name }}</div>
        <div class="text-h6 ma-1">{{ compInfo.song_title }} [{{ compInfo.difficulty }}]</div>
        <div class="text-subtitle-2 ma-1">
          スコア登録期間: {{ formatTimestamp(compInfo.open_since) }} - {{ formatTimestamp(compInfo.open_until) }} 
          <span v-if="isCompClosed(compInfo.open_until)">(開催終了)</span>
          <span v-else-if="isCompUpcoming(compInfo.open_since)">(開催予定)</span>
        </div>

        <v-row v-if="isPrivate || hiddenLeaderboard || frozenLeaderboard" style="max-width: 300px;" class="mx-auto mb-4">
          <v-col v-if="isPrivate">
            <v-chip color="orange" size="small">
              <v-icon icon="mdi-key-variant" start></v-icon>
              プライベート
            </v-chip>
          </v-col>
          <v-col v-if="hiddenLeaderboard">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" color="deep-purple-accent-2" size="small">
                  <v-icon icon="mdi-eye-off" start></v-icon>
                  他人のスコア非表示
                </v-chip>
              </template>
              <span>大会が終了するまで他プレイヤーのスコアが非表示になります</span>
            </v-tooltip>
          </v-col>
          <v-col v-if="frozenLeaderboard">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" color="pink-accent-2" size="small">
                  <v-icon icon="mdi-lock" start></v-icon>
                  順位表ロック
                </v-chip>
              </template>
              <span>大会終了直前のため、一時的にスコアが非表示となっています</span>
            </v-tooltip>
          </v-col>
        </v-row>

        <div class="text-body-1 my-4 mb-6" style="white-space: pre-wrap;">{{ compInfo.desc }}</div>
      </div>
      
      <div v-if="(isLoggedIn && isCompOpen(compInfo.open_since, compInfo.open_until)) || canDelete" class="my-4">
        <div style="max-width: 500px;" class="mx-auto">
          <v-row>
            <v-col v-if="isCompOpen(compInfo.open_since, compInfo.open_until)">
              <v-btn size="large" :to="submissionPageUrl" color="blue" prepend-icon="mdi-pencil-box">スコア提出</v-btn>
            </v-col>
            <v-col v-if="canDelete">
              <v-btn size="large" color="red" prepend-icon="mdi-calendar-remove" @click="deleteDialog = true">大会を削除する</v-btn>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="text-left">
        <v-data-table :items="scoreInfo" :headers="headers" item-key="user_uid" :loading="scoreLoading" :items-per-page="50">
          <template v-slot:item="{ item }">
            <tr>
              <td data-label="Rank">
                <div :class="{ 'text-center': !isPortraitMobile }">
                  <div v-if="cantSeeScore">?</div>
                  <div v-else>
                    <div v-if="item.rank == 1"><v-icon icon="mdi-crown" color="amber"></v-icon></div>
                    <div v-else-if="item.rank == 2"><v-icon icon="mdi-crown" color="blue-grey-lighten-2"></v-icon></div>
                    <div v-else-if="item.rank == 3"><v-icon icon="mdi-crown" color="brown"></v-icon></div>
                    <div v-else>{{ item.rank }}</div>
                  </div>
                </div>
              </td>
              <td class="table-td-player-name" data-label="Player Name">
                <span :class="{ 'text-pink-accent-2': userInfo && userInfo.id === item.user_uid }">{{ item.users.nickname }}</span>
              </td>
              <td data-label="Score">
                <span v-if="'bm' in extraParams">{{ item.score }} <span style="font-size: 0.9em" class="text-blue-grey">/ {{ extraParams.bm.notes * 2 }} ({{ getScoreRate(item.score, extraParams.bm.notes) }}%)</span></span>
                <span v-else>{{ item.score }}</span>
              </td>
              <td data-label="Updated at">
                {{ formatTimestamp(item.updated_at) }}
              </td>
              <td data-label="Result Image">
                <div v-if="item.image_url">
                  <NuxtLink :to="item.image_url" target="_blank">クリックして表示</NuxtLink>
                </div>
              </td>
              <td class="table-td-comment" data-label="Comment">{{ item.comment }}</td>
            </tr>
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
      <v-img class="mx-auto" style="max-height: 70%; max-width: 65%; width: 1000px;" :src="previewImageUrl"></v-img>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient(runtimeConfig.public.supabaseURL, runtimeConfig.public.anonKey)
const compInfo = ref(null)
const extraParams = ref({})
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
const useAscOrder = ref(false)
const hiddenLeaderboard = ref(false)
const useAltRanking = ref(false)
const isPrivate = ref(false)

// ---- 順位表凍結機能 ----
const isObserver = ref(false)
const frozenLeaderboard = ref(false)
const cantSeeScore = computed(() => {
  return !isObserver.value && (hiddenLeaderboard.value || frozenLeaderboard.value)
})

const isLoggedIn = ref(false)
const canDelete = ref(false)
const deleteDialog = ref(false)

const previewImageDialog = ref(false)
const previewImageUrl = ref("")

const userInfo = ref(null)

const { isPortraitMobile } = useMobileDetector()

const submissionPageUrl = `/submit/${route.params.id}`

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data

  if (data.hide_score_hr > 0) {
    frozenLeaderboard.value = isScoreFrozen(data.open_until, data.hide_score_hr)
  }

  if (data.extra_params) {
    extraParams.value = data.extra_params
  }

  if (data.passwd.length > 0) {
    isPrivate.value = true
  }

  if (userInfo.value != null) {
    // ユーザーが作成した大会かどうかを確認
    if (userInfo.value.id === data.created_by) {
      canDelete.value = true
    }

    // 順位表凍結期間も、大会観戦者は順位表を見ることができる
    if (data.extra_params && 'observer' in data.extra_params) {
      const observers = data.extra_params.observer
      isObserver.value = observers.some((observer) => (observer === userInfo.value.id))
    }
  }
}

async function getScoreInfo() {
  await getCompSettings()

  let query = supabase
    .from('score')
    .select(`
      user_uid,
      score,
      updated_at,
      image_url,
      comment,
      users (nickname)`)
    .eq('tournament_id', route.params.id)

  if (cantSeeScore.value) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user != null) {
      query = query.eq('user_uid', user.id)
    } else {
      query = query.eq('user_uid', 'null')
    }
  } else {
    query = query.order('score', { ascending: useAscOrder.value }).order('updated_at', { ascending: true })
  }

  const { data: scoreData } = await query
  if (scoreData) {
    if (useAltRanking.value) appendRankAlt(scoreData)
    else appendRank(scoreData)
    scoreInfo.value = scoreData
  }
  scoreLoading.value = false
}

async function getCompSettings() {
  const { data } = await supabase.from('tournaments').select('asc_order,score_visible,open_until,alt_rank').eq('id', route.params.id).limit(1).single()
  useAscOrder.value = data.asc_order
  hiddenLeaderboard.value = !data.score_visible && !isCompClosed(data.open_until)
  useAltRanking.value = data.alt_rank
}

/** ユーザーが既にログイン済みかどうかを検証する */
async function setLoggedIn() {
  const { data: { user } } = await supabase.auth.getUser()
  userInfo.value = user
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

function shareToTwitter() {
  const pageURL = window.location.href
  const text = `${compInfo.value.name} #IRmania`
  const url = `https://twitter.com/intent/tweet?url=${pageURL}&text=${text}`

  window.open(url, '_blank')
}

async function initPage() {
  await setLoggedIn()
  await getCompInfo()
  getScoreInfo()
}

onMounted(() => {
  initPage()

  nextTick(() => {
    isLoading.value = false
  })
})

definePageMeta({
  middleware: ['is-exist'],
})
</script>

<style>
@media screen and (min-width: 960px) {
  .table-td-player-name {
    width: 120px;
    max-width: 160px;
  }

  .table-td-comment {
    width: 250px;
    max-width: 340px;
  }
}
</style>