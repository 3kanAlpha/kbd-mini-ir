<template>
  <v-container fluid>
    <div v-if="!isLoading && compInfo != null" class="text-center">
      <div class="text-h3 my-4">{{ compInfo.name }}</div>
      <div class="text-h6 ma-1">{{ compInfo.song_title }} [{{ compInfo.difficulty }}]</div>
      <div class="text-subtitle-2 ma-1">
        スコア登録期間: {{ formatTimestamp(compInfo.open_since) }} - {{ formatTimestamp(compInfo.open_until) }}
      </div>

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
          <p class="mb-2">スコアを提出するには、以下のフォームに必要な情報を入力してください。<br />
          リザルト画像の提出は任意です。</p>
          <p>既に提出されているスコアがある場合は、自動的に更新されます。<br />
          一番最後に提出されたスコアが有効となります。</p>
        </div>

        <div class="text-body-2 mb-6" v-if="isPrivate">
          <p v-if="hasScore">この大会はプライベート大会です。</p>
          <p v-else>
            この大会はプライベート大会です。<br />
            スコアを提出するにはパスワードが必要です。
          </p>
        </div>

        <div class="my-2 mb-6 mx-auto" style="max-width: 500px;">
          <v-sheet class="pa-2 text-left">
            <v-form @submit.prevent="updateScore" ref="form">
              <v-text-field
                v-model="score"
                label="Score"
                :rules="scoreRules"
              ></v-text-field>

              <v-switch
                v-model="useExternalImage"
                label="アップロード済みの画像を使う"
                hide-details
              ></v-switch>

              <div v-if="!useExternalImage">
                <v-file-input
                  :class="{ 'mb-n2': previewSrc.length > 0 }"
                  v-model="imageFiles"
                  :rules="imageFilesRules"
                  accept="image/*"
                  label="Result Image"
                  show-size
                ></v-file-input>
                <v-img
                  v-if="previewSrc.length > 0"
                  id="preview-image"
                  :src="previewSrc"
                  :width="300"
                  height="auto"
                  class="mx-auto mb-4"
                ></v-img>
              </div>
              <v-text-field
                v-else
                v-model="imageUrl"
                label="Result Image URL"
                hint="リザルト画像のURLを入力してください。（任意）"
                :rules="urlRules"
                prepend-icon="mdi-web"
              ></v-text-field>

              <v-text-field
                v-model="comment"
                label="Comment"
                hint="コメントを入力してください。（任意）"
                :rules="commentRules"
                :counter="25"
              ></v-text-field>

              <v-row v-show="isPrivate && !hasScore">
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

              <v-divider class="mb-4"></v-divider>
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>リザルト画像提出時の注意事項
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="mb-2">
                      提出された画像データは、運営上の都合で将来的に<span class="font-weight-bold">削除される可能性があります</span>。<br />
                      あらかじめご了承ください。
                    </p>
                    <p>
                      画像提出時のデータ圧縮機能が未実装であるため、もし余裕がある場合は手動で画像をリサイズしてから提出していただけると助かります。
                    </p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-btn
                class="mt-4 font-weight-bold"
                text="スコアを提出する"
                type="submit"
                color="red"
                size="large"
                prepend-icon="mdi-upload"
                :disabled="uploading"
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
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import type { User } from '@supabase/auth-js/src/lib/types'
import type { VForm } from 'vuetify/components'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const bucketName = 'irmania'
const s3 = new S3Client({
  region: 'auto',
  endpoint: runtimeConfig.public.s3Endpoint,
  credentials: {
    accessKeyId: runtimeConfig.public.s3AccessKey,
    secretAccessKey: runtimeConfig.public.s3Secret,
  }
})
const publicDomain = 'https://irpics.mgcup.net/'

/** 大会情報 */
const compInfo: Ref<Comp | null> = ref(null)
const isLoading = ref(true)
const submitNotReady = ref(false)
const compNotOpen = ref(false)
const scoreUpdated = ref(false)
const badRequest = ref(false)
const wrongPass = ref(false)

/** ユーザーの認証情報 */
const userInfo: Ref<User | null> = ref(null)

// フォーム用変数
const form: Ref<VForm | null> = ref(null)
const score = ref("")
const imageUrl = ref("")
const imageFiles: Ref<File[]> = ref([])
const comment = ref("")

const useExternalImage = ref(false)
const previewSrc = ref("")

