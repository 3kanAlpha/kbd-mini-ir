<template>
  <v-container fluid>
    <div v-if="!isLoading && compInfo != null" class="text-center">
      <div class="text-h3 my-4">{{ compInfo.name }}</div>
      <div class="text-h6 ma-1">{{ compInfo.song_title }} [{{ compInfo.difficulty }}]</div>
      <div class="text-subtitle-2 ma-1">スコア登録期間: {{ formatTimestamp(compInfo.open_until) }} まで</div>

      <div>
        <v-alert
          type="error"
          title="Error"
          v-model="submitNotReady"
          class="my-6"
        >スコアを提出するにはログインしてから名前を設定してください。</v-alert>
        <v-alert
          type="error"
          title="終了済みの大会"
          v-model="compNotOpen"
          class="my-6"
        >スコア登録可能な期間を過ぎています。</v-alert>
        <v-alert
          type="success"
          title="スコアを提出しました"
          v-model="scoreUpdated"
          class="my-6"
          closable
        >スコアが正常に登録されました。</v-alert>
      </div>

      <div v-if="!submitNotReady && !compNotOpen">
        <div class="text-body-1 ma-4 mb-6">
          スコアとリザルト画像のURL（任意）を入力してください。<br />
          既に提出されているスコアがある場合は、自動的に更新されます。<br />
          一番最後に提出されたスコアが有効となります。
        </div>

        <div class="my-2">
          <v-sheet>
            <v-form @submit.prevent="updateScore">
              <v-text-field
                v-model="score"
                label="Score"
                :rules="scoreRules"
              ></v-text-field>
              <v-text-field
                v-model="imageUrl"
                label="Result Image URL"
                :rules="urlRules"
              ></v-text-field>
              <v-text-field
                v-model="comment"
                label="Comment"
                :rules="commentRules"
              ></v-text-field>

              <v-btn
                class="mt-2"
                text="スコアを提出する"
                type="submit"
                color="red"
                size="large"
                prepend-icon="mdi-upload"
                block
              ></v-btn>
            </v-form>
          </v-sheet>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/auth-js/src/lib/types'
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const compInfo: Ref<Comp | null> = ref(null)
const isLoading = ref(true)
const submitNotReady = ref(false)
const compNotOpen = ref(false)
const scoreUpdated = ref(false)

const userInfo: Ref<User | null> = ref(null)

const score = ref("")
const imageUrl = ref("")
const comment = ref("")

const scoreRules = [
  (value: string) => validateNotEmpty(value),
  (value: string) => {
    // 数値にパースできるか検証する
    let num = parseFloat(value)
    if (isNaN(num)) {
      return '有効な数値を入力してください。'
    }
    return true
  }
]

const urlRules = [
  (value: string) => {
    if (value.length == 0) {
      return true
    }

    // URLの形式か検証する
    try {
      let u = new URL(value)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return '有効なURLを入力してください。'
      }
    } catch (e) {
      return '有効なURLを入力してください。'
    }
    return true
  }
]

const commentRules = [
  (value: string) => validateLength(value, 25)
]

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data

  if (!isCompOpen(data.open_until)) {
    compNotOpen.value = true
  }
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  userInfo.value = user
  return user
}

/** ログインしているか検証する */
async function verifyCanSubmit() {
  const user = await getUser()
  if (user == null) {
    submitNotReady.value = true
    return
  }

  // const { data, error } = await supabase.from('users').select('nickname').eq('id', user.id).limit(1).single()
}

async function updateScore() {
  const parsedScore = parseFloat(score.value)
  if (isNaN(parsedScore)) {
    return
  }

  if (userInfo.value == null || compInfo.value == null) {
    return
  }

  const updatedAt = new Date().toISOString()

  const { data, error } = await supabase.from('score').upsert({
    user_uid: userInfo.value.id,
    tournament_id: compInfo.value.id,
    score: parsedScore,
    image_url: imageUrl.value,
    updated_at: updatedAt,
    comment: comment.value,
  })

  if (error == null) {
    scoreUpdated.value = true
  }
}

onMounted(() => {
  getCompInfo()
  verifyCanSubmit()
  isLoading.value = false
})

type Comp = {
  id: number
  created_at: string
  name: string
  desc: string
  game_title: string
  song_title: string
  difficulty: string
  open_until: string
  passwd: string
  created_by: string
}
</script>