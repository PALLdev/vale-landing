"use client";

import type React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isPast,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  User,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// --- Tipos de Datos ---
interface Appointment {
  id: string;
  date: Date;
  time: string; // e.g., "09:00"
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  consultationType: "ingreso" | "seguimiento";
  notes?: string;
  status: "confirmada" | "pendiente";
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

// --- Datos de Ejemplo (para demostración) ---
const initialAppointments: Appointment[] = [
  {
    id: "1",
    date: new Date(2025, 7, 10, 9, 0), // Agosto 10, 2025, 9:00 AM
    time: "09:00",
    clientName: "Ana Torres",
    clientEmail: "ana.t@example.com",
    clientPhone: "987654321",
    consultationType: "ingreso",
    status: "confirmada",
  },
  {
    id: "2",
    date: new Date(2025, 7, 10, 10, 30), // Agosto 10, 2025, 10:30 AM
    time: "10:30",
    clientName: "Pedro Ruiz",
    clientEmail: "pedro.r@example.com",
    clientPhone: "912345678",
    consultationType: "seguimiento",
    status: "pendiente",
  },
  {
    id: "3",
    date: new Date(2025, 7, 15, 14, 0), // Agosto 15, 2025, 2:00 PM
    time: "14:00",
    clientName: "Laura Gómez",
    clientEmail: "laura.g@example.com",
    clientPhone: "955554444",
    consultationType: "ingreso",
    status: "confirmada",
  },
];

// --- Componente Principal del Calendario ---
export function CalendarSystem() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Formulario de reserva
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [consultationType, setConsultationType] = useState<
    "ingreso" | "seguimiento" | ""
  >("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    if (isPast(date) && !isToday(date)) {
      toast.error("Fecha no disponible", {
        description: "No puedes seleccionar fechas pasadas.",
      });
      return;
    }
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const generateTimeSlots = useCallback(
    (date: Date | null): TimeSlot[] => {
      if (!date) return [];

      const slots: TimeSlot[] = [];
      const now = new Date();
      const isSelectedDateToday = isSameDay(date, now);

      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = `${String(hour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`;
          const slotDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hour,
            minute
          );

          const isOccupied = appointments.some(
            (appt) => isSameDay(appt.date, date) && appt.time === slotTime
          );

          const isPastTime = isSelectedDateToday && slotDate < now;

          slots.push({
            time: slotTime,
            isAvailable: !isOccupied && !isPastTime,
          });
        }
      }
      return slots;
    },
    [appointments]
  );

  const availableTimeSlots = useMemo(
    () => generateTimeSlots(selectedDate),
    [selectedDate, generateTimeSlots]
  );

  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};
    if (!clientName.trim()) errors.clientName = "El nombre es obligatorio.";
    if (!clientEmail.trim()) errors.clientEmail = "El email es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(clientEmail))
      errors.clientEmail = "Formato de email inválido.";
    if (!clientPhone.trim()) errors.clientPhone = "El teléfono es obligatorio.";
    else if (!/^\d{9,}$/.test(clientPhone))
      errors.clientPhone = "Formato de teléfono inválido (mínimo 9 dígitos).";
    if (!consultationType)
      errors.consultationType = "El tipo de consulta es obligatorio.";
    if (!selectedDate) errors.selectedDate = "Debes seleccionar una fecha.";
    if (!selectedTime) errors.selectedTime = "Debes seleccionar una hora.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    clientName,
    clientEmail,
    clientPhone,
    consultationType,
    selectedDate,
    selectedTime,
  ]);

  const handleBookAppointment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) {
        toast.error("Error de validación", {
          description: "Por favor, completa todos los campos obligatorios.",
        });
        return;
      }

      if (!selectedDate || !selectedTime) {
        toast.error("Error", {
          description:
            "Fecha u hora no seleccionada. Por favor, selecciona una fecha y hora.",
        });
        return;
      }

      const newAppointment: Appointment = {
        id: String(appointments.length + 1),
        date: new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          Number.parseInt(selectedTime.split(":")[0]),
          Number.parseInt(selectedTime.split(":")[1])
        ),
        time: selectedTime,
        clientName,
        clientEmail,
        clientPhone,
        consultationType: consultationType as "ingreso" | "seguimiento",
        notes,
        status: "pendiente", // Nueva cita por defecto como pendiente
      };

      setAppointments((prev) => [...prev, newAppointment]);
      toast.success("Cita Agendada con Éxito", {
        description: `Tu cita para el ${format(selectedDate, "dd/MM/yyyy", {
          locale: es,
        })} a las ${selectedTime} ha sido agendada. Recibirás un email de confirmación.`,
      });

      // Reset form
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setConsultationType("");
      setNotes("");
      setSelectedTime(null);
      setSelectedDate(null); // Reset selected date after booking
      setFormErrors({});
    },
    [
      validateForm,
      selectedDate,
      selectedTime,
      clientName,
      clientEmail,
      clientPhone,
      consultationType,
      notes,
      appointments.length,
    ]
  );

  const formatedDate = format(currentMonth, "MMMM yyyy", {
    locale: es,
  });

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
      {/* Columna Principal del Calendario */}
      <Card className="shadow-lg border-prim-very-lighter h-[635px]">
        {" "}
        {/* Altura fija para el calendario */}
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-prim" />
            Selecciona tu Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Navegación del Mes */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5 text-prim" />
            </Button>
            <h3 className="text-xl font-semibold text-gray-900">
              {formatedDate.charAt(0).toUpperCase() + formatedDate.slice(1)}
            </h3>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5 text-prim" />
            </Button>
          </div>

          {/* Días de la Semana */}
          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Días del Mes */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12"></div>
            ))}
            {daysInMonth.map((day, index) => {
              const isDisabled = isPast(day) && !isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`h-12 w-full flex flex-col items-center justify-center relative rounded-lg transition-all duration-200
                  ${
                    isDisabled
                      ? "text-gray-400 cursor-not-allowed opacity-60"
                      : "hover:bg-purple-50"
                  }
                  ${
                    isSelected
                      ? "bg-prim text-white hover:bg-prim-dark shadow-md"
                      : ""
                  }
                  ${
                    isCurrentDay && !isSelected
                      ? "border-2 border-prim-lighter text-prim-dark font-semibold"
                      : ""
                  }
                `}
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                >
                  <span
                    className={`${isSelected ? "text-white" : "text-gray-900"}`}
                  >
                    {format(day, "d")}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Leyenda del Calendario */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-600 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-prim rounded-lg"></span>
              <span>Día seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-prim-lighter rounded-lg"></span>
              <span>Día actual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-400 rounded-lg opacity-60"></span>
              <span>Día no disponible</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Columna del Panel Lateral (Horarios O Formulario) */}
      <div className="space-y-8">
        {/* Condicional: Mostrar Horarios o Formulario */}
        {!selectedDate ? (
          <Card className="shadow-lg border-prim-very-lighter flex items-center justify-center min-h-[200px]">
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-prim-lighter mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                Selecciona una fecha en el calendario para ver los horarios
                disponibles.
              </p>
            </CardContent>
          </Card>
        ) : !selectedTime ? (
          <Card className="shadow-lg border-prim-very-lighter">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-prim" />
                Horarios Disponibles
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Selecciona una hora para el{" "}
                <span className="font-semibold text-prim-dark">
                  {format(selectedDate, "dd MMMM yyyy", { locale: es })}
                </span>
                :
              </p>
            </CardHeader>
            <CardContent>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={
                        selectedTime === slot.time ? "default" : "outline"
                      }
                      className={`w-full py-2 text-base font-medium transition-all duration-200
                      ${
                        slot.isAvailable
                          ? selectedTime === slot.time
                            ? "bg-prim text-white hover:bg-prim-dark shadow-md"
                            : "border-purple-300 text-prim-dark hover:bg-prim-very-lighter"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                      }`}
                      onClick={() =>
                        slot.isAvailable && handleTimeSelect(slot.time)
                      }
                      disabled={!slot.isAvailable}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay horarios disponibles para este día. Por favor,
                  selecciona otra fecha.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-prim-very-lighter">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-prim" />
                  Confirma tu Cita
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTime(null)}
                  className="text-prim hover:text-purple-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </div>
              <p className="text-gray-600 text-sm">
                Completa tus datos para agendar tu cita el{" "}
                <span className="font-semibold text-prim-dark">
                  {format(selectedDate, "dd MMMM yyyy", { locale: es })}
                </span>{" "}
                a las{" "}
                <span className="font-semibold text-prim-dark">
                  {selectedTime}
                </span>
                .
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <Label
                    htmlFor="client-name"
                    className="text-gray-700 flex items-center gap-1"
                  >
                    Nombre Completo
                  </Label>
                  <Input
                    id="client-name"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Tu nombre"
                    className="mt-1"
                  />
                  {formErrors.clientName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.clientName}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="client-email"
                    className="text-gray-700 flex items-center gap-1"
                  >
                    Email
                  </Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="tu.email@ejemplo.com"
                    className="mt-1"
                  />
                  {formErrors.clientEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.clientEmail}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="client-phone"
                    className="text-gray-700 flex items-center gap-1"
                  >
                    Teléfono
                  </Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 912345678"
                    className="mt-1"
                  />
                  {formErrors.clientPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.clientPhone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="consultation-type" className="text-gray-700">
                    Tipo de Consulta
                  </Label>
                  <Select
                    value={consultationType}
                    onValueChange={(value: "ingreso" | "seguimiento") =>
                      setConsultationType(value)
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Selecciona el tipo de consulta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">
                        Consulta de Ingreso
                      </SelectItem>
                      <SelectItem value="seguimiento">
                        Consulta de Seguimiento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.consultationType && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.consultationType}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-700">
                    Notas Adicionales (Opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Objetivos específicos, alergias, etc."
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-prim hover:bg-prim-dark text-white font-semibold py-3"
                  disabled={Object.keys(formErrors).length > 0}
                >
                  Confirmar Cita
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
