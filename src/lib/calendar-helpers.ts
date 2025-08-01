import { isSameDay } from "date-fns"
import type { Appointment, TimeSlot } from "@/types/calendar"

/**
 * Genera una lista de franjas horarias disponibles para una fecha dada.
 * Las citas son cada hora, y hay un descanso de 13:00 a 14:00.
 *
 * @param date La fecha para la que se generarán las franjas horarias.
 * @param appointments La lista de citas existentes para verificar la disponibilidad.
 * @returns Un array de objetos TimeSlot.
 */
export function generateTimeSlots(date: Date | null, appointments: Appointment[]): TimeSlot[] {
    if (!date) return []

    const slots: TimeSlot[] = []
    const now = new Date()
    const isSelectedDateToday = isSameDay(date, now)

    for (let hour = 9; hour <= 17; hour++) {
        // Excluir la hora de descanso (13:00 a 14:00)
        if (hour === 13) {
            continue
        }

        // Generar slots cada hora (minuto 00)
        const minute = 0
        const slotTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
        const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)

        const isOccupied = appointments.some((appt) => isSameDay(appt.date, date) && appt.time === slotTime)

        const isPastTime = isSelectedDateToday && slotDate < now

        slots.push({
            time: slotTime,
            isAvailable: !isOccupied && !isPastTime,
        })
    }
    return slots
}
