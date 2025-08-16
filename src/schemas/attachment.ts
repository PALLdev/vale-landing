import { z } from "zod"

// Esquema para validar archivos PDF
export const fileSchema = z.object({
    name: z
        .string()
        .min(1, "El nombre del archivo es obligatorio.")
        .regex(/\.pdf$/i, "Solo se permiten archivos PDF."),
    size: z
        .number()
        .max(5 * 1024 * 1024, "El archivo no puede superar los 5MB.")
        .min(1, "El archivo no puede estar vacío."),
    type: z.string().regex(/^application\/pdf$/i, "Solo se permiten archivos PDF."),
})

// Esquema para crear un attachment
export const createAttachmentSchema = z.object({
    medicalRecordId: z.string().uuid("ID de ficha médica inválido."),
    fileName: z
        .string()
        .min(1, "El nombre del archivo es obligatorio.")
        .max(255, "El nombre del archivo es demasiado largo."),
    filePath: z.string().min(1, "La ruta del archivo es obligatoria."),
    fileSize: z
        .number()
        .max(5 * 1024 * 1024, "El archivo no puede superar los 5MB.")
        .min(1, "El tamaño del archivo debe ser mayor a 0."),
    mimeType: z.string().regex(/^application\/pdf$/i, "Solo se permiten archivos PDF."),
})

// Esquema para eliminar un attachment
export const deleteAttachmentSchema = z.object({
    attachmentId: z.string().uuid("ID de archivo adjunto inválido."),
})

// Esquema para validar antes de subir (sin filePath)
export const preUploadAttachmentSchema = z.object({
    medicalRecordId: z.string().uuid("ID de ficha médica inválido."),
    fileName: z
        .string()
        .min(1, "El nombre del archivo es obligatorio.")
        .max(255, "El nombre del archivo es demasiado largo."),
    fileSize: z
        .number()
        .max(5 * 1024 * 1024, "El archivo no puede superar los 5MB.")
        .min(1, "El tamaño del archivo debe ser mayor a 0."),
    mimeType: z.string().regex(/^application\/pdf$/i, "Solo se permiten archivos PDF."),
})

// Tipos inferidos de los esquemas
export type FileValidation = z.infer<typeof fileSchema>
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>
export type PreUploadAttachmentInput = z.infer<typeof preUploadAttachmentSchema>
export type DeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>
