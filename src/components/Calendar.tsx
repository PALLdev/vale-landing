"use client";
import { useRef } from "react";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { TimeSlotsPanel } from "@/components/calendar/time-slots-panel";
import { AppointmentForm } from "@/components/calendar/appointment-form";

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
    isPast,
    isToday,
    isSameDay,
    format,
    es,
  } = useCalendarLogic();

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
        handleDateSelect={handleDateSelectAndScroll} // Usar la función modificada
        isPast={isPast}
        isToday={isToday}
        isSameDay={isSameDay}
        format={format}
        es={es}
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
          />
        )}
      </div>
    </div>
  );
}
