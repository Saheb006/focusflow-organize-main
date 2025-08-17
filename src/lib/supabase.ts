import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          priority: 'low' | 'medium' | 'high' | 'urgent'
          color: string | null
          due_date: string | null
          due_time: string | null
          tags: string[]
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string | null
          due_date?: string | null
          due_time?: string | null
          tags?: string[]
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          color?: string | null
          due_date?: string | null
          due_time?: string | null
          tags?: string[]
          created_at?: string
          completed_at?: string | null
        }
      }
      sub_todos: {
        Row: {
          id: string
          todo_id: string
          title: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          todo_id: string
          title: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          todo_id?: string
          title?: string
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Utility function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         supabaseUrl.includes('supabase.co')
}

// Error handling utility
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error)
  
  if (error?.code === 'PGRST116') {
    return new Error('Database table not found. Please check your Supabase setup.')
  }
  
  if (error?.code === '42501') {
    return new Error('Permission denied. Please check your Row Level Security policies.')
  }
  
  if (error?.message?.includes('JWT')) {
    return new Error('Authentication error. Please sign in again.')
  }
  
  return new Error(`Database error: ${error?.message || 'Unknown error occurred'}`)
}
