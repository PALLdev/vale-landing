import { z } from 'zod';

// Esquema de validación para los datos de la cita
export const appointmentSchema = z.object({
    clientName: z.string()
        .min(1, "El nombre es obligatorio.")
        .refine(name => name.trim().split(/\s+/).length >= 2, {
            message: "El nombre completo debe contener al menos dos palabras."
        })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras y espacios."),
    clientEmail: z.string().email("Formato de email inválido."),
    clientPhone: z.string().regex(/^\d{9}$/, "El teléfono debe contener exactamente 9 dígitos numéricos."),
    consultationType: z.enum(["ingreso", "seguimiento"], {
        message: "El tipo de consulta es obligatorio y debe ser 'ingreso' o 'seguimiento'."
    }),
    notes: z.string().optional().nullable(), // Las notas son opcionales y pueden ser nulas
    // Estas dos propiedades se validarán en el contexto de la Server Action
    // ya que se construyen a partir de selectedDate y selectedTime
    date: z.date(),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)."),
});

// Tipo inferido del esquema para usar en TypeScript
export type AppointmentInput = z.infer<typeof appointmentSchema>;