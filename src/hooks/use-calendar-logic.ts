"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isPast,
    addMonths,
    subMonths,
    isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import type { Appointment } from "@/types/calendar"
import { generateTimeSlots } from "@/lib/calendar-helpers"

// Datos de Ejemplo (para demostración)
const initialAppointments: Appointment[] = [
    {
        id: "1",
        date: new Date(2025, 7, 10, 9, 0), // Agosto 10, 2025, 9:00 AM
        time: "09:00",
        clientName: "Ana Torres",
        clientEmail: "ana.t@example.com",
        clientPhone: "987654321",
        consultationType: "ingreso",
        status: "confirmada",
    },
    {
        id: "2",
        date: new Date(2025, 7, 10, 10, 30), // Agosto 10, 2025, 10:30 AM
        time: "10:30",
        clientName: "Pedro Ruiz",
        clientEmail: "pedro.r@example.com",
        clientPhone: "912345678",
        consultationType: "seguimiento",
        status: "pendiente",
    },
    {
        id: "3",
        date: new Date(2025, 7, 15, 14, 0), // Agosto 15, 2025, 2:00 PM
        time: "14:00",
        clientName: "Laura Gómez",
        clientEmail: "laura.g@example.com",
        clientPhone: "955554444",
        consultationType: "ingreso",
        status: "confirmada",
    },
]

export function useCalendarLogic() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

    // Formulario de reserva
    const [clientName, setClientName] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientPhone, setClientPhone] = useState("")
    const [consultationType, setConsultationType] = useState<"ingreso" | "seguimiento" | "">("")
    const [notes, setNotes] = useState("")
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        return eachDayOfInterval({ start, end })
    }, [currentMonth])

    const firstDayOfMonth = startOfMonth(currentMonth)
    const startingDayIndex = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday...

    const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth((prev) => subMonths(prev, 1))
        setSelectedDate(null)
        setSelectedTime(null)
    }, [])

    const handleNextMonth = useCallback(() => {
        setCurrentMonth((prev) => addMonths(prev, 1))
        setSelectedDate(null)
        setSelectedTime(null)
    }, [])

    const handleDateSelect = useCallback((date: Date) => {
        if (isPast(date) && !isToday(date)) {
            toast.error("Fecha no disponible", {
                description: "No puedes seleccionar fechas pasadas.",
            })
            return
        }
        setSelectedDate(date)
        setSelectedTime(null) // Reset selected time when date changes
    }, [])

    const handleTimeSelect = useCallback((time: string) => {
        setSelectedTime(time)
    }, [])

    const availableTimeSlots = useMemo(() => generateTimeSlots(selectedDate, appointments), [selectedDate, appointments])

    const validateForm = useCallback(() => {
        const errors: { [key: string]: string } = {}
        if (!clientName.trim()) errors.clientName = "El nombre es obligatorio."
        if (!clientEmail.trim()) errors.clientEmail = "El email es obligatorio."
        else if (!/\S+@\S+\.\S+/.test(clientEmail)) errors.clientEmail = "Formato de email inválido."
        if (!clientPhone.trim()) errors.clientPhone = "El teléfono es obligatorio."
        else if (!/^\d{9,}$/.test(clientPhone)) errors.clientPhone = "Formato de teléfono inválido (mínimo 9 dígitos)."
        if (!consultationType) errors.consultationType = "El tipo de consulta es obligatorio."
        if (!selectedDate) errors.selectedDate = "Debes seleccionar una fecha."
        if (!selectedTime) errors.selectedTime = "Debes seleccionar una hora."
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }, [clientName, clientEmail, clientPhone, consultationType, selectedDate, selectedTime])

    const handleBookAppointment = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault()
            if (!validateForm()) {
                toast.error("Error de validación", {
                    description: "Por favor, completa todos los campos obligatorios.",
                })
                return
            }

            if (!selectedDate || !selectedTime) {
                toast.error("Error", {
                    description: "Fecha u hora no seleccionada. Por favor, selecciona una fecha y hora.",
                })
                return
            }

            const newAppointment: Appointment = {
                id: String(appointments.length + 1),
                date: new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    Number.parseInt(selectedTime.split(":")[0]),
                    Number.parseInt(selectedTime.split(":")[1]),
                ),
                time: selectedTime,
                clientName,
                clientEmail,
                clientPhone,
                consultationType: consultationType as "ingreso" | "seguimiento",
                notes,
                status: "pendiente", // Nueva cita por defecto como pendiente
            }

            setAppointments((prev) => [...prev, newAppointment])
            toast.success("Cita Agendada con Éxito", {
                description: `Tu cita para el ${format(selectedDate, "dd/MM/yyyy", { locale: es })} a las ${selectedTime} ha sido agendada. Recibirás un email de confirmación.`,
            })

            // Reset form
            setClientName("")
            setClientEmail("")
            setClientPhone("")
            setConsultationType("")
            setNotes("")
            setSelectedTime(null)
            setSelectedDate(null) // Reset selected date after booking
            setFormErrors({})
        },
        [
            validateForm,
            selectedDate,
            selectedTime,
            clientName,
            clientEmail,
            clientPhone,
            consultationType,
            notes,
            appointments.length,
        ],
    )

    return {
        currentMonth,
        selectedDate,
        appointments,
        selectedTime,
        clientName,
        clientEmail,
        clientPhone,
        consultationType,
        notes,
        formErrors,
        daysInMonth,
        startingDayIndex,
        daysOfWeek,
        availableTimeSlots,
        setCurrentMonth,
        setSelectedDate,
        setClientName,
        setClientEmail,
        setClientPhone,
        setConsultationType,
        setNotes,
        setSelectedTime,
        handlePrevMonth,
        handleNextMonth,
        handleDateSelect,
        handleTimeSelect,
        handleBookAppointment,
        isPast,
        isToday,
        isSameDay,
        format,
        es,
    }
}