const isPrivate  = ref(false)
const passwd = ref("")
const showPasswd = ref(false)

const hasScore = ref(false)

/** スコア提出処理中にボタンを無効にするフラグ */
const uploading = ref(false)

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
    if (!useExternalImage.value || value.length == 0) {
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

const imageFilesRules = [
  (value: File[]) => {
    if (useExternalImage.value || !value || !value.length || value[0].size <= 5000000) {
      return true
    }
    return '画像ファイルのサイズは5MB以下にしてください。'
  }
]

const commentRules = [
  (value: string) => validateLength(value, 25)
]

const passRules = [
  (value: string) => {
    return (isPrivate.value && !hasScore.value) ? validateNotEmpty(value) : true
  },
  (value: string) => validateLength(value, 50),
]

async function getCompInfo() {
  const { data } = await supabase.from('tournaments').select('*').eq('id', route.params.id).limit(1).single()
  compInfo.value = data

  if (!isCompOpen(data.open_since, data.open_until)) {
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

  if (isPrivate.value && !hasScore.value) {
    const digest = await calcHash(passwd.value)
    const actualDigest = compInfo.value.passwd
    if (digest !== actualDigest) {
      wrongPass.value = true
      return
    }
  }

  uploading.value = true

  // 以前のリザルト画像を削除する
  await deleteOldImageIfExists()

  let iu = imageUrl.value
  if (!useExternalImage.value) {
    iu = await uploadImage()
  }

  const parsedScore = parseFloat(score.value)
  const updatedAt = new Date().toISOString()

  const { data, error } = await supabase.from('score').upsert({
    user_uid: userInfo.value.id,
    tournament_id: compInfo.value.id,
    score: parsedScore,
    image_url: iu,
    updated_at: updatedAt,
    comment: comment.value,
  })

  if (error == null) {
    scoreUpdated.value = true
  }
  uploading.value = false
}

async function uploadImage() {
  if (!compInfo.value || !userInfo.value || !imageFiles.value.length) {
    return ""
  }

  const imgExt = getFileExt(imageFiles.value[0].name)
  const shortUUID = shortenUUID(userInfo.value.id)
  const randomStr = generateRandomString(8)
  const fileKey = `comp-${compInfo.value.id}/${shortUUID}_${randomStr}.${imgExt}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: imageFiles.value[0],
    ContentType: imageFiles.value[0].type,
  })

  try {
    const response = await s3.send(command);
    return publicDomain + fileKey
  } catch (err) {
    console.error(err);
  }

  return ""
}

/** 古いリザルト画像をバケットから削除する */
async function deleteOldImageIfExists() {
  if (!compInfo.value || !userInfo.value) {
    return
  }

  const { data: score, error } = await supabase
    .from('score')
    .select('image_url')
    .eq('user_uid', userInfo.value.id)
    .eq('tournament_id', compInfo.value.id)
    .limit(1)
    .single()
  
  if (score != null) {
    // 外部サイトのURLの場合は削除しない
    if (score.image_url.startsWith(publicDomain)) {
      const oldKey = score.image_url.replace(publicDomain, '')
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: oldKey,
      })

      try {
        await s3.send(command)
      } catch (err) {
        console.error(err)
      }
    }
  }
}

async function checkHasScore() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return
  }

  const { count, error } = await supabase
    .from('score')
    .select('id', { count: 'exact', head: true })
    .eq('user_uid', user.id)
    .eq('tournament_id', route.params.id)
  
  if (count) {
    hasScore.value = true
  }
}

onMounted(() => {
  getCompInfo()
  verifyCanSubmit()

  nextTick(() => {
    checkHasScore()
    isLoading.value = false
  })
})

onUnmounted(() => {
  if (previewSrc.value.length > 0) {
    URL.revokeObjectURL(previewSrc.value)
  }
})

watch(imageFiles, (newFiles) => {
  const oldSrc = previewSrc.value

  if (newFiles.length) {
    previewSrc.value = URL.createObjectURL(newFiles[0])
  } else {
    previewSrc.value = ""
  }

  // 古いblobを解放する
  if (oldSrc.length > 0) {
    URL.revokeObjectURL(oldSrc)
  }
})

definePageMeta({
  middleware: ['auth', 'can-submit'],
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
  asc_order: boolean
  score_visible: boolean
  open_since: string
}
</script>