"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  List,
  TimerIcon as Timeline,
  Paperclip,
} from "lucide-react";
import {
  getMedicalRecordsByPatient,
  deleteMedicalRecord,
  type MedicalRecord,
} from "@/actions/medical-records";
import type { Patient } from "@/actions/patients";
import { AddMedicalRecordModal } from "./add-medical-record-modal";
import { EditMedicalRecordModal } from "./edit-medical-record-modal";
import { MedicalRecordsTimeline } from "./medical-records-timeline";
import { AttachmentsManager } from "./attachments-manager";

interface PatientMedicalRecordsProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientMedicalRecords({
  patient,
  isOpen,
  onClose,
}: PatientMedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "timeline">("timeline");
  const [viewingAttachments, setViewingAttachments] = useState<string | null>(
    null
  );

  const formatRut = (rut: string) => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) return cleaned;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted}-${dv}`;
  };

  const parseLocalDate = (dateString: string) => {
    // Parse date as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const formatDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getMedicalRecordsByPatient(patient.id);
      setRecords(data);
    } catch (error) {
      console.error("Error loading medical records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar esta ficha médica? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      await deleteMedicalRecord(id);
      loadRecords();
    } catch (error) {
      console.error("Error deleting medical record:", error);
      alert("Error al eliminar ficha médica");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, patient.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle>Fichas Médicas</DialogTitle>
              <div className="text-sm text-muted-foreground">
                Paciente:{" "}
                <span className="font-medium">
                  {patient.name || "Sin nombre"}
                </span>{" "}
                - {formatRut(patient.rut)}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Add Button and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Historial de Sesiones</h3>
              <p className="text-sm text-muted-foreground">
                {records.length}{" "}
                {records.length === 1
                  ? "ficha registrada"
                  : "fichas registradas"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <Tabs
                value={viewMode}
                onValueChange={(value) =>
                  setViewMode(value as "list" | "timeline")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="timeline"
                    className="flex items-center gap-2"
                  >
                    <Timeline className="h-4 w-4" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Lista
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[var(--color-prim)] hover:bg-[var(--color-prim-dark)] text-white"
              >
                <Plus className="h-4 w-4" />
                Nueva Ficha
              </Button>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-prim)] mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Cargando fichas médicas...
                </p>
              </div>
            </div>
          ) : records.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay fichas médicas registradas
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Comienza creando la primera ficha médica para este paciente
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-[var(--color-prim)] hover:bg-[var(--color-prim-dark)] text-white"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primera Ficha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "list" | "timeline")
              }
            >
              <TabsContent value="timeline" className="mt-6">
                <MedicalRecordsTimeline
                  records={records}
                  onEditRecord={setEditingRecord}
                  onDeleteRecord={handleDeleteRecord}
                />
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <div className="space-y-4">
                  {records.map((record) => (
                    <Card
                      key={record.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[var(--color-prim-very-lighter)] flex items-center justify-center dark:bg-[var(--color-prim-darker)]/30">
                              <FileText className="h-5 w-5 text-[var(--color-prim)]" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formatDate(record.session_date)}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                Creada: {formatTimestamp(record.created_at)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingAttachments(record.id)}
                              className="hover:bg-[var(--color-prim-very-lighter)] hover:text-[var(--color-prim)]"
                              title="Ver archivos adjuntos"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRecord(record)}
                              className="hover:bg-[var(--color-prim-very-lighter)] hover:text-[var(--color-prim)]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Notas de la Sesión:
                            </h4>
                            <p className="text-sm text-foreground">
                              {record.session_notes}
                            </p>
                          </div>

                          {record.diagnosis && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                Diagnóstico:
                              </h4>
                              <p className="text-sm text-foreground">
                                {record.diagnosis}
                              </p>
                            </div>
                          )}

                          {record.treatment && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                Tratamiento:
                              </h4>
                              <p className="text-sm text-foreground">
                                {record.treatment}
                              </p>
                            </div>
                          )}

                          {record.observations && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                Observaciones:
                              </h4>
                              <p className="text-sm text-foreground">
                                {record.observations}
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <AttachmentsManager
                              medicalRecordId={record.id}
                              canDelete={true}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Modals */}
        <AddMedicalRecordModal
          patient={patient}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadRecords}
        />

        {editingRecord && (
          <EditMedicalRecordModal
            record={editingRecord}
            isOpen={!!editingRecord}
            onClose={() => setEditingRecord(null)}
            onSuccess={loadRecords}
          />
        )}

        {viewingAttachments && (
          <Dialog
            open={!!viewingAttachments}
            onOpenChange={() => setViewingAttachments(null)}
          >
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Archivos Adjuntos</DialogTitle>
              </DialogHeader>
              <AttachmentsManager
                medicalRecordId={viewingAttachments}
                canDelete={true}
              />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
