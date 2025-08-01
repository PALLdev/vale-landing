"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
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
import { addAppointment, getAppointments } from "@/actions/appointments"
import { appointmentSchema } from "@/schemas/appointment"
import { ZodError } from "zod"

export function useCalendarLogic() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)
    const [isBooking, setIsBooking] = useState(false)

    // Formulario de reserva
    const [clientName, setClientName] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientPhone, setClientPhone] = useState("")
    const [consultationType, setConsultationType] = useState<"ingreso" | "seguimiento" | "">("")
    const [notes, setNotes] = useState("")
    // CAMBIO AQUÍ: Actualizar el tipo de formErrors para que sea un objeto con arrays de strings
    const [formErrors, setFormErrors] = useState<{ [key: string]: string[] | undefined }>({})

    // Cargar citas al montar el componente
    useEffect(() => {
        const loadAppointments = async () => {
            setIsLoadingAppointments(true)
            try {
                const fetchedAppointments = await getAppointments()
                setAppointments(fetchedAppointments as Appointment[])
            } catch (error) {
                console.error("Error loading appointments:", error)
                toast.error("Error al cargar citas", {
                    description: "No se pudieron cargar las citas existentes. Intenta de nuevo más tarde.",
                })
            } finally {
                setIsLoadingAppointments(false)
            }
        }
        loadAppointments()
    }, [])

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

    // Validación del formulario en el cliente usando Zod
    const validateForm = useCallback(() => {
        const dataToValidate = {
            clientName,
            clientEmail,
            clientPhone,
            consultationType,
            notes: notes || null, // Zod espera null para opcionales si no hay valor
            date: selectedDate,
            time: selectedTime,
        }

        try {
            appointmentSchema.parse(dataToValidate)
            setFormErrors({}) // Limpiar errores si la validación es exitosa
            return true
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.flatten().fieldErrors
                // Zod.flatten().fieldErrors ya devuelve {[key: string]: string[]},
                // por lo que no necesitamos castear a 'string'
                setFormErrors(errors)
                toast.error("Error de validación", {
                    description: "Por favor, revisa los campos marcados en rojo.",
                })
            } else {
                console.error("Unexpected validation error:", error)
                toast.error("Error inesperado", {
                    description: "Ocurrió un error durante la validación del formulario.",
                })
            }
            return false
        }
    }, [clientName, clientEmail, clientPhone, consultationType, notes, selectedDate, selectedTime])

    const handleBookAppointment = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (!validateForm()) {
                return // Detener si la validación del cliente falla
            }

            if (!selectedDate || !selectedTime) {
                toast.error("Error", {
                    description: "Fecha u hora no seleccionada. Por favor, selecciona una fecha y hora.",
                })
                return
            }

            setIsBooking(true) // Iniciar estado de carga del botón

            const newAppointmentData = {
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
            }

            const response = await addAppointment(newAppointmentData)
            setIsBooking(false) // Finalizar estado de carga del botón

            if (response.success) {
                const addedAppointment: Appointment = {
                    ...newAppointmentData,
                    id: response.id!,
                    status: "pendiente",
                }
                setAppointments((prev) => [...prev, addedAppointment])
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
                setSelectedDate(null)
                setFormErrors({})
            } else {
                // Manejar errores de validación del servidor
                if (response.errors) {
                    // Los errores del servidor ya vienen como {[key: string]: string[]}
                    setFormErrors(response.errors as { [key: string]: string[] | undefined })
                    toast.error("Error de validación", {
                        description: response.message || "Por favor, revisa los campos marcados en rojo.",
                    })
                } else {
                    toast.error("Error al agendar cita", {
                        description: response.message || "Ocurrió un error inesperado.",
                    })
                }
            }
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
        isLoadingAppointments,
        isBooking,
        setCurrentMonth,
        setSelectedDate,
        setClientName,
        setClientEmail,
        setClientPhone,
        setConsultationType,
        setNotes,
        setFormErrors,
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
