// src/actions/auth.ts
"use server"

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"

const loginSchema = z.object({
    email: z.string().email("Email inválido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
})

export async function signIn(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validation = loginSchema.safeParse({ email, password })

    if (!validation.success) {
        return {
            success: false,
            message: "Error de validación",
            errors: validation.error.flatten().fieldErrors,
        }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Supabase Sign-in Error:", error.message)
        return {
            success: false,
            message: error.message || "Credenciales inválidas.",
            errors: null,
        }
    }

    redirect("/admin") // Redirect to /admin after successful login
}

export async function signOut() {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error("Supabase Sign-out Error:", error.message)
        return { success: false, message: error.message }
    }

    redirect("/admin/login") // Redirect to /admin/login after logout
    return { success: true, message: "Sesión cerrada exitosamente." }
}

export async function getUser() {
    const supabase = await createServerSupabaseClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}
