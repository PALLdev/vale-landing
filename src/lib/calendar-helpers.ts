import { isSameDay, setHours, setMinutes, isPast, isToday, format, getDay } from "date-fns"
import type { Appointment, TimeSlot } from "@/types/calendar"
import type { AvailabilityBlock } from "@/types/availability";

/**
 * Generates time slots for a given date, excluding a break from 1 PM to 2 PM,
 * and marking slots as unavailable if they are in the past, already booked, or blocked by admin.
 *
 * @param date The date for which to generate time slots.
 * @param appointments An array of existing appointments.
 * @param availabilityBlocks An array of availability blocks set by admin.
 * @param excludeAppointmentId Optional ID of an appointment to exclude from the check.
 * @returns An array of TimeSlot objects.
 */
export function generateTimeSlots(
    date: Date | null,
    appointments: Appointment[],
    availabilityBlocks: AvailabilityBlock[] = [],
    excludeAppointmentId?: string,
): TimeSlot[] {
    if (!date) {
        return []
    }

    const timeSlots: TimeSlot[] = []
    const startHour = 10 // 10 AM
    const endHour = 21 // 9 PM (exclusive, so last slot is 20:00)
    const breakStartHour = 14 // 2 PM
    const breakEndHour = 15 // 3 PM

    const isSelectedDateToday = isToday(date)
    const isSelectedDatePast = isPast(date) && !isSelectedDateToday

    // Check if the entire day is blocked
    const isDayBlocked = availabilityBlocks.some((block) => isSameDay(block.date, date) && !block.timeSlot)

    // If the selected date is in the past (and not today) or the entire day is blocked, all slots are unavailable
    if (isSelectedDatePast || isDayBlocked) {
        for (let hour = startHour; hour < endHour; hour++) {
            if (hour >= breakStartHour && hour < breakEndHour) {
                continue // Skip break hour
            }
            const slotTime = format(setMinutes(setHours(date, hour), 0), "HH:mm")
            timeSlots.push({ time: slotTime, isAvailable: false })
        }
        return timeSlots
    }

    // If the selected date is a Sunday, no slots are available
    if (getDay(date) === 0) {
        // Sunday is 0
        for (let hour = startHour; hour < endHour; hour++) {
            if (hour >= breakStartHour && hour < breakEndHour) {
                continue // Skip break hour
            }
            const slotTime = format(setMinutes(setHours(date, hour), 0), "HH:mm")
            timeSlots.push({ time: slotTime, isAvailable: false })
        }
        return timeSlots
    }

    for (let hour = startHour; hour < endHour; hour++) {
        // Skip the break time
        if (hour >= breakStartHour && hour < breakEndHour) {
            continue
        }

        const slotDateTime = setMinutes(setHours(date, hour), 0)
        const slotTime = format(slotDateTime, "HH:mm")

        // Check if the slot is in the past for today's date
        const isSlotPast = isSelectedDateToday && isPast(slotDateTime)

        // Check if the slot is already booked, excluding the appointment being edited
        const isBooked = appointments.some(
            (appt) => isSameDay(appt.date, date) && appt.time === slotTime && appt.id !== excludeAppointmentId,
        )

        // Check if the specific time slot is blocked by admin
        const isTimeSlotBlocked = availabilityBlocks.some(
            (block) => isSameDay(block.date, date) && block.timeSlot === slotTime,
        )

        timeSlots.push({
            time: slotTime,
            isAvailable: !isSlotPast && !isBooked && !isTimeSlotBlocked,
        })
    }

    return timeSlots
}

/**
 * Checks if a given day is fully booked based on available time slots.
 * A day is considered fully booked if all its potential time slots are unavailable.
 *
 * @param date The date to check.
 * @param allAppointments All existing appointments.
 * @param availabilityBlocks All availability blocks.
 * @returns True if the day is fully booked, false otherwise.
 */
export function isDayFullyBooked(
    date: Date,
    allAppointments: Appointment[],
    availabilityBlocks: AvailabilityBlock[] = [],
): boolean {
    const potentialSlots = generateTimeSlots(date, allAppointments, availabilityBlocks)
    // A day is fully booked if all its potential slots are marked as not available
    // or if there are no potential slots (e.g., Sundays, past days where all are unavailable).
    return potentialSlots.length > 0 && potentialSlots.every((slot) => !slot.isAvailable)
}

/**
 * Checks if a given day has any appointments.
 *
 * @param date The date to check.
 * @param allAppointments All existing appointments.
 * @returns True if the day has at least one appointment, false otherwise.
 */
export function hasAppointmentsOnDay(date: Date, allAppointments: Appointment[]): boolean {
    return allAppointments.some((appt) => isSameDay(appt.date, date))
}

/**
 * Checks if a given day is blocked by admin.
 *
 * @param date The date to check.
 * @param availabilityBlocks All availability blocks.
 * @returns True if the day is blocked, false otherwise.
 */
export function isDayBlocked(date: Date, availabilityBlocks: AvailabilityBlock[]): boolean {
    return availabilityBlocks.some((block) => isSameDay(block.date, date) && !block.timeSlot)
}
