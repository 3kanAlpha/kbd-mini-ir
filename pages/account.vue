<template>
  <v-container fluid>
    <div class="text-center">
      <div class="text-h4 text-sm-h3 ma-6">アカウント設定</div>
      <div class="text-left">
        <v-alert
          v-model="nameNotSet"
          title="プレイヤー名未設定"
          type="warning"
          class="my-6"
        >
          プレイヤー名が設定されていません。
        </v-alert>
        <v-alert
          v-model="updateAlert"
          title="Success!"
          type="success"
          class="my-4 mb-6"
          closable
        >
          アカウント情報の更新に成功しました。
        </v-alert>
      </div>
      <div class="text-body-1 ma-2 mb-6">プロフィールを編集できます。</div>
      <div class="ma-2">
        <v-sheet class="pa-2">
          <v-form @submit.prevent="updateProfile" ref="form">
            <v-text-field
              v-model="userName"
              label="Player Name"
              hint="ランキング上で表示される名前です。"
              :rules="nameRules"
              :counter="12"
            ></v-text-field>

            <v-btn
              class="mt-2 font-weight-bold"
              text="プロフィールを更新する"
              type="submit"
              color="pink-accent-2"
              size="large"
              prepend-icon="mdi-update"
              block
            ></v-btn>
          </v-form>
        </v-sheet>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
import type { VForm } from 'vuetify/components'
const runtimeConfig = useRuntimeConfig()

const supabase = createClient(runtimeConfig.public.supabaseURL, runtimeConfig.public.anonKey)

const form: Ref<VForm | null> = ref(null)
const userName = ref("")
const updateAlert = ref(false)

const defaultName = 'No Name'
const nameNotSet = ref(false)

const nameRules = [
  (value: string) => {
    if (value.trim().length < 1) {
      return '名前を空白にすることはできません。'
    }
    return true
  },
  (value: string) => validateLength(value, 12)
]

async function updateProfile() {
  if (form.value == null) {
    return
  }

  const trimmedName = userName.value.trim()
  const { valid } = await form.value.validate()
  if (!valid) {
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (user == null) {
    await navigateTo('/login')
    return
  }

  const userUID = user?.id

  const { data, error } = await supabase.from('users').upsert({
    user_uid: userUID,
    nickname: trimmedName,
  })

  if (error == null) {
    nameNotSet.value = false
    updateAlert.value = true
  }
}

/** プレイヤー名が設定されているかどうか確認する */
async function checkIfPlayerHasName() {
  const { data: { user } } = await supabase.auth.getUser()

  if (user != null) {
    const userUID = user.id
    const { data, error } = await supabase
      .from('users')
      .select('nickname')
      .eq('user_uid', userUID)
      .maybeSingle()
    
    if (data != null && data.nickname === defaultName) {
      nameNotSet.value = true
    }
  }
}

onMounted(() => {
  checkIfPlayerHasName()
})

definePageMeta({
  middleware: ['auth'],
})
</script>