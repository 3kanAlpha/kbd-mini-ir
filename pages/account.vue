<template>
  <v-container fluid>
    <div class="text-center">
      <div class="text-h3 ma-6">アカウント情報</div>
      <div>
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
      <div class="text-body-1 ma-2 mb-6">ランキングに表示される名前を変更できます。</div>
      <div class="ma-2">
        <v-sheet>
          <v-form @submit.prevent="updateProfile">
            <v-text-field
              v-model="userName"
              label="Nickname"
              :rules="nameRules"
            ></v-text-field>

            <v-btn
              class="mt-2"
              text="Update Profile"
              type="submit"
              color="blue"
              block
            ></v-btn>
          </v-form>
        </v-sheet>
      </div>
      <div class="mt-4">
        <v-container>
          <v-row>
            <v-col>
              <v-btn prepend-icon="mdi-logout" color="red" size="large" @click="signOut">Logout</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()

const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

const userName = ref("")
const updateAlert = ref(false)

const nameRules = [
  (value: String) => {
    if (value.length < 1) {
      return '名前を空白にすることはできません。'
    }
    return true
  }
]

async function signOut() {
  const { error } = await supabase.auth.signOut()
  await navigateTo('/')
}

async function updateProfile() {
  if (userName.value.length < 1) {
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (user == null) {
    await navigateTo('/login')
  }

  const userUID = user?.id

  const { data, error } = await supabase.from('users').upsert({
    user_uid: userUID,
    nickname: userName.value,
  })

  if (error == null) {
    updateAlert.value = true
  }
}
</script>