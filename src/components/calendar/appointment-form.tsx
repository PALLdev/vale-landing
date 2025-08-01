"use client";

import type React from "react";
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
import { Label } from "@/components/ui/label";
import { User, ArrowLeft } from "lucide-react";
import type { Locale } from "date-fns";
import { es } from "date-fns/locale";

interface AppointmentFormProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  clientName: string;
  setClientName: (name: string) => void;
  clientEmail: string;
  setClientEmail: (email: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  consultationType: "ingreso" | "seguimiento" | "";
  setConsultationType: (type: "ingreso" | "seguimiento") => void;
  notes: string;
  setNotes: (notes: string) => void;
  formErrors: { [key: string]: string };
  handleBookAppointment: (e: React.FormEvent) => void;
  setSelectedTime: (time: string | null) => void;
  format: (
    date: Date,
    formatStr: string,
    options?: { locale?: Locale }
  ) => string;
}

export function AppointmentForm({
  selectedDate,
  selectedTime,
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  consultationType,
  setConsultationType,
  notes,
  setNotes,
  formErrors,
  handleBookAppointment,
  setSelectedTime,
  format,
}: AppointmentFormProps) {
  if (!selectedDate || !selectedTime) {
    // Esto no debería ocurrir si el componente se renderiza condicionalmente
    return null;
  }

  return (
    <Card className="shadow-lg border-purple-100">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Confirma tu Cita
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTime(null)}
            className="text-purple-600 hover:text-purple-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
        </div>
        <p className="text-gray-600 text-sm">
          Completa tus datos para agendar tu cita el{" "}
          <span className="font-semibold text-purple-700">
            {format(selectedDate, "dd MMMM yyyy", { locale: es })}
          </span>{" "}
          a las{" "}
          <span className="font-semibold text-purple-700">{selectedTime}</span>.
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
                <SelectItem value="ingreso">Consulta de Ingreso</SelectItem>
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
            disabled={Object.keys(formErrors).length > 0}
          >
            Confirmar Cita
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
