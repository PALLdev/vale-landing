export interface AvailabilityBlock {
    id: string
    date: Date
    timeSlot?: string // undefined para bloquear todo el día
    blockType: "unavailable" | "vacation" | "maintenance"
    reason?: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateAvailabilityBlockInput {
    date: Date
    timeSlot?: string
    blockType: "unavailable" | "vacation" | "maintenance"
    reason?: string
}
