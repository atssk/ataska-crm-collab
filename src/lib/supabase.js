import { createClient } from '@supabase/supabase-js'
import { mockClient } from './mockBackend'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Frontend-only mode: when there is no real Supabase URL (or it's the
// placeholder), use the in-memory mock backend so the UI works offline.
// Set real VITE_SUPABASE_* values in .env.local to switch to the real backend.
const useMock = !url || !key || /placeholder/i.test(url)

export const supabase = useMock ? mockClient : createClient(url, key)
