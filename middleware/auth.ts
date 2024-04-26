import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

  const isLoggedIn = async function() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return false
    }
    return true
  }

  if (!await isLoggedIn()) {
    return navigateTo('/login')
  }
})
