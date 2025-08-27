// Storage configuration and bucket setup
export const STORAGE_CONFIG = {
    BUCKET_NAME: "fichas-medicas",
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_MIME_TYPES: ["application/pdf"],
    SIGNED_URL_EXPIRY: 3600, // 1 hour
} as const

export const STORAGE_PATHS = {
    MEDICAL_RECORDS: "fichas-medicas",
} as const

// Helper function to generate file path
export function generateFilePath(medicalRecordId: string, originalFileName: string): string {
    const timestamp = Date.now()
    // const fileExtension = originalFileName.split(".").pop()
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50)

    return `${STORAGE_PATHS.MEDICAL_RECORDS}/${medicalRecordId}_${timestamp}_${sanitizedName}`
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
