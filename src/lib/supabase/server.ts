// src/lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Ensure these environment variables are configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
}

// This is for Server Actions and direct server-side calls
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// This is for Server Components and Route Handlers that need to read/write cookies
export async function createServerSupabaseClient() {
    const cookieStore = await Promise.resolve(cookies()) // Await the result of cookies()

    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
            // Use the new getAll and setAll methods for cookie management
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            },
        },
    })
}
