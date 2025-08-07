export interface Appointment {
    id: string
    date: Date
    time: string // e.g., "09:00"
    clientName: string
    clientEmail: string
    clientPhone: string
    consultationType: "ingreso" | "seguimiento"
    notes?: string
    status: "confirmada" | "pendiente" | "cancelada" // Aseguramos que 'cancelada' esté aquí
}

export interface TimeSlot {
    time: string
    isAvailable: boolean
}
