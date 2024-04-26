import { createClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

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

  /** 大会が現在開催されているかどうか検証する */
  const isCompActive = async () => {
    const compId = to.params.id
    const { data, error } = await supabase
      .from('tournaments')
      .select('open_since,open_until')
      .eq('id', compId)
      .limit(1)
      .single()
    
    if (error || !data) {
      return false
    }

    return isCompOpen(data.open_since, data.open_until)
  } 

  if (!await isCompExists()) {
    return abortNavigation()
  } else if (!await isCompActive()) {
    return abortNavigation()
  }
})
