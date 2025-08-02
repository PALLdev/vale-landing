"use client";
import { useRef } from "react";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { AppointmentsList } from "@/components/admin/appointments-list";
import { Loader2 } from "lucide-react";

export function AdminCalendarPageContent() {
  const {
    currentMonth,
    selectedDate,
    appointments,
    daysInMonth,
    startingDayIndex,
    daysOfWeek,
    isLoadingAppointments,
    handlePrevMonth,
    handleNextMonth,
    handleDateSelect,
    isPast,
    isToday,
    isSameDay,
    format,
    es,
    isDayFullyBooked,
  } = useCalendarLogic();

  const appointmentsListRef = useRef<HTMLDivElement>(null);

  const handleDateSelectAndScroll = (date: Date) => {
    handleDateSelect(date); // Call original logic to set selectedDate
    if (appointmentsListRef.current) {
      appointmentsListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (isLoadingAppointments) {
    return (
      <div className="flex justify-center items-center h-[650px] text-purple-600">
        <Loader2 className="h-10 w-10 animate-spin mr-2" />
        <span className="text-xl font-semibold">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
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
      />

      <div className="space-y-8 scroll-mt-20" ref={appointmentsListRef}>
        <AppointmentsList
          selectedDate={selectedDate}
          appointments={appointments}
          format={format}
          es={es}
        />
      </div>
    </div>
  );
}
