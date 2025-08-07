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
import { generateTimeSlots, isDayFullyBooked } from "@/lib/calendar-helpers"
import { addAppointment, getAppointments } from "@/actions/appointments"
import { appointmentSchema } from "@/schemas/appointment"
import { ZodError } from "zod"

export function useCalendarLogic(isAdminView = false) {
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
    // Calcular el índice del primer día de la semana (Lunes = 0)
    const startingDayIndex = (firstDayOfMonth.getDay() - 1 + 7) % 7

    const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

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

    const handleDateSelect = useCallback(
        (date: Date) => {
            // Check if it's a Sunday
            if (date.getDay() === 0) {
                // Sunday is 0
                toast.error("Día no disponible", {
                    description: "Los domingos no hay atención.",
                })
                return
            }
            // Para la vista pública, impide la selección de fechas pasadas (pero permite hoy)
            // Para la vista de administrador, permite la selección de fechas pasadas para ver citas
            if (!isAdminView && isPast(date) && !isToday(date)) {
                toast.error("Fecha no disponible", {
                    description: "No puedes seleccionar fechas pasadas.",
                })
                return
            }
            // Si el día está completamente agendado, se puede seleccionar, pero el panel de horarios mostrará que no hay disponibilidad.
            setSelectedDate(date)
            setSelectedTime(null) // Reset selected time when date changes
        },
        [isAdminView], // Añadir isAdminView a las dependencias
    )

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
                return false // Detener si la validación del cliente falla
            }

            if (!selectedDate || !selectedTime) {
                toast.error("Error", {
                    description: "Fecha u hora no seleccionada. Por favor, selecciona una fecha y hora.",
                })
                return false
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
                    status: "pendiente", // Las citas nuevas siempre son pendientes
                }
                setAppointments((prev) => [...prev, addedAppointment])
                toast.success("Cita Agendada con Éxito", {
                    description: `Tu cita para el ${format(selectedDate, "dd/MM/yyyy", { locale: es })} a las ${selectedTime} ha sido agendada. Recibirás un email de confirmación.`,
                })

                // --- NUEVA FUNCIONALIDAD: Notificación al Administrador vía WhatsApp ---
                const adminWhatsAppNumber = "56912345678"; // REEMPLAZA CON EL NÚMERO DE WHATSAPP DEL ADMINISTRADOR (con código de país, sin +)
                const formattedDate = format(selectedDate, "dd/MM/yyyy", { locale: es });
                const message = encodeURIComponent(
                    `¡Nueva cita agendada!\n\n` +
                    `*Cliente:* ${clientName}\n` +
                    `*Email:* ${clientEmail}\n` +
                    `*Teléfono:* ${clientPhone}\n` +
                    `*Fecha:* ${formattedDate}\n` +
                    `*Hora:* ${selectedTime}\n` +
                    `*Tipo:* ${consultationType === "ingreso" ? "Ingreso" : "Seguimiento"}\n` +
                    (notes ? `*Notas:* ${notes}\n\n` : "\n") +
                    `Por favor, revisa y confirma la cita.`
                );
                const whatsappLink = `https://wa.me/${adminWhatsAppNumber}?text=${message}`;

                // Abrir WhatsApp en una nueva pestaña
                window.open(whatsappLink, "_blank");
                // --- FIN NUEVA FUNCIONALIDAD ---

                // Reset form
                setClientName("")
                setClientEmail("")
                setClientPhone("")
                setConsultationType("")
                setNotes("")
                setSelectedTime(null)
                setSelectedDate(null)
                setFormErrors({})
                return true // Indicar éxito
            } else {
                // Manejar errores de validación del servidor
                if (response.errors) {
                    setFormErrors(response.errors as { [key: string]: string[] | undefined })
                    toast.error("Error de validación", {
                        description: response.message || "Por favor, revisa los campos marcados en rojo.",
                    })
                } else {
                    toast.error("Error al agendar cita", {
                        description: response.message || "Ocurrió un error inesperado.",
                    })
                }
                return false // Indicar fallo
            }
        },
        [validateForm, selectedDate, selectedTime, clientName, clientEmail, clientPhone, consultationType, notes],
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
        isDayFullyBooked,
        setAppointments,
        setIsLoadingAppointments,
    }
}
