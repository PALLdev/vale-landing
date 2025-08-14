"use client";
import { useRef, useCallback, useState } from "react";
import { useCalendarLogic } from "@/hooks/use-calendar-logic";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { AppointmentsList } from "@/components/admin/appointments-list";
import { Loader2, PlusCircle } from "lucide-react";
import { getAppointments } from "@/actions/appointments";
import { getAvailabilityBlocks } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import { AdminBookingModal } from "@/components/admin/admin-booking-modal";
import { AvailabilityManager } from "@/components/admin/availability-manager";
import { PendingAppointmentsIndicator } from "@/components/admin/pending-appointments-indicator";
import { updateAppointmentStatus } from "@/actions/appointments";
import { toast } from "sonner";
import type { Appointment } from "@/types/calendar";

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
    maxSelectableDate,
    availabilityBlocks,
    setAvailabilityBlocks,
  } = useCalendarLogic(true);

  const appointmentsListRef = useRef<HTMLDivElement>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialBookingDate, setInitialBookingDate] = useState<
    Date | undefined
  >(undefined);

  const handleDateSelectAndScroll = (date: Date) => {
    handleDateSelect(date);
    if (appointmentsListRef.current) {
      appointmentsListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Función para recargar las citas Y los bloqueos de disponibilidad
  const refetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    try {
      // Cargar tanto las citas como los bloqueos de disponibilidad
      const [fetchedAppointments, fetchedBlocks] = await Promise.all([
        getAppointments(),
        getAvailabilityBlocks(),
      ]);
      setAppointments(fetchedAppointments);
      setAvailabilityBlocks(fetchedBlocks); // Actualizar también los bloqueos
    } catch (error) {
      console.error("Error refetching data:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [setAppointments, setIsLoadingAppointments, setAvailabilityBlocks]);

  // Función para abrir el modal de agendamiento con una fecha inicial
  const handleOpenBookingModal = useCallback((date?: Date) => {
    setInitialBookingDate(date);
    setIsBookingModalOpen(true);
  }, []);

  const handleConfirmFromIndicator = async (appointmentId: string) => {
    const response = await updateAppointmentStatus(appointmentId, "confirmada");

    if (response.success) {
      const appointment = appointments.find(
        (appt) => appt.id === appointmentId
      );
      if (appointment) {
        toast.success("Cita Confirmada", {
          description: `La cita de ${appointment.clientName} ha sido confirmada exitosamente.`,
        });

        // Send WhatsApp notification
        const formattedDate = format(appointment.date, "dd MMMM yyyy", {
          locale: es,
        });
        const message = encodeURIComponent(
          `¡Hola ${
            appointment.clientName
          }!\n\nTu cita nutricional ha sido *CONFIRMADA*.\n\n*Detalles:*\nFecha: ${formattedDate}\nHora: ${
            appointment.time
          }\nTipo: ${
            appointment.consultationType === "ingreso"
              ? "Ingreso"
              : "Seguimiento"
          }\n\n¡Te esperamos!`
        );
        const whatsappLink = `https://wa.me/${appointment.clientPhone}?text=${message}`;
        window.open(whatsappLink, "_blank");
      }

      refetchAppointments();
    } else {
      toast.error("Error al Confirmar Cita", {
        description:
          response.message || "No se pudo confirmar la cita. Intenta de nuevo.",
      });
    }
  };

  const handleCancelFromIndicator = async (appointmentId: string) => {
    const response = await updateAppointmentStatus(appointmentId, "cancelada");

    if (response.success) {
      const appointment = appointments.find(
        (appt) => appt.id === appointmentId
      );
      if (appointment) {
        toast.success("Cita Cancelada", {
          description: `La cita de ${appointment.clientName} ha sido cancelada exitosamente.`,
        });

        // Send WhatsApp notification
        const formattedDate = format(appointment.date, "dd MMMM yyyy", {
          locale: es,
        });
        const message = encodeURIComponent(
          `¡Hola ${appointment.clientName}!\n\nTu cita nutricional para el ${formattedDate} a las ${appointment.time} ha sido *CANCELADA*.\n\nSi deseas reagendar, por favor visita nuestra página de agendamiento.`
        );
        const whatsappLink = `https://wa.me/${appointment.clientPhone}?text=${message}`;
        window.open(whatsappLink, "_blank");
      }

      refetchAppointments();
    } else {
      toast.error("Error al Cancelar Cita", {
        description:
          response.message || "No se pudo cancelar la cita. Intenta de nuevo.",
      });
    }
  };

  const handleViewFromIndicator = (appointment: Appointment) => {
    // Find the date and select it to show the appointment in the list
    handleDateSelect(appointment.date);
    // Scroll to appointments list
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
    <>
      <div className="mb-6">
        <PendingAppointmentsIndicator
          appointments={appointments}
          onConfirmAppointment={handleConfirmFromIndicator}
          onCancelAppointment={handleCancelFromIndicator}
          onViewAppointment={handleViewFromIndicator}
        />
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => handleOpenBookingModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Agendar Nueva Cita
        </Button>
      </div>

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
          maxSelectableDate={maxSelectableDate}
          availabilityBlocks={availabilityBlocks}
          isAdminView={true} // Pasar isAdminView como true
        />

        <div className="space-y-8 scroll-mt-20" ref={appointmentsListRef}>
          <AppointmentsList
            selectedDate={selectedDate}
            appointments={appointments}
            format={format}
            es={es}
            onAppointmentUpdated={refetchAppointments}
            onBookNewAppointment={handleOpenBookingModal}
          />
        </div>
      </div>

      <div className="mt-8">
        <AvailabilityManager
          onAvailabilityChange={refetchAppointments}
          showOnlyRecent={true}
        />
      </div>

      <AdminBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onAppointmentBooked={refetchAppointments}
        initialDate={initialBookingDate}
      />
    </>
  );
}
