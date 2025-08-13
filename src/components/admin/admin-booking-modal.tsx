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
import { useEffect, useRef } from "react";

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
    setSelectedDate,
    setCurrentMonth,
    maxSelectableDate,
    availabilityBlocks,
  } = useCalendarLogic(true); // Pasar true para la vista de administrador

  // Referencia para el panel lateral
  const sidePanelRef = useRef<HTMLDivElement>(null);

  // Efecto para establecer la fecha inicial cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setSelectedDate(initialDate);
        setCurrentMonth(initialDate); // Establecer el mes actual del calendario del modal a la fecha inicial
      } else {
        // Si el modal se abre sin initialDate, resetear a la fecha/mes actual
        setSelectedDate(null); // No seleccionar ninguna fecha
        setCurrentMonth(new Date()); // Mostrar el mes actual
      }
    } else {
      // Resetear la fecha seleccionada y los campos del formulario cuando el modal se cierra
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
    setCurrentMonth,
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

  // Modificar handleDateSelect para incluir el scroll
  const handleDateSelectAndScroll = (date: Date) => {
    handleDateSelect(date); // Llama a la lógica original del hook
    if (sidePanelRef.current) {
      sidePanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // NUEVA FUNCIÓN: Modificar handleTimeSelect para incluir el scroll
  const handleTimeSelectAndScroll = (time: string) => {
    handleTimeSelect(time); // Llama a la lógica original del hook
    // Esperar un pequeño momento para que el DOM se actualice y el formulario sea visible
    setTimeout(() => {
      if (sidePanelRef.current) {
        sidePanelRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100); // Pequeño retraso para asegurar que el componente se ha renderizado
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[768px] lg:max-w-[1000px] lg:pr-0 pr-2 pl-4 py-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-scroll">
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
              handleDateSelect={handleDateSelectAndScroll}
              isPast={isPast}
              isToday={isToday}
              isSameDay={isSameDay}
              format={format}
              es={es}
              isDayFullyBooked={isDayFullyBooked}
              appointments={appointments}
              showAppointmentIndicator={true}
              maxSelectableDate={maxSelectableDate}
              availabilityBlocks={availabilityBlocks}
              isAdminView={true} // Pasar isAdminView como true para el modal también
            />

            {/* Columna del Panel Lateral (Horarios O Formulario) */}
            <div className="space-y-8 scroll-mt-20" ref={sidePanelRef}>
              {!selectedDate || !selectedTime ? (
                <TimeSlotsPanel
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableTimeSlots={availableTimeSlots}
                  handleTimeSelect={handleTimeSelectAndScroll} // Aquí se usa la nueva función con scroll
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
