import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient(runtimeConfig.public.supabaseURL, runtimeConfig.public.anonKey)

  const isCompExists = async () => {
    const compId = to.params.id
    const { data, error } = await supabase
      .from('tournaments')
      .select('id')
      .eq('id', compId)
    
    if (!data || data.length == 0) {
      return false
    }
    return true
  }

  if (!await isCompExists()) {
    return abortNavigation()
  }
})
