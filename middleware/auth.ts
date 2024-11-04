import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient(runtimeConfig.public.supabaseURL, runtimeConfig.public.anonKey)

  const isLoggedIn = async function() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return false
    }
    return true
  }

  // ログインチェックはクライアントで行う必要があるのでスキップ
  if (import.meta.server) return

  if (!await isLoggedIn()) {
    return navigateTo('/login')
  }
})
