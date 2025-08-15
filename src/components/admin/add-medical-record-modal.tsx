"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Patient } from "@/actions/patients";
import { createMedicalRecord as createRecord } from "@/actions/medical-records";

interface AddMedicalRecordModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMedicalRecordModal({
  patient,
  isOpen,
  onClose,
  onSuccess,
}: AddMedicalRecordModalProps) {
  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    session_date: getTodayLocalDate(), // Use local date function
    session_notes: "",
    diagnosis: "",
    treatment: "",
    observations: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatRut = (rut: string) => {
    const cleaned = rut.replace(/[^0-9kK]/g, "");
    if (cleaned.length <= 1) return cleaned;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted}-${dv}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await createRecord({
        patient_id: patient.id,
        session_date: formData.session_date,
        session_notes: formData.session_notes.trim(),
        diagnosis: formData.diagnosis.trim() || undefined,
        treatment: formData.treatment.trim() || undefined,
        observations: formData.observations.trim() || undefined,
      });

      setFormData({
        session_date: getTodayLocalDate(),
        session_notes: "",
        diagnosis: "",
        treatment: "",
        observations: "",
      });
      onSuccess();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al crear ficha médica"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        session_date: getTodayLocalDate(),
        session_notes: "",
        diagnosis: "",
        treatment: "",
        observations: "",
      });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Ficha Médica</DialogTitle>
          <div className="text-sm text-gray-600">
            Paciente:{" "}
            <span className="font-medium">{patient.name || "Sin nombre"}</span>{" "}
            - {formatRut(patient.rut)}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="session_date">Fecha de Sesión *</Label>
            <Input
              id="session_date"
              type="date"
              value={formData.session_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  session_date: e.target.value,
                }))
              }
              required
              max={getTodayLocalDate()} // Use local date for max constraint
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_notes">Notas de la Sesión *</Label>
            <Textarea
              id="session_notes"
              value={formData.session_notes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  session_notes: e.target.value,
                }))
              }
              placeholder="Describe lo que ocurrió en la sesión, evolución del paciente, etc."
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnóstico</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))
              }
              placeholder="Diagnóstico nutricional o evaluación actual"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Tratamiento</Label>
            <Textarea
              id="treatment"
              value={formData.treatment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, treatment: e.target.value }))
              }
              placeholder="Plan de tratamiento, recomendaciones nutricionales, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observations: e.target.value,
                }))
              }
              placeholder="Observaciones adicionales, seguimiento, etc."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.session_notes.trim()}
              className="flex-1"
            >
              {isLoading ? "Creando..." : "Crear Ficha"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
