"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Mail, Phone, UserPlus } from "lucide-react";
import { createPatient, getPatientByRut } from "@/actions/patients";
import type { Appointment } from "@/types/calendar";

interface ExistingPatient {
  id: string;
  rut: string;
  name?: string; // Made name optional to match Patient type
  email?: string;
  phone?: string;
}

interface ConvertToPatientModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertToPatientModal({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}: ConvertToPatientModalProps) {
  const [formData, setFormData] = useState({
    rut: "",
    name: appointment.clientName,
    email: appointment.clientEmail,
    phone: appointment.clientPhone,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingPatient, setExistingPatient] =
    useState<ExistingPatient | null>(null);

  const formatRutInput = (value: string) => {
    // Remover caracteres no válidos
    const cleaned = value.replace(/[^0-9kK]/g, "");

    if (cleaned.length <= 1) return cleaned;

    // Separar cuerpo y dígito verificador
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    // Formatear con puntos
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formatted}-${dv}`;
  };

  const handleRutChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRutInput(e.target.value);
    setFormData((prev) => ({ ...prev, rut: formatted }));
    setError("");
    setExistingPatient(null);

    // Verificar si el RUT ya existe cuando tenga formato completo
    if (formatted.length >= 9) {
      try {
        const cleanRut = formatted.replace(/[^0-9kK]/g, "");
        const existing = await getPatientByRut(cleanRut);
        if (existing) {
          setExistingPatient(existing);
        }
      } catch {
        // Error al buscar, pero no mostramos nada al usuario
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Limpiar RUT para enviar solo números y K
      const cleanRut = formData.rut.replace(/[^0-9kK]/g, "");

      if (cleanRut.length < 8) {
        setError("Por favor ingresa un RUT válido");
        setIsLoading(false);
        return;
      }

      await createPatient({
        rut: cleanRut,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        rut: "",
        name: appointment.clientName,
        email: appointment.clientEmail,
        phone: appointment.clientPhone,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al crear paciente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        rut: "",
        name: appointment.clientName,
        email: appointment.clientEmail,
        phone: appointment.clientPhone,
      });
      setError("");
      setExistingPatient(null);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Agregar como Paciente
          </DialogTitle>
        </DialogHeader>

        {/* Appointment Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Información de la Cita
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{appointment.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(appointment.date)} - {appointment.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>{appointment.clientEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{appointment.clientPhone}</span>
            </div>
            <Badge
              variant="outline"
              className="text-xs bg-green-100 text-green-800 border-green-200"
            >
              Cita Confirmada
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {existingPatient && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p className="font-medium">¡Paciente ya existe!</p>
              <p className="text-sm">
                Ya existe un paciente con RUT {formData.rut}:{" "}
                {existingPatient.name || "Sin nombre"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rut">RUT del Paciente *</Label>
            <Input
              id="rut"
              value={formData.rut}
              onChange={handleRutChange}
              placeholder="12.345.678-9"
              required
              maxLength={12}
            />
            <p className="text-xs text-gray-500">
              Ingresa el RUT del cliente para crear su ficha de paciente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nombre del paciente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="email@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+56 9 1234 5678"
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
              disabled={isLoading || !formData.rut || !!existingPatient}
              className="flex-1"
            >
              {isLoading ? "Creando..." : "Crear Paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
