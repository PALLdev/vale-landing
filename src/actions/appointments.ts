"use server"

import { unstable_noStore as noStore } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import { appointmentSchema } from "@/schemas/appointment" // Importar el esquema de validación
import { ZodError } from "zod" // Importar ZodError para manejar errores de validación

// Función para obtener todas las citas
export async function getAppointments() {
    noStore() // Deshabilita el almacenamiento en caché para esta función
    try {
        const { data, error } = await supabase.from("appointments").select("*").order("date", { ascending: true })

        if (error) {
            console.error("Supabase Error (getAppointments):", error)
            throw new Error("Failed to fetch appointments.")
        }

        // Mapear los datos para asegurar que 'date' sea un objeto Date
        const appointments = data.map((appt) => ({
            ...appt,
            date: new Date(appt.date), // Convertir la cadena de fecha a objeto Date
            clientName: appt.client_name,
            clientEmail: appt.client_email,
            clientPhone: appt.client_phone,
            consultationType: appt.consultation_type,
            status: appt.status, // Asegurarse de incluir el estado
        }))

        return appointments
    } catch (error) {
        console.error("Server Action Error (getAppointments):", error)
        throw new Error("Failed to fetch appointments.")
    }
}

// Función para añadir una nueva cita
export async function addAppointment(
    appointmentData: {
        date: Date
        time: string
        clientName: string
        clientEmail: string
        clientPhone: string
        consultationType: "ingreso" | "seguimiento"
        notes: string
    },
    isAdminBooking = false,
) {
    // Added isAdminBooking parameter with default false
    try {
        // Validar los datos de entrada con Zod
        const validatedData = appointmentSchema.parse(appointmentData)

        const { data, error } = await supabase
            .from("appointments")
            .insert([
                {
                    date: validatedData.date.toISOString(), // Convertir Date a ISO string para Supabase
                    time: validatedData.time,
                    client_name: validatedData.clientName,
                    client_email: validatedData.clientEmail,
                    client_phone: validatedData.clientPhone,
                    consultation_type: validatedData.consultationType,
                    notes: validatedData.notes,
                    status: isAdminBooking ? "confirmada" : "pendiente", // Auto-confirm admin bookings
                },
            ])
            .select("id") // Seleccionar el ID generado
            .single() // Esperar un solo resultado

        if (error) {
            console.error("Supabase Error (addAppointment):", error)
            return {
                success: false,
                message: error.message || "Failed to create appointment",
                errors: null,
            }
        }

        return {
            success: true,
            message: "Appointment created successfully",
            id: data.id, // Devolver el ID de la cita creada
            errors: null,
            isAdminBooking, // Return isAdminBooking flag to control WhatsApp notifications
        }
    } catch (error) {
        // Manejar errores de validación de Zod
        if (error instanceof ZodError) {
            const errors = error.flatten().fieldErrors
            console.error("Validation Error (addAppointment):", errors)
            return {
                success: false,
                message: "Error de validación en los datos de la cita.",
                errors: errors,
            }
        }
        // Manejar otros errores inesperados
        console.error("Server Action Error (addAppointment):", error)
        return {
            success: false,
            message: "Ocurrió un error inesperado al agendar la cita.",
            errors: null,
        }
    }
}

// Función para actualizar una cita existente
export async function updateAppointment(
    id: string,
    updatedData: {
        date: Date
        time: string
        clientName: string
        clientEmail: string
        clientPhone: string
        consultationType: "ingreso" | "seguimiento"
        notes: string | null // CAMBIO AQUÍ: Permitir que notes sea string o null
    },
) {
    try {
        // Validar los datos de entrada con Zod
        const validatedData = appointmentSchema.parse(updatedData)

        const { error } = await supabase
            .from("appointments")
            .update({
                date: validatedData.date.toISOString(), // Convertir Date a ISO string para Supabase
                time: validatedData.time,
                client_name: validatedData.clientName,
                client_email: validatedData.clientEmail,
                client_phone: validatedData.clientPhone,
                consultation_type: validatedData.consultationType,
                notes: validatedData.notes,
            })
            .eq("id", id) // Actualizar la cita con el ID dado

        if (error) {
            console.error("Supabase Error (updateAppointment):", error)
            return {
                success: false,
                message: error.message || "Failed to update appointment",
                errors: null,
            }
        }

        return {
            success: true,
            message: "Appointment updated successfully",
            errors: null,
        }
    } catch (error) {
        // Manejar errores de validación de Zod
        if (error instanceof ZodError) {
            const errors = error.flatten().fieldErrors
            console.error("Validation Error (updateAppointment):", errors)
            return {
                success: false,
                message: "Error de validación en los datos de la cita.",
                errors: errors,
            }
        }
        // Manejar otros errores inesperados
        console.error("Server Action Error (updateAppointment):", error)
        return {
            success: false,
            message: "Ocurrió un error inesperado al actualizar la cita.",
            errors: null,
        }
    }
}

// NUEVA FUNCIÓN: Eliminar una cita existente
export async function deleteAppointment(id: string) {
    try {
        const { error } = await supabase.from("appointments").delete().eq("id", id)

        if (error) {
            console.error("Supabase Error (deleteAppointment):", error)
            return {
                success: false,
                message: error.message || "Failed to delete appointment",
            }
        }

        return {
            success: true,
            message: "Appointment deleted successfully",
        }
    } catch (error) {
        console.error("Server Action Error (deleteAppointment):", error)
        return {
            success: false,
            message: "Ocurrió un error inesperado al eliminar la cita.",
        }
    }
}

// NUEVA FUNCIÓN: Actualizar el estado de una cita
export async function updateAppointmentStatus(
    id: string,
    status: "confirmada" | "pendiente" | "cancelada", // Añadir 'cancelada' como opción
) {
    try {
        const { error } = await supabase.from("appointments").update({ status: status }).eq("id", id)

        if (error) {
            console.error("Supabase Error (updateAppointmentStatus):", error)
            return {
                success: false,
                message: error.message || `Failed to update appointment status to ${status}`,
            }
        }

        return {
            success: true,
            message: `Appointment status updated to ${status} successfully`,
        }
    } catch (error) {
        console.error("Server Action Error (updateAppointmentStatus):", error)
        return {
            success: false,
            message: "Ocurrió un error inesperado al actualizar el estado de la cita.",
        }
    }
}
