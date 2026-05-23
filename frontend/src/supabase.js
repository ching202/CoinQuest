import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wkosszjasogusmogumcj.supabase.co'
const supabaseKey = 'sb_publishable_7HZuWG58ZsgjbXHsBEtFpA_AUeCnCSg'

export const supabase = createClient(supabaseUrl, supabaseKey)