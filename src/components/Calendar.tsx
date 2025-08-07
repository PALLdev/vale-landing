"use client";
import { useRef } from "react";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { TimeSlotsPanel } from "@/components/calendar/time-slots-panel";
import { AppointmentForm } from "@/components/calendar/appointment-form";
import { Loader2 } from "lucide-react";

export function CalendarSystem() {
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
    maxSelectableDate, // Importar maxSelectableDate
  } = useCalendarLogic(false); // Pasar false para la vista pública

  // Referencia para el panel lateral
  const sidePanelRef = useRef<HTMLDivElement>(null);

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

  if (isLoadingAppointments) {
    return (
      <div className="flex justify-center items-center h-[650px] text-purple-600">
        <Loader2 className="h-10 w-10 animate-spin mr-2" />
        <span className="text-xl font-semibold">
          Cargando horarios disponibles...
        </span>{" "}
        {/* Modificado aquí */}
      </div>
    );
  }

  return (
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
        showAppointmentIndicator={false}
        maxSelectableDate={maxSelectableDate} // Pasar maxSelectableDate
      />

      {/* Columna del Panel Lateral (Horarios O Formulario) */}
      <div className="space-y-8 scroll-mt-20" ref={sidePanelRef}>
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
            handleBookAppointment={handleBookAppointment}
            setSelectedTime={setSelectedTime}
            format={format}
            isBooking={isBooking}
            setFormErrors={setFormErrors}
          />
        )}
      </div>
    </div>
  );
}
