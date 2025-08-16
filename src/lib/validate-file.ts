import { z } from "zod"

// Zod schema for file validation
const fileSchema = z.object({
    name: z.string().min(1, "El nombre del archivo es requerido"),
    size: z.number().positive("El tamaño del archivo debe ser positivo"),
    type: z.string().min(1, "El tipo de archivo es requerido"),
})

// Validate file before upload
export function validateFile(file: File, maxSizeMB = 5): string | null {
    // Basic file validation
    if (!file) {
        return "No se ha seleccionado ningún archivo"
    }

    // Validate file type (only PDF)
    if (file.type !== "application/pdf") {
        return "Solo se permiten archivos PDF"
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
        return `El archivo debe ser menor a ${maxSizeMB}MB`
    }

    // Validate file name
    if (!file.name || file.name.trim().length === 0) {
        return "El archivo debe tener un nombre válido"
    }

    // Validate using Zod schema
    const fileValidation = fileSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type,
    })

    if (!fileValidation.success) {
        return fileValidation.error.issues.map((e) => e.message).join(", ")
    }

    return null
}
