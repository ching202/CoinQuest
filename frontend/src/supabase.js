import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkosszjasogusmogumcj.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7HZuWG58ZsgjbXHsBEtFpA_AUeCnCSg'

export const supabase = createClient(supabaseUrl, supabaseKey)
