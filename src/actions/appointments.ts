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
        }))

        return appointments
    } catch (error) {
        console.error("Server Action Error (getAppointments):", error)
        throw new Error("Failed to fetch appointments.")
    }
}

// Función para añadir una nueva cita
export async function addAppointment(appointmentData: {
    date: Date
    time: string
    clientName: string
    clientEmail: string
    clientPhone: string
    consultationType: "ingreso" | "seguimiento"
    notes: string
}) {
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
                    status: "pendiente", // Estado por defecto
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
