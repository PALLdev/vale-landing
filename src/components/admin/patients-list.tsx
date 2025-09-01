"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getPatients,
  searchPatients,
  deletePatient,
  type Patient,
} from "@/actions/patients";
import { AddPatientModal } from "./add-patient-modal";
import { EditPatientModal } from "./edit-patient-modal";
import { PatientMedicalRecords } from "./patient-medical-records";

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingRecordsPatient, setViewingRecordsPatient] =
    useState<Patient | null>(null);

  const loadPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        loadPatients();
        return;
      }

      try {
        const results = await searchPatients(query);
        setPatients(results);
      } catch (error) {
        console.error("Error searching patients:", error);
      }
    },
    [loadPatients]
  );

  const handleDeletePatient = useCallback(
    async (id: string) => {
      if (
        !confirm(
          "¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer."
        )
      ) {
        return;
      }

      try {
        await deletePatient(id);
        loadPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("Error al eliminar paciente");
      }
    },
    [loadPatients]
  );

  const formatRut = useCallback((rut: string) => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) return cleaned;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted}-${dv}`;
  }, []);

  const handleOpenAddModal = useCallback(() => setIsAddModalOpen(true), []);
  const handleCloseAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const handleOpenEditModal = useCallback(
    (patient: Patient) => setEditingPatient(patient),
    []
  );
  const handleCloseEditModal = useCallback(() => setEditingPatient(null), []);
  const handleOpenRecordsModal = useCallback(
    (patient: Patient) => setViewingRecordsPatient(patient),
    []
  );
  const handleCloseRecordsModal = useCallback(
    () => setViewingRecordsPatient(null),
    []
  );

  const patientsGrid = useMemo(() => {
    if (patients.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? "No se encontraron pacientes"
                : "No hay pacientes registrados"}
            </h3>
            <p className="text-gray-600 text-center mb-4">
              {searchQuery
                ? "Intenta con otro término de búsqueda"
                : "Comienza agregando tu primer paciente"}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Primer Paciente
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-prim-very-lighter flex items-center justify-center">
                    <User className="h-5 w-5 text-prim" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {patient.name || "Sin nombre"}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {formatRut(patient.rut)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenRecordsModal(patient)}
                    title="Ver fichas médicas"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal(patient)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePatient(patient.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-gray-600">
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Teléfono:</span>
                    <span>{patient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Registrado:</span>
                  <span>
                    {new Date(patient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [
    patients,
    searchQuery,
    formatRut,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenRecordsModal,
    handleDeletePatient,
  ]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl py-1 font-bold text-gray-900">
            Gestión de Pacientes
          </h2>
          <p className="text-gray-600">
            Administra la información de tus pacientes
          </p>
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[var(--color-prim)] hover:bg-[var(--color-prim-dark)]"
        >
          <Plus className="h-4 w-4" />
          Agregar Paciente
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por RUT o nombre..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients Grid */}
      {patientsGrid}

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={loadPatients}
      />

      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          isOpen={!!editingPatient}
          onClose={handleCloseEditModal}
          onSuccess={loadPatients}
        />
      )}

      {viewingRecordsPatient && (
        <PatientMedicalRecords
          patient={viewingRecordsPatient}
          isOpen={!!viewingRecordsPatient}
          onClose={handleCloseRecordsModal}
        />
      )}
    </div>
  );
}
