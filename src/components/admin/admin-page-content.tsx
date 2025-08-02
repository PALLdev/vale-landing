"use client";
import { useRef, useCallback } from "react";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { AppointmentsList } from "@/components/admin/appointments-list";
import { Loader2 } from "lucide-react";
import { getAppointments } from "@/actions/appointments";

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
    setAppointments,
    setIsLoadingAppointments,
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

  // Función para recargar las citas
  const refetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    try {
      const fetchedAppointments = await getAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error refetching appointments:", error);
      // Opcional: mostrar un toast de error
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [setAppointments, setIsLoadingAppointments]);

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
          onAppointmentUpdated={refetchAppointments}
        />
      </div>
    </div>
  );
}
