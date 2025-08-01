"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import type { TimeSlot } from "@/types/calendar";
import type { Locale } from "date-fns";

interface TimeSlotsPanelProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  availableTimeSlots: TimeSlot[];
  handleTimeSelect: (time: string) => void;
  format: (
    date: Date,
    formatStr: string,
    options?: { locale?: Locale }
  ) => string;
  es: Locale;
}

export function TimeSlotsPanel({
  selectedDate,
  selectedTime,
  availableTimeSlots,
  handleTimeSelect,
  format,
  es,
}: TimeSlotsPanelProps) {
  if (!selectedDate) {
    return (
      <Card className="shadow-lg border-purple-100 flex items-center justify-center min-h-[200px]">
        <CardContent className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Selecciona una fecha en el calendario para ver los horarios
            disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Determinar si todos los slots están no disponibles
  const allSlotsUnavailable = availableTimeSlots.every(
    (slot) => !slot.isAvailable
  );

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          {allSlotsUnavailable
            ? "No hay Horarios Disponibles"
            : "Horarios Disponibles"}{" "}
          {/* Título dinámico */}
        </CardTitle>
        <p className="text-gray-700 text-sm">
          {allSlotsUnavailable
            ? `No quedan horas para el ` // Texto dinámico
            : `Selecciona una hora para el `}
          <span className="font-semibold text-purple-700">
            {format(selectedDate, "dd MMMM yyyy", { locale: es })}
          </span>
          {/* Eliminada la puntuación final */}
        </p>
      </CardHeader>
      <CardContent>
        {availableTimeSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availableTimeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                className={`w-full py-2 text-base font-medium transition-all duration-200
                ${
                  slot.isAvailable
                    ? selectedTime === slot.time
                      ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                      : "border-purple-300 text-purple-700 hover:bg-purple-100"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                }`}
                onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
                disabled={!slot.isAvailable}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No hay horarios disponibles para este día. Por favor, selecciona
            otra fecha.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
