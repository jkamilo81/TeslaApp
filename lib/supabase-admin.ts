import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Service-role client that bypasses RLS. Server-side only — never import
 * this from client components. Callers are responsible for authorization.
 */
export function createAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
