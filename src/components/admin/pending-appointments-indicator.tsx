"use client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/types/calendar";

interface PendingAppointmentsIndicatorProps {
  appointments: Appointment[];
  onConfirmAppointment?: (appointmentId: string) => void;
  onCancelAppointment?: (appointmentId: string) => void;
  onViewAppointment?: (appointment: Appointment) => void;
}

export function PendingAppointmentsIndicator({
  appointments,
  onConfirmAppointment,
  onCancelAppointment,
  onViewAppointment,
}: PendingAppointmentsIndicatorProps) {
  // Filtrar solo las citas pendientes
  const pendingAppointments = useMemo(() => {
    return appointments.filter((appt) => appt.status === "pendiente");
  }, [appointments]);

  // Ordenar por fecha y hora más próxima
  const sortedPendingAppointments = useMemo(() => {
    return [...pendingAppointments].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      // Si es el mismo día, ordenar por hora
      return a.time.localeCompare(b.time);
    });
  }, [pendingAppointments]);

  if (pendingAppointments.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              ¡Todas las citas están confirmadas!
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Citas Pendientes de Confirmación
          <Badge variant="secondary" className="bg-orange-200 text-orange-800">
            {pendingAppointments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedPendingAppointments.slice(0, 5).map((appointment) => (
          <Card key={appointment.id} className="border-orange-200 bg-white">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  {/* Nombre del cliente */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900">
                      {appointment.clientName}
                    </span>
                  </div>

                  {/* Fecha y hora */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span>
                      {format(appointment.date, "dd MMM yyyy", { locale: es })}
                    </span>
                    <Clock className="h-4 w-4 text-orange-600 ml-2" />
                    <span>{appointment.time}</span>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-orange-600" />
                    <span>{appointment.clientPhone}</span>
                  </div>

                  {/* Tipo de consulta */}
                  <div className="text-xs text-gray-500">
                    {appointment.consultationType === "ingreso"
                      ? "Ingreso"
                      : "Seguimiento"}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-7 px-2 text-xs"
                    onClick={() => onConfirmAppointment?.(appointment.id)}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 h-7 px-2 text-xs"
                    onClick={() => onCancelAppointment?.(appointment.id)}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                  {onViewAppointment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
                      onClick={() => onViewAppointment(appointment)}
                    >
                      Ver más
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mostrar mensaje si hay más citas pendientes */}
        {pendingAppointments.length > 5 && (
          <div className="text-center text-sm text-orange-700 pt-2">
            Y {pendingAppointments.length - 5} citas pendientes más...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
