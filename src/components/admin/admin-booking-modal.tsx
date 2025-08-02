"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { TimeSlotsPanel } from "@/components/calendar/time-slots-panel";
import { AppointmentForm } from "@/components/calendar/appointment-form";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: () => void; // Callback para recargar citas en la vista de admin
  initialDate?: Date; // Nuevo prop para la fecha inicial
}

export function AdminBookingModal({
  isOpen,
  onClose,
  onAppointmentBooked,
  initialDate,
}: AdminBookingModalProps) {
  const {
    currentMonth,
    selectedDate,
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
    handlePrevMonth,
    handleNextMonth,
    handleDateSelect,
    handleTimeSelect,
    handleBookAppointment,
    setSelectedTime,
    setClientName,
    setClientEmail,
    setClientPhone,
    setConsultationType,
    setNotes,
    setFormErrors,
    isPast,
    isToday,
    isSameDay,
    format,
    es,
    isDayFullyBooked,
    appointments,
    setSelectedDate, // Importar setSelectedDate del hook
  } = useCalendarLogic();

  // Efecto para establecer la fecha inicial cuando el modal se abre
  useEffect(() => {
    if (isOpen && initialDate) {
      setSelectedDate(initialDate);
    } else if (!isOpen) {
      // Resetear la fecha seleccionada cuando el modal se cierra
      setSelectedDate(null);
      setSelectedTime(null);
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setConsultationType("");
      setNotes("");
      setFormErrors({});
    }
  }, [
    isOpen,
    initialDate,
    setSelectedDate,
    setSelectedTime,
    setClientName,
    setClientEmail,
    setClientPhone,
    setConsultationType,
    setNotes,
    setFormErrors,
  ]);

  // Modificar handleBookAppointment para cerrar el modal y recargar citas
  const handleBookAppointmentAndClose = async (e: React.FormEvent) => {
    const success = await handleBookAppointment(e);
    if (success) {
      onAppointmentBooked(); // Recargar citas en el componente padre
      onClose(); // Cerrar el modal
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[768px] lg:max-w-[1000px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300">
            Agendar Nueva Cita
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Selecciona una fecha y hora, y completa los datos del cliente para
            agendar una nueva cita.
          </DialogDescription>
        </DialogHeader>

        {isLoadingAppointments ? (
          <div className="flex justify-center items-center h-[400px] text-purple-600">
            <Loader2 className="h-10 w-10 animate-spin mr-2" />
            <span className="text-xl font-semibold">
              Cargando horarios disponibles...
            </span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            {/* Columna Principal del Calendario */}
            <CalendarGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              daysInMonth={daysInMonth}
              startingDayIndex={startingDayIndex}
              daysOfWeek={daysOfWeek}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              handleDateSelect={handleDateSelect}
              isPast={isPast}
              isToday={isToday}
              isSameDay={isSameDay}
              format={format}
              es={es}
              isDayFullyBooked={isDayFullyBooked}
              appointments={appointments}
              showAppointmentIndicator={true}
            />

            {/* Columna del Panel Lateral (Horarios O Formulario) */}
            <div className="space-y-8">
              {!selectedDate || !selectedTime ? (
                <TimeSlotsPanel
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableTimeSlots={availableTimeSlots}
                  handleTimeSelect={handleTimeSelect}
                  format={format}
                  es={es}
                />
              ) : (
                <AppointmentForm
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  clientName={clientName}
                  setClientName={setClientName}
                  clientEmail={clientEmail}
                  setClientEmail={setClientEmail}
                  clientPhone={clientPhone}
                  setClientPhone={setClientPhone}
                  consultationType={consultationType}
                  setConsultationType={setConsultationType}
                  notes={notes}
                  setNotes={setNotes}
                  formErrors={formErrors}
                  handleBookAppointment={handleBookAppointmentAndClose}
                  setSelectedTime={setSelectedTime}
                  format={format}
                  isBooking={isBooking}
                  setFormErrors={setFormErrors}
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
