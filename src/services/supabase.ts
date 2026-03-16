import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/configs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const supabaseAuth = supabase.auth
export const supabaseQuery = supabase
