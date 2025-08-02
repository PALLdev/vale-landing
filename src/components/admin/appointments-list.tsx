"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isSameDay } from "date-fns";
import type { es } from "date-fns/locale";
import type { Appointment } from "@/types/calendar";
import {
  Clock,
  Mail,
  Phone,
  User,
  Info,
  ClipboardList,
  CalendarIcon,
} from "lucide-react"; // Importar CalendarIcon

interface AppointmentsListProps {
  selectedDate: Date | null;
  appointments: Appointment[];
  format: (
    date: Date,
    formatStr: string,
    options?: { locale?: typeof es }
  ) => string;
  es: typeof es;
}

export function AppointmentsList({
  selectedDate,
  appointments,
  format: formatFn,
  es,
}: AppointmentsListProps) {
  const filteredAppointments = selectedDate
    ? appointments.filter((appt) => isSameDay(appt.date, selectedDate))
    : [];

  if (!selectedDate) {
    return (
      <Card className="shadow-lg border-purple-100 flex items-center justify-center min-h-[200px]">
        <CardContent className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Selecciona un día en el calendario para ver las citas agendadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-purple-100 min-h-[400px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-purple-600" />
          {`Citas para el ${formatFn(selectedDate, "dd MMMM yyyy", {
            locale: es,
          })}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredAppointments.length === 0 && (
          <p className="text-gray-700 text-center py-4">
            No hay citas agendadas para este día.
          </p>
        )}

        {filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <Card key={appt.id} className="border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold">{appt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-500" />
                      <span>{appt.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" />
                      <span>{appt.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span>{appt.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-full">
                      <Info className="h-4 w-4 text-purple-500" />
                      <span>
                        Tipo:{" "}
                        {appt.consultationType === "ingreso"
                          ? "Ingreso"
                          : "Seguimiento"}
                      </span>
                    </div>
                    {appt.notes && (
                      <div className="flex items-start gap-2 col-span-full">
                        <ClipboardList className="h-4 w-4 text-purple-500 mt-1" />
                        <p className="flex-1">Notas: {appt.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm">
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
