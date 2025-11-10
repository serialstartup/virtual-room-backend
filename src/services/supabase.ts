import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
  supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing',
  nodeEnv: process.env.NODE_ENV
})

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing'
  })
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const handleSupabaseError = (error: any, context?: string) => {
  console.error(`Supabase error${context ? ` in ${context}` : ''}:`, error)
  
  if (error?.message) {
    throw new Error(error.message)
  }
  
  throw new Error('Beklenmeyen bir hata oluştu')
}

export const validateUserId = (userId: string): void => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Geçersiz kullanıcı ID')
  }
}