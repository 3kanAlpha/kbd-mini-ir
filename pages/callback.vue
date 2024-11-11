<template>
  <v-container fluid>
    自動的に移動します……
  </v-container>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'
const runtimeConfig = useRuntimeConfig()
const supabase = createClient(runtimeConfig.public.supabaseURL, runtimeConfig.public.anonKey)

const defaultName = 'No Name'

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
      await navigateTo('/account')
      return
    }
  }

  await navigateTo('/')
}

onMounted(() => {
  checkIfPlayerHasName()
})
</script>