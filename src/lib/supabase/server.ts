import { createClient } from "@supabase/supabase-js"

// Asegúrate de que estas variables de entorno estén configuradas
// NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
// son accesibles en el servidor y en el cliente si se usan en ambos.
// Para Server Actions, solo necesitamos que estén disponibles en el servidor.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)