"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface MedicalRecord {
    id: string
    patient_id: string
    session_date: string
    session_notes: string
    diagnosis?: string
    treatment?: string
    observations?: string
    created_at: string
    updated_at: string
    // Joined patient data
    patient?: {
        id: string
        rut: string
        name?: string
        email?: string
        phone?: string
    }
}

export interface CreateMedicalRecordData {
    patient_id: string
    session_date: string
    session_notes: string
    diagnosis?: string
    treatment?: string
    observations?: string
}

export interface UpdateMedicalRecordData {
    session_date?: string
    session_notes?: string
    diagnosis?: string
    treatment?: string
    observations?: string
}

export async function getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .eq("patient_id", patientId)
        .order("session_date", { ascending: false })

    if (error) {
        console.error("Error fetching medical records:", error)
        throw new Error("Error al obtener fichas médicas")
    }

    return data || []
}

export async function getAllMedicalRecords(): Promise<MedicalRecord[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .order("session_date", { ascending: false })

    if (error) {
        console.error("Error fetching all medical records:", error)
        throw new Error("Error al obtener fichas médicas")
    }

    return data || []
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord | null> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .eq("id", id)
        .single()

    if (error) {
        if (error.code === "PGRST116") {
            return null // No encontrado
        }
        console.error("Error fetching medical record:", error)
        throw new Error("Error al obtener ficha médica")
    }

    return data
}

export async function createMedicalRecord(recordData: CreateMedicalRecordData): Promise<MedicalRecord> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .insert([recordData])
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .single()

    if (error) {
        console.error("Error creating medical record:", error)
        throw new Error("Error al crear ficha médica")
    }

    revalidatePath("/admin")
    return data
}

export async function updateMedicalRecord(id: string, recordData: UpdateMedicalRecordData): Promise<MedicalRecord> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .update({
            ...recordData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .single()

    if (error) {
        console.error("Error updating medical record:", error)
        throw new Error("Error al actualizar ficha médica")
    }

    revalidatePath("/admin")
    return data
}

export async function deleteMedicalRecord(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("medical_records").delete().eq("id", id)

    if (error) {
        console.error("Error deleting medical record:", error)
        throw new Error("Error al eliminar ficha médica")
    }

    revalidatePath("/admin")
}

export async function getRecentMedicalRecords(limit = 10): Promise<MedicalRecord[]> {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
        .from("medical_records")
        .select(`
      *,
      patient:patients(id, rut, name, email, phone)
    `)
        .order("created_at", { ascending: false })
        .limit(limit)

    if (error) {
        console.error("Error fetching recent medical records:", error)
        throw new Error("Error al obtener fichas médicas recientes")
    }

    return data || []
}
