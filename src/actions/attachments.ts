"use server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { z } from "zod"
import { deleteAttachmentSchema, fileSchema, preUploadAttachmentSchema } from "@/schemas/attachment"

export interface MedicalRecordAttachment {
    id: string
    medical_record_id: string
    file_name: string
    file_path: string
    file_size: number
    mime_type: string
    created_at: string
}

export interface UploadResult {
    success: boolean
    attachment?: MedicalRecordAttachment
    error?: string
}

// Upload file to Supabase Storage and create database record
export async function uploadAttachment(
    medicalRecordId: string,
    file: File,
    compressedFile?: File,
): Promise<UploadResult> {
    try {
        const supabase = await createServerSupabaseClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()
        console.log("[v0] Authentication check:", {
            user: user ? { id: user.id, email: user.email } : null,
            authError: authError?.message,
        })

        if (!user) {
            return {
                success: false,
                error: "Usuario no autenticado",
            }
        }

        const validationResult = preUploadAttachmentSchema.safeParse({
            medicalRecordId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        })

        if (!validationResult.success) {
            return {
                success: false,
                error: `Error de validación: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
            }
        }

        const fileValidation = fileSchema.safeParse({
            name: file.name,
            size: file.size,
            type: file.type,
        })

        if (!fileValidation.success) {
            return {
                success: false,
                error: `Archivo inválido: ${fileValidation.error.issues.map((e) => e.message).join(", ")}`,
            }
        }

        const fileToUpload = compressedFile || file

        // Generate unique file path
        const timestamp = Date.now()
        const fileExtension = file.name.split(".").pop()
        const fileName = `${medicalRecordId}_${timestamp}.${fileExtension}`
        const filePath = `fichas-medicas/${fileName}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("fichas-medicas")
            .upload(filePath, fileToUpload, {
                cacheControl: "3600",
                upsert: false,
            })

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return {
                success: false,
                error: `Error al subir archivo: ${uploadError.message}`,
            }
        }

        // Create database record
        console.log("[v0] Attempting database insert with:", {
            medical_record_id: medicalRecordId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: fileToUpload.size,
            mime_type: file.type,
            user_id: user.id,
        })

        const { data: attachmentData, error: dbError } = await supabase
            .from("medical_record_attachments")
            .insert({
                medical_record_id: medicalRecordId,
                file_name: file.name,
                file_path: uploadData.path,
                file_size: fileToUpload.size,
                mime_type: file.type,
            })
            .select()
            .single()

        if (dbError) {
            // If database insert fails, clean up uploaded file
            await supabase.storage.from("fichas-medicas").remove([uploadData.path])
            console.error("[v0] Database error details:", {
                message: dbError.message,
                code: dbError.code,
                details: dbError.details,
                hint: dbError.hint,
            })
            return {
                success: false,
                error: `Error al guardar información del archivo: ${dbError.message}`,
            }
        }

        return {
            success: true,
            attachment: attachmentData,
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `Error de validación: ${error.issues.map((e) => e.message).join(", ")}`,
            }
        }
        console.error("Unexpected error:", error)
        return {
            success: false,
            error: "Error inesperado al subir archivo",
        }
    }
}

// Get all attachments for a medical record
export async function getAttachmentsByMedicalRecord(medicalRecordId: string): Promise<MedicalRecordAttachment[]> {
    try {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase
            .from("medical_record_attachments")
            .select("*")
            .eq("medical_record_id", medicalRecordId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching attachments:", error)
            return []
        }

        return data || []
    } catch (error) {
        console.error("Unexpected error:", error)
        return []
    }
}

// Get signed URL for file download
export async function getAttachmentDownloadUrl(filePath: string): Promise<string | null> {
    try {
        const supabase = await createServerSupabaseClient()

        const { data, error } = await supabase.storage.from("fichas-medicas").createSignedUrl(filePath, 3600) // 1 hour expiry

        if (error) {
            console.error("Error creating signed URL:", error)
            return null
        }

        return data.signedUrl
    } catch (error) {
        console.error("Unexpected error:", error)
        return null
    }
}

// Delete attachment (both file and database record)
export async function deleteAttachment(attachmentId: string): Promise<{ success: boolean; message: string }> {
    try {
        const validationResult = deleteAttachmentSchema.safeParse({ attachmentId })

        if (!validationResult.success) {
            return {
                success: false,
                message: `Error de validación: ${validationResult.error.issues.map((e) => e.message).join(", ")}`,
            }
        }

        const supabase = await createServerSupabaseClient()

        // First get the attachment to know the file path
        const { data: attachment, error: fetchError } = await supabase
            .from("medical_record_attachments")
            .select("file_path")
            .eq("id", attachmentId)
            .single()

        if (fetchError || !attachment) {
            console.error("Error fetching attachment:", fetchError)
            return {
                success: false,
                message: "No se pudo encontrar el archivo adjunto",
            }
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage.from("fichas-medicas").remove([attachment.file_path])

        if (storageError) {
            console.error("Error deleting from storage:", storageError)
            // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        const { error: dbError } = await supabase.from("medical_record_attachments").delete().eq("id", attachmentId)

        if (dbError) {
            console.error("Error deleting from database:", dbError)
            return {
                success: false,
                message: "Error al eliminar el registro del archivo",
            }
        }

        return {
            success: true,
            message: "Archivo eliminado exitosamente",
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: `Error de validación: ${error.issues.map((e) => e.message).join(", ")}`,
            }
        }
        console.error("Unexpected error:", error)
        return {
            success: false,
            message: "Error inesperado al eliminar archivo",
        }
    }
}

// Compress PDF file (placeholder - would need pdf-lib or similar)
export async function compressPDF(file: File): Promise<File> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return file
    } catch (error) {
        console.error("Error compressing PDF:", error)
        return file
    }
}
