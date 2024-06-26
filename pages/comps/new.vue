<template>
  <v-container fluid>
    <div class="text-center">
      <div class="text-h3 my-4 mb-6">新しく大会を作る</div>
      <div class="text-body-1 my-4 mb-6">必要な情報を入力してください。</div>
    </div>
    <div>
      <v-alert
        type="success"
        title="大会を作成しました"
        v-model="compCreated"
        class="my-6"
        closable
      >
        大会が正常に作成されました。
      </v-alert>
    </div>
    <div class="my-2">
      <v-sheet class="pa-2 comp-form" border rounded>
        <v-form @submit.prevent="createNewComp" ref="form">
          <h2 class="ma-2">基本設定</h2>
          <v-text-field
            v-model="compName"
            label="Name"
            hint="大会の名前を入力してください。"
            :rules="nameRules"
            :counter="25"
          ></v-text-field>
          <v-textarea
            v-model="desc"
            label="Description"
            hint="大会の説明文を入力してください。"
            :rules="descriptionRules"
            :counter="140"
          ></v-textarea>
          <v-combobox
            v-model="gameTitle"
            label="Game Title"
            hint="大会で使うゲームの名前を入力してください。"
            :rules="gameTitleRules"
            :items="getGameTitles()"
          ></v-combobox>
          <v-text-field
            v-model="songTitle"
            label="Song Title"
            hint="大会で使う楽曲のタイトルを入力してください。"
            :rules="[required]"
          ></v-text-field>
          <v-text-field
            v-model="difficulty"
            label="Difficulty"
            hint="大会で使う楽曲の難易度を入力してください。"
            :rules="[required]"
          ></v-text-field>

          <v-row>
            <v-col>
              <v-text-field
                v-model="openUntilDate"
                label="Open Until"
                hint="大会のスコア登録期限"
                :rules="dateRules"
                type="date"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                v-model="openUntilTime"
                label="Time"
                suffix="JST"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="mb-4"></v-divider>
          <v-expansion-panels multiple>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-tune-variant" class="mr-2"></v-icon>オプション
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-switch label="大会の開始日時を指定する" v-model="manualOpenSince" color="primary" class="mb-n6"></v-switch>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="openSinceDate"
                      label="Open On"
                      hint="大会のスコア登録開始日時"
                      :rules="startDateRules"
                      type="date"
                      :disabled="!manualOpenSince"
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="openSinceTime"
                      label="Time"
                      suffix="JST"
                      type="time"
                      :disabled="!manualOpenSince"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-switch label="スコアのソートを昇順にする" v-model="useAscOrder" color="primary" class="mb-n2"></v-switch>

                <v-switch label="他プレイヤーのスコアを非表示にする" v-model="hiddenLeaderboard" color="primary" class="mb-n2"></v-switch>

                <v-switch label="プライベート大会にする" v-model="isPrivate" color="primary"></v-switch>
                <v-text-field
                  v-model="passwd"
                  label="Password"
                  hint="スコア提出時に必要となります。"
                  :rules="passRules"
                  :append-icon="showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPasswd ? 'text' : 'password'"
                  @click:append="showPasswd = !showPasswd"
                  prepend-icon="mdi-key"
                  counter
                  v-show="isPrivate"
                ></v-text-field>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                <v-icon icon="mdi-flask" class="mr-2"></v-icon>試験的な機能
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <h3 class="ma-1 mb-4">beatmania IIDX</h3>
                <v-text-field
                  v-model="bmNotesCount"
                  label="Notes Count"
                  hint="大会で使用する譜面のノーツ数を入力してください。"
                  type="number"
                ></v-text-field>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-btn
            class="mt-4 font-weight-bold"
            text="大会を作成する"
            type="submit"
            color="red"
            size="large"
            prepend-icon="mdi-earth"
            :disabled="processing"
            :loading="processing"
            block
          ></v-btn>
        </v-form>
      </v-sheet>
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
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const form = ref(null)
const compName = ref("")
const desc = ref("")
const gameTitle = ref(null)
const songTitle = ref("")
const difficulty = ref("")
const openUntilDate = ref()
const openUntilTime = ref("00:00:00")
const manualOpenSince = ref(false)
const openSinceDate = ref(null)
const openSinceTime = ref("00:00:00")
const useAscOrder = ref(false)
const hiddenLeaderboard = ref(false)
const isPrivate = ref(false)
const passwd = ref("")
const showPasswd = ref(false)

