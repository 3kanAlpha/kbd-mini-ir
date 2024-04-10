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

        <div class="text-body-2 mb-6" v-if="isPrivate">
          この大会はプライベート大会です。<br />
          スコアを提出するにはパスワードが必要です。
        </div>

        <div class="my-2 mb-6">
          <v-sheet class="pa-2">
            <v-form @submit.prevent="updateScore" ref="form">
              <v-text-field
                v-model="score"
                label="Score"
                :rules="scoreRules"
              ></v-text-field>
              <v-text-field
                v-model="imageUrl"
                label="Result Image URL"
                hint="リザルト画像のURLを入力してください。（任意）"
                :rules="urlRules"
              ></v-text-field>
              <v-text-field
                v-model="comment"
                label="Comment"
                hint="コメントを入力してください。（任意）"
                :rules="commentRules"
                :counter="25"
              ></v-text-field>

              <v-row v-show="isPrivate">
                <v-col cols="4"><v-list-subheader>パスワード</v-list-subheader></v-col>
                <v-col cols="8">
                  <v-text-field
                    v-model="passwd"
                    label="Password"
                    :rules="passRules"
                    :append-icon="showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showPasswd ? 'text' : 'password'"
                    @click:append="showPasswd = !showPasswd"
                    counter
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-btn
                class="mt-2 font-weight-bold"
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
        <v-divider></v-divider>
        <div class="mt-6">
          <v-btn prepend-icon="mdi-arrow-u-left-bottom-bold" color="blue" rounded="xl" :to="compPageURL">
            大会トップに戻る
          </v-btn>
        </div>
      </div>
    </div>
    <v-dialog v-model="badRequest" width="auto">
      <v-card
        max-width="500"
        prepend-icon="mdi-alert-circle"
        text="入力の形式に誤りがあります。修正してください。"
        title="エラー"
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="badRequest = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-dialog v-model="wrongPass" width="auto">
      <v-card
        max-width="500"
        prepend-icon="mdi-alert-circle"
        text="パスワードが一致しません。"
        title="認証エラー"
      >
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="wrongPass = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/auth-js/src/lib/types'
import type { VForm } from 'vuetify/components'
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)
const compInfo: Ref<Comp | null> = ref(null)
const isLoading = ref(true)
const submitNotReady = ref(false)
const compNotOpen = ref(false)
const scoreUpdated = ref(false)
const badRequest = ref(false)
const wrongPass = ref(false)

const userInfo: Ref<User | null> = ref(null)

const form: Ref<VForm | null> = ref(null)
const score = ref("")
const imageUrl = ref("")
const comment = ref("")

const isPrivate  = ref(false)
const passwd = ref("")
const showPasswd = ref(false)

const compPageURL = `/comps/${route.params.id}`

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

const passRules = [
  (value: string) => {
    return isPrivate.value ? validateNotEmpty(value) : true
  },
  (value: string) => validateLength(value, 50),
]

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data

  if (!isCompOpen(data.open_until)) {
    compNotOpen.value = true
  }

  if (data.passwd.length > 0) {
    isPrivate.value = true
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
  if (form.value == null) {
    return
  }

  // 入力のバリデーション
  const { valid } = await form.value.validate()
  if (!valid) {
    badRequest.value = true
    return
  }

  if (userInfo.value == null || compInfo.value == null) {
    return
  }

  if (isPrivate.value) {
    const digest = await calcHash(passwd.value)
    const actualDigest = compInfo.value.passwd
    if (digest !== actualDigest) {
      wrongPass.value = true
      return
    }
  }

  const parsedScore = parseFloat(score.value)
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