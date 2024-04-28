import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  // 通常のページへのアクセスは無視する
  if (!event.path.startsWith('/api')) return

  const query = getQuery(event)

  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient('https://zczqyrsjbntkitypaaww.supabase.co', runtimeConfig.public.anonKey)

  const jwt = query.token

  const { data: { user } } = await supabase.auth.getUser(jwt?.toString())
  if (user == null) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
})