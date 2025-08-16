"use server"

import { unstable_noStore as noStore } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import type { AvailabilityBlock, CreateAvailabilityBlockInput } from "@/types/availability"
import { z } from "zod"

const availabilityBlockSchema = z.object({
    dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
    timeSlot: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
    blockType: z.enum(["unavailable", "vacation", "maintenance"]),
    reason: z.string().optional(),
})

// Función helper para crear Date desde string YYYY-MM-DD sin problemas de timezone
function createDateFromString(dateString: string): Date {
    // Usar Date constructor con string ISO para evitar problemas de timezone
    // Agregar 'T12:00:00' para que sea mediodía UTC y evitar cambios de día
    return new Date(`${dateString}T12:00:00.000Z`)
}

// Función para obtener todos los bloqueos de disponibilidad
export async function getAvailabilityBlocks() {
    noStore()
    try {
        const { data, error } = await supabase.from("availability_blocks").select("*").order("date", { ascending: true })

        if (error) {
            console.error("Supabase Error (getAvailabilityBlocks):", error)
            throw new Error("Failed to fetch availability blocks.")
        }

        const blocks: AvailabilityBlock[] = data.map((block) => {

            const dateFromHelper = createDateFromString(block.date)

            return {
                id: block.id,
                date: dateFromHelper,
                timeSlot: block.time_slot || undefined,
                blockType: block.block_type,
                reason: block.reason || undefined,
                createdAt: new Date(block.created_at),
                updatedAt: new Date(block.updated_at),
            }
        })

        return blocks
    } catch (error) {
        console.error("Server Action Error (getAvailabilityBlocks):", error)
        throw new Error("Failed to fetch availability blocks.")
    }
}

// Función para crear un nuevo bloqueo de disponibilidad
export async function createAvailabilityBlock(blockData: CreateAvailabilityBlockInput) {
    try {
        const validatedData = availabilityBlockSchema.parse(blockData)

        const { data, error } = await supabase
            .from("availability_blocks")
            .insert([
                {
                    date: validatedData.dateString, // Usar directamente el string sin conversiones
                    time_slot: validatedData.timeSlot || null,
                    block_type: validatedData.blockType,
                    reason: validatedData.reason || null,
                },
            ])
            .select("*") // Seleccionar todo para ver qué se guardó realmente
            .single()

        if (error) {
            console.error("Supabase Error (createAvailabilityBlock):", error)
            console.log("Error details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            })
            return {
                success: false,
                message: error.message || "Failed to create availability block",
            }
        }

        return {
            success: true,
            message: "Availability block created successfully",
            id: data.id,
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation Error:", error.flatten().fieldErrors)
            return {
                success: false,
                message: "Validation error",
                errors: error.flatten().fieldErrors,
            }
        }
        console.error("Server Action Error (createAvailabilityBlock):", error)
        return {
            success: false,
            message: "An unexpected error occurred while creating the availability block.",
        }
    }
}

// Función para eliminar un bloqueo de disponibilidad
export async function deleteAvailabilityBlock(id: string) {
    try {
        const { error } = await supabase.from("availability_blocks").delete().eq("id", id)

        if (error) {
            console.error("Supabase Error (deleteAvailabilityBlock):", error)
            return {
                success: false,
                message: error.message || "Failed to delete availability block",
            }
        }

        return {
            success: true,
            message: "Availability block deleted successfully",
        }
    } catch (error) {
        console.error("Server Action Error (deleteAvailabilityBlock):", error)
        return {
            success: false,
            message: "An unexpected error occurred while deleting the availability block.",
        }
    }
}

// Función para verificar si una fecha/hora específica está bloqueada
export async function isTimeSlotBlocked(date: Date, timeSlot?: string): Promise<boolean> {
    try {
        // Convertir la fecha a string YYYY-MM-DD sin problemas de timezone
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const dateString = `${year}-${month}-${day}`



        const { data, error } = await supabase
            .from("availability_blocks")
            .select("id, date, time_slot")
            .eq("date", dateString)
            .or(`time_slot.is.null,time_slot.eq.${timeSlot || ""}`)

        if (error) {
            console.error("Supabase Error (isTimeSlotBlocked):", error)
            return false // En caso de error, asumir que no está bloqueado
        }

        const isBlocked = data.length > 0

        return isBlocked
    } catch (error) {
        console.error("Server Action Error (isTimeSlotBlocked):", error)
        return false
    }
}
