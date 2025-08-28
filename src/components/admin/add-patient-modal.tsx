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
import { createPatient } from "@/actions/patients";
import { User, Mail, Phone, CreditCard, UserPlus } from "lucide-react";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) {
  const [formData, setFormData] = useState({
    rut: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRutInput(e.target.value);
    setFormData((prev) => ({ ...prev, rut: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Limpiar RUT para enviar solo números y K
      const cleanRut = formData.rut.replace(/[^0-9kK]/g, "");

      await createPatient({
        rut: cleanRut,
        name: formData.name.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      });

      // Reset form
      setFormData({ rut: "", name: "", email: "", phone: "" });
      onSuccess();
      onClose();
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
      setFormData({ rut: "", name: "", email: "", phone: "" });
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-purple-200/50 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            Agregar Nuevo Paciente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="rut"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4 text-purple-600" />
              RUT *
            </Label>
            <Input
              id="rut"
              value={formData.rut}
              onChange={handleRutChange}
              placeholder="12.345.678-9"
              required
              maxLength={12}
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <User className="h-4 w-4 text-purple-600" />
              Nombre Completo
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Juan Pérez"
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-purple-600" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="juan@ejemplo.com"
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Phone className="h-4 w-4 text-purple-600" />
              Teléfono
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+56 9 1234 5678"
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.rut}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Creando..." : "Crear Paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
