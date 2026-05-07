import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yizwcblqyhvscpcyengy.supabase.co'
const supabaseKey = 'sb_publishable_13bph7D8n0qWzbNPGqOSGA_nzI6ZxAQ'

export const supabase = createClient(supabaseUrl, supabaseKey)