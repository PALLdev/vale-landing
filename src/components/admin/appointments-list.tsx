"use client";
import { useState } from "react";
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
  Eye,
  Pencil,
  Trash,
  Loader2,
  PlusCircle,
  CalendarIcon,
} from "lucide-react";
import { AppointmentModal } from "@/components/admin/appointments-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteAppointment } from "@/actions/appointments";

interface AppointmentsListProps {
  selectedDate: Date | null;
  appointments: Appointment[];
  format: (
    date: Date,
    formatStr: string,
    options?: { locale?: typeof es }
  ) => string;
  es: typeof es;
  onAppointmentUpdated: () => void;
  onBookNewAppointment: (date: Date) => void;
}

export function AppointmentsList({
  selectedDate,
  appointments,
  format: formatFn,
  es,
  onAppointmentUpdated,
  onBookNewAppointment,
}: AppointmentsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentForModal, setSelectedAppointmentForModal] =
    useState<Appointment | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAppointments = selectedDate
    ? appointments.filter((appt) => isSameDay(appt.date, selectedDate))
    : [];

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointmentForModal(appointment);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointmentForModal(appointment);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointmentForModal(null);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;

    setIsDeleting(true);
    const response = await deleteAppointment(appointmentToDelete.id);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);

    if (response.success) {
      toast.success("Cita Eliminada", {
        description: `La cita de ${appointmentToDelete.clientName} ha sido eliminada exitosamente.`,
      });
      onAppointmentUpdated();
    } else {
      toast.error("Error al Eliminar Cita", {
        description:
          response.message || "No se pudo eliminar la cita. Intenta de nuevo.",
      });
    }
    setAppointmentToDelete(null);
  };

  return (
    <>
      <Card
        className={`shadow-lg border-purple-100 ${
          !selectedDate ? "flex items-center justify-center min-h-[200px]" : ""
        }`}
      >
        {!selectedDate ? (
          <CardContent className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              Selecciona un día en el calendario para ver las citas agendadas.
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-purple-600" />
                {`Citas para el ${formatFn(selectedDate, "dd MMMM yyyy", {
                  locale: es,
                })}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-0">
                  <p className="text-gray-700 text-center mb-4">
                    No hay citas agendadas para este día
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appt) => (
                    <Card key={appt.id} className="border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {/* Hora */}
                          <div className="flex items-center min-w-0">
                            <Clock className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="font-semibold">{appt.time}</span>
                          </div>
                          {/* Nombre Completo */}
                          <div className="flex items-center min-w-0">
                            <User className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1 w-0">
                              {appt.clientName}
                            </span>
                          </div>
                          {/* Email */}
                          <div className="flex items-center min-w-0">
                            <Mail className="h-4 w-4 text-purple-500 mr-2" />
                            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1 w-0">
                              {appt.clientEmail}
                            </span>
                          </div>
                          {/* Teléfono */}
                          <div className="flex items-center min-w-0">
                            <Phone className="h-4 w-4 text-purple-500 mr-2" />
                            <span>{appt.clientPhone}</span>
                          </div>
                          {/* Tipo de Consulta */}
                          <div className="flex items-center col-span-full min-w-0">
                            <Info className="h-4 w-4 text-purple-500 mr-2" />
                            <span>
                              Tipo:{" "}
                              {appt.consultationType === "ingreso"
                                ? "Ingreso"
                                : "Seguimiento"}
                            </span>
                          </div>
                          {/* Notas Adicionales */}
                          {appt.notes && (
                            <div className="flex items-start gap-2 col-span-full min-w-0">
                              <ClipboardList className="h-4 w-4 text-purple-500 mt-1" />
                              <p className="flex-1 w-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                Notas: {appt.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(appt)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Ver Detalles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAppointment(appt)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(appt)}
                          >
                            <Trash className="h-4 w-4 mr-1" /> Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <div
              className={`px-6 pb-2 flex ${
                filteredAppointments.length > 0
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              <Button
                onClick={() =>
                  selectedDate && onBookNewAppointment(selectedDate)
                }
                className="bg-purple-600 hover:bg-purple-700 text-white w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Agendar Nueva Cita
              </Button>
            </div>
          </>
        )}
      </Card>

      {selectedAppointmentForModal && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          appointment={selectedAppointmentForModal}
          mode={modalMode}
          onSaveSuccess={onAppointmentUpdated}
          allAppointments={appointments}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la cita de{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {appointmentToDelete?.clientName}
              </span>{" "}
              para el{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {appointmentToDelete
                  ? formatFn(appointmentToDelete.date, "dd MMMM yyyy", {
                      locale: es,
                    })
                  : ""}
              </span>{" "}
              a las{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {appointmentToDelete?.time}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              asChild
            >
              <Button variant="destructive">
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Eliminando...
                  </>
                ) : (
                  "Sí, eliminar cita"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
