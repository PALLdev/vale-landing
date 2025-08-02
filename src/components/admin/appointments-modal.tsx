"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Info,
  Clock,
  CalendarIcon,
  ClipboardList,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { appointmentSchema } from "@/schemas/appointment";
import { ZodError } from "zod";
import type { Appointment } from "@/types/calendar";
import { updateAppointment } from "@/actions/appointments";
import { generateTimeSlots } from "@/lib/calendar-helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  mode: "view" | "edit";
  onSaveSuccess: () => void;
  allAppointments: Appointment[];
}

export function AppointmentModal({
  isOpen,
  onClose,
  appointment,
  mode,
  onSaveSuccess,
  allAppointments,
}: AppointmentModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [consultationType, setConsultationType] = useState<
    "ingreso" | "seguimiento" | ""
  >("");
  const [notes, setNotes] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string[] | undefined;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isTimeSelectOpen, setIsTimeSelectOpen] = useState(false);

  const timeSelectTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (appointment) {
      setClientName(appointment.clientName);
      setClientEmail(appointment.clientEmail);
      setClientPhone(appointment.clientPhone);
      setConsultationType(appointment.consultationType);
      setNotes(appointment.notes || "");
      setSelectedTime(appointment.time);
      setSelectedDate(appointment.date);
      setFormErrors({});
    }
  }, [appointment]);

  const availableTimeSlots = useMemo(() => {
    if (!appointment || !selectedDate) return [];
    return generateTimeSlots(selectedDate, allAppointments, appointment.id);
  }, [appointment, allAppointments, selectedDate]);

  const getFirstError = (field: keyof typeof formErrors) => {
    const errors = formErrors[field];
    return errors && errors.length > 0 ? errors[0] : null;
  };

  const clearFieldError = (field: keyof typeof formErrors) => {
    if (formErrors[field]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [field]: undefined,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !selectedDate) return;

    const dataToValidate = {
      clientName,
      clientEmail,
      clientPhone,
      consultationType: consultationType as "ingreso" | "seguimiento",
      notes: notes || null,
      date: selectedDate,
      time: selectedTime,
    };

    try {
      appointmentSchema.parse(dataToValidate);
      setFormErrors({});
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors;
        setFormErrors(errors);
        toast.error("Error de validación", {
          description: "Por favor, revisa los campos marcados en rojo.",
        });
      } else {
        console.error("Unexpected validation error:", error);
        toast.error("Error inesperado", {
          description: "Ocurrió un error durante la validación del formulario.",
        });
      }
      return;
    }

    setIsSaving(true);
    const response = await updateAppointment(appointment.id, dataToValidate);
    setIsSaving(false);

    if (response.success) {
      toast.success("Cita Actualizada", {
        description: "Los cambios en la cita han sido guardados exitosamente.",
      });
      onSaveSuccess();
      onClose();
    } else {
      if (response.errors) {
        setFormErrors(
          response.errors as { [key: string]: string[] | undefined }
        );
      }
      toast.error("Error al Actualizar Cita", {
        description:
          response.message ||
          "No se pudieron guardar los cambios. Intenta de nuevo.",
      });
    }
  };

  if (!appointment) return null;

  const isViewMode = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-2xl font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
            {isViewMode ? (
              <>
                <ClipboardList className="h-6 w-6" /> Detalles de la Cita
              </>
            ) : (
              <>
                <ClipboardList className="h-6 w-6" /> Editar Cita
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {isViewMode
              ? "Revisa la información completa de la cita."
              : "Modifica los detalles de la cita y guarda los cambios."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <Label
                htmlFor="date"
                className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4 text-purple-500" /> Fecha
              </Label>
              {isViewMode ? (
                <Input
                  id="date"
                  value={
                    appointment
                      ? format(appointment.date, "dd MMMM yyyy", { locale: es })
                      : ""
                  }
                  readOnly
                  tabIndex={-1}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                />
              ) : (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedDate && "text-muted-foreground",
                        getFirstError("date") &&
                          "border-destructive ring-destructive/20 dark:ring-destructive/40"
                      )}
                      disabled={isSaving}
                      onClick={() => setPopoverOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "dd MMMM yyyy", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          if (
                            (isPast(date) && !isToday(date)) ||
                            date.getDay() === 0
                          ) {
                            toast.error("Fecha no disponible", {
                              description:
                                "No puedes seleccionar fechas pasadas o domingos.",
                            });
                            return;
                          }
                          setSelectedDate(date);
                          clearFieldError("date");
                          setSelectedTime("");
                          setPopoverOpen(false);
                          setIsTimeSelectOpen(true);
                          toast.info("Fecha actualizada", {
                            description:
                              "Por favor, selecciona una hora disponible para la nueva fecha.",
                            duration: 3000,
                          });
                        }
                      }}
                      initialFocus
                      locale={es}
                      disabled={(date) =>
                        (isPast(date) && !isToday(date)) || date.getDay() === 0
                      }
                    />
                  </PopoverContent>
                </Popover>
              )}
              {getFirstError("date") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFirstError("date")}
                </p>
              )}
            </div>

            {/* Hora */}
            <div>
              <Label
                htmlFor="time"
                className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
              >
                <Clock className="h-4 w-4 text-purple-500" /> Hora
              </Label>
              {isViewMode ? (
                <Input
                  id="time"
                  value={appointment.time}
                  readOnly
                  tabIndex={-1}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                />
              ) : (
                <Select
                  value={selectedTime}
                  onValueChange={(value) => {
                    setSelectedTime(value);
                    clearFieldError("time");
                  }}
                  disabled={isSaving}
                  open={isTimeSelectOpen}
                  onOpenChange={setIsTimeSelectOpen}
                >
                  <SelectTrigger
                    ref={timeSelectTriggerRef}
                    className="w-full mt-1"
                  >
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((slot) => (
                      <SelectItem
                        key={slot.time}
                        value={slot.time}
                        disabled={!slot.isAvailable}
                      >
                        {slot.time} {slot.isAvailable ? "" : "(Ocupado)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {getFirstError("time") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFirstError("time")}
                </p>
              )}
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <Label
              htmlFor="client-name"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <User className="h-4 w-4 text-purple-500" /> Nombre Completo
            </Label>
            <Input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                clearFieldError("clientName");
              }}
              readOnly={isViewMode}
              tabIndex={isViewMode ? -1 : undefined}
              placeholder="Nombre del cliente"
              className="mt-1"
            />
            {getFirstError("clientName") && (
              <p className="text-red-500 text-xs mt-1">
                {getFirstError("clientName")}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label
              htmlFor="client-email"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <Mail className="h-4 w-4 text-purple-500" /> Email
            </Label>
            <Input
              id="client-email"
              type="email"
              value={clientEmail}
              onChange={(e) => {
                setClientEmail(e.target.value);
                clearFieldError("clientEmail");
              }}
              readOnly={isViewMode}
              tabIndex={isViewMode ? -1 : undefined}
              placeholder="Email del cliente"
              className="mt-1"
            />
            {getFirstError("clientEmail") && (
              <p className="text-red-500 text-xs mt-1">
                {getFirstError("clientEmail")}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <Label
              htmlFor="client-phone"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <Phone className="h-4 w-4 text-purple-500" /> Teléfono
            </Label>
            <Input
              id="client-phone"
              type="tel"
              value={clientPhone}
              onChange={(e) => {
                setClientPhone(e.target.value);
                clearFieldError("clientPhone");
              }}
              readOnly={isViewMode}
              tabIndex={isViewMode ? -1 : undefined}
              placeholder="Teléfono del cliente"
              className="mt-1"
            />
            {getFirstError("clientPhone") && (
              <p className="text-red-500 text-xs mt-1">
                {getFirstError("clientPhone")}
              </p>
            )}
          </div>

          {/* Tipo de Consulta */}
          <div>
            <Label
              htmlFor="consultation-type"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              <Info className="h-4 w-4 text-purple-500" /> Tipo de Consulta
            </Label>
            {isViewMode ? (
              <Input
                id="consultation-type"
                value={
                  consultationType === "ingreso" ? "Ingreso" : "Seguimiento"
                }
                readOnly
                tabIndex={-1}
                className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
              />
            ) : (
              <Select
                value={consultationType}
                onValueChange={(value: "ingreso" | "seguimiento") => {
                  setConsultationType(value);
                  clearFieldError("consultationType");
                }}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecciona el tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Consulta de Ingreso</SelectItem>
                  <SelectItem value="seguimiento">
                    Consulta de Seguimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {getFirstError("consultationType") && (
              <p className="text-red-500 text-xs mt-1">
                {getFirstError("consultationType")}
              </p>
            )}
          </div>

          {/* Notas Adicionales */}
          <div>
            <Label
              htmlFor="notes"
              className="text-gray-700 dark:text-gray-300 flex items-center gap-1"
            >
              Notas Adicionales (Opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                clearFieldError("notes");
              }}
              readOnly={isViewMode}
              tabIndex={isViewMode ? -1 : undefined}
              placeholder="Ej: Objetivos específicos, alergias, etc."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              {isViewMode ? "Cerrar" : "Cancelar"}
            </Button>
            {!isViewMode && (
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
