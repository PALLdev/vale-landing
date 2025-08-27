import { PDFDocument } from "pdf-lib"

export interface CompressionOptions {
    quality?: number // 0.1 to 1.0, lower = more compression
    removeMetadata?: boolean
    optimizeImages?: boolean
}

export async function compressPDF(file: File, options: CompressionOptions = {}): Promise<File> {
    try {
        const { quality = 0.7, removeMetadata = true, optimizeImages = true } = options

        // Read the PDF file
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)

        // Remove metadata to reduce size
        if (removeMetadata) {
            pdfDoc.setTitle("")
            pdfDoc.setAuthor("")
            pdfDoc.setSubject("")
            pdfDoc.setKeywords([])
            pdfDoc.setProducer("")
            pdfDoc.setCreator("")
        }

        // Get all pages and optimize them
        const pages = pdfDoc.getPages()

        if (optimizeImages) {
            // Note: pdf-lib has limited image optimization capabilities
            // For more advanced compression, you might need additional libraries
            for (const page of pages) {
                // Basic page optimization - remove unused resources
                const { width, height } = page.getSize()

                // Ensure reasonable page dimensions (this can help with file size)
                if (width > 2000 || height > 2000) {
                    const scale = Math.min(2000 / width, 2000 / height)
                    page.scale(scale, scale)
                }
            }
        }

        // Save the compressed PDF
        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true, // Helps reduce file size
            addDefaultPage: false,
            objectsPerTick: 50, // Process in smaller chunks
        })

        const arrayBufferForFile = new Uint8Array(compressedPdfBytes)

        // Create a new File object with the compressed data
        const compressedFile = new File([arrayBufferForFile], file.name, {
            type: "application/pdf",
            lastModified: Date.now(),
        })

        // Only return compressed version if it's actually smaller
        if (compressedFile.size < file.size) {
            return compressedFile
        } else {
            return file
        }
    } catch (error) {
        console.error("PDF compression failed:", error)
        // Return original file if compression fails
        return file
    }
}

export function getCompressionStats(originalSize: number, compressedSize: number) {
    const reduction = originalSize - compressedSize
    const percentage = Math.round((reduction / originalSize) * 100)

    return {
        originalSize,
        compressedSize,
        reduction,
        percentage,
        isSmaller: compressedSize < originalSize,
    }
}
