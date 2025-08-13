"use server"

import { unstable_noStore as noStore } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import type { AvailabilityBlock, CreateAvailabilityBlockInput } from "@/types/availability"
import { z } from "zod"

const availabilityBlockSchema = z.object({
    date: z.date(),
    timeSlot: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
    blockType: z.enum(["unavailable", "vacation", "maintenance"]),
    reason: z.string().optional(),
})

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
            // Crear la fecha directamente desde la cadena YYYY-MM-DD sin conversión de zona horaria
            const dateParts = block.date.split("-")
            const year = Number.parseInt(dateParts[0])
            const month = Number.parseInt(dateParts[1]) - 1 // Los meses en JavaScript van de 0-11
            const day = Number.parseInt(dateParts[2])

            return {
                id: block.id,
                date: new Date(year, month, day),
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

        // Crear la fecha en formato YYYY-MM-DD sin problemas de zona horaria
        const year = validatedData.date.getFullYear()
        const month = String(validatedData.date.getMonth() + 1).padStart(2, "0")
        const day = String(validatedData.date.getDate()).padStart(2, "0")
        const dateString = `${year}-${month}-${day}`

        console.log("Creando bloqueo para fecha:", dateString)
        console.log("Fecha original:", validatedData.date)
        console.log("Día de la fecha original:", validatedData.date.getDate())

        const { data, error } = await supabase
            .from("availability_blocks")
            .insert([
                {
                    date: dateString,
                    time_slot: validatedData.timeSlot || null,
                    block_type: validatedData.blockType,
                    reason: validatedData.reason || null,
                },
            ])
            .select("id")
            .single()

        if (error) {
            console.error("Supabase Error (createAvailabilityBlock):", error)
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
        // Crear la fecha en la zona horaria local para evitar problemas de offset
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const dateString = `${year}-${month}-${day}`

        const { data, error } = await supabase
            .from("availability_blocks")
            .select("id")
            .eq("date", dateString)
            .or(`time_slot.is.null,time_slot.eq.${timeSlot || ""}`)

        if (error) {
            console.error("Supabase Error (isTimeSlotBlocked):", error)
            return false // En caso de error, asumir que no está bloqueado
        }

        return data.length > 0
    } catch (error) {
        console.error("Server Action Error (isTimeSlotBlocked):", error)
        return false
    }
}