// --- extra params ----

const bmNotesCount = ref(null)

// ----

const compCreated = ref(false)
const badRequest = ref(false)

/** 大会作成処理中にボタンを無効化する用フラグ */
const processing = ref(false)

const required = (value) => validateNotEmpty(value)

const nameRules = [
  required,
  (value) => validateLength(value, 25)
]

const descriptionRules = [
  (value) => validateLength(value, 140)
]

const gameTitleRules = [
  (value) => {
    // Comboboxは空のときnullになる
    if (value == null) {
      return 'この項目は必須です。'
    }
    return true
  }
]

const passRules = [
  (value) => validateLength(value, 50),
  (value) => {
    if (isPrivate.value && value.length == 0) {
      return 'パスワードを入力してください。'
    }
    return true
  }
]

const dateRules = [
  (value) => {
    // 有効な日付であることを検証する
    const preudoTimestamp = value + "T" + openUntilTime.value + "+09:00"
    const d = new Date(preudoTimestamp)

    if (d.toString() === "Invalid Date") {
      return '有効な日付を入力してください。'
    }

    const currentDate = new Date()

    if (d < currentDate) {
      return '過去の日付は指定できません。'
    }
    
    return true
  }
]

const startDateRules = [
  (value) => {
    if (!manualOpenSince.value) return true

    // 有効な日付であることを検証する
    const timestamp = value + "T" + openSinceTime.value + "+09:00"
    const d = new Date(timestamp)

    if (!validateDateAndTime(value, openSinceTime.value)) {
      return '有効な日付を入力してください。'
    }

    const currentDate = new Date()

    if (d < currentDate) {
      return '過去の日付は指定できません。'
    }

    if (validateDateAndTime(openUntilDate.value, openUntilTime.value) && d >= new Date(openUntilDate.value + "T" + openUntilTime.value + "+09:00")) {
      return '開始日時は終了日時より前に設定してください。'
    }

    return true
  },
]

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** 大会を新規作成する */
async function createNewComp() {
  // 入力のバリデーション
  const { valid } = await form.value.validate()
  if (!valid) {
    badRequest.value = true
    return
  }

  // 日付のバリデーション
  const openUntilTimestamp = openUntilDate.value + "T" + openUntilTime.value + "+09:00"
  if (!validateTimestamp(openUntilTimestamp)) {
    badRequest.value = true
    return
  }

  const user = await getUser()
  // ログインチェック
  if (user == null) {
    await nagivateTo('/login')
    return
  }

  processing.value = true

  let digest = ''
  if (isPrivate.value) digest = await calcHash(passwd.value)

  const extraParams = {}

  if (gameTitle.value.startsWith('beatmania IIDX') && bmNotesCount.value) {
    extraParams.bm = {}
    extraParams.bm.notes = bmNotesCount.value
  }

  const body = {
    name: compName.value,
    desc: desc.value,
    game_title: gameTitle.value,
    song_title: songTitle.value,
    difficulty: difficulty.value,
    open_until: openUntilTimestamp,
    passwd: digest,
    created_by: user.id,
    asc_order: useAscOrder.value,
    score_visible: !hiddenLeaderboard.value,
    extra_params: extraParams,
  }
  if (manualOpenSince.value) {
    const startTimestamp = openSinceDate.value + "T" + openSinceTime.value + "+09:00"
    body.open_since = startTimestamp
  }
  
  const { error } = await supabase.from('tournaments')
    .insert(body)
  
  if (error == null) {
    compCreated.value = true
  }
  processing.value = false
}

/** 日付が有効であることを検証する */
function validateTimestamp(timestamp) {
  const d = new Date(timestamp)
  const currentDate = new Date()
  return d.toString() !== "Invalid Date" && d > currentDate
}

definePageMeta({
  middleware: ['auth'],
})
</script>

<style>
@media screen and (min-width: 600px) {
  .comp-form {
    min-width: 500px;
    width: 500px;
  }
}
</style>