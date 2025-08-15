"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Patient {
    id: string
    rut: string
    name?: string
    email?: string
    phone?: string
    created_at: string
    updated_at: string
}

export interface CreatePatientData {
    rut: string
    name?: string
    email?: string
    phone?: string
}

export interface UpdatePatientData {
    name?: string
    email?: string
    phone?: string
}

export async function getPatients(): Promise<Patient[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching patients:", error)
        throw new Error("Error al obtener pacientes")
    }

    return data || []
}

export async function getPatientByRut(rut: string): Promise<Patient | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.from("patients").select("*").eq("rut", rut).single()

    if (error) {
        if (error.code === "PGRST116") {
            return null // No encontrado
        }
        console.error("Error fetching patient by RUT:", error)
        throw new Error("Error al buscar paciente")
    }

    return data
}

export async function createPatient(patientData: CreatePatientData): Promise<Patient> {
    const supabase = await createServerSupabaseClient()

    // Verificar si el RUT ya existe
    const existingPatient = await getPatientByRut(patientData.rut)
    if (existingPatient) {
        throw new Error("Ya existe un paciente con este RUT")
    }

    const { data, error } = await supabase
        .from("patients")
        .insert([
            {
                rut: patientData.rut,
                name: patientData.name,
                email: patientData.email,
                phone: patientData.phone,
            },
        ])
        .select()
        .single()

    if (error) {
        console.error("Error creating patient:", error)
        throw new Error("Error al crear paciente")
    }

    revalidatePath("/admin")
    return data
}

export async function updatePatient(id: string, patientData: UpdatePatientData): Promise<Patient> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("patients")
        .update({
            ...patientData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating patient:", error)
        throw new Error("Error al actualizar paciente")
    }

    revalidatePath("/admin")
    return data
}

export async function deletePatient(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("patients").delete().eq("id", id)

    if (error) {
        console.error("Error deleting patient:", error)
        throw new Error("Error al eliminar paciente")
    }

    revalidatePath("/admin")
}

export async function searchPatients(query: string): Promise<Patient[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("patients")
        .select("*")
        .or(`rut.ilike.%${query}%,name.ilike.%${query}%`)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error searching patients:", error)
        throw new Error("Error al buscar pacientes")
    }

    return data || []
}
