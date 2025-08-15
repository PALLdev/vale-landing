"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Edit,
  Trash2,
  Stethoscope,
  Pill,
  Eye,
} from "lucide-react";
import type { MedicalRecord } from "@/actions/medical-records";

interface MedicalRecordsTimelineProps {
  records: MedicalRecord[];
  onEditRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export function MedicalRecordsTimeline({
  records,
  onEditRecord,
  onDeleteRecord,
}: MedicalRecordsTimelineProps) {
  const parseLocalDate = (dateString: string) => {
    // Parse date as local date to avoid timezone conversion issues
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return parseLocalDate(dateString).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTimelineIcon = (record: MedicalRecord) => {
    if (record.diagnosis && record.treatment) {
      return <Stethoscope className="h-4 w-4" />;
    } else if (record.treatment) {
      return <Pill className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (record: MedicalRecord) => {
    if (record.diagnosis && record.treatment) {
      return "bg-green-500"; // Sesión completa con diagnóstico y tratamiento
    } else if (record.treatment) {
      return "bg-blue-500"; // Sesión con tratamiento
    } else {
      return "bg-gray-500"; // Sesión básica
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay fichas médicas registradas
        </h3>
        <p className="text-gray-600 text-center">
          El timeline aparecerá aquí cuando agregues fichas médicas
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-8">
        {records.map((record, index) => (
          <div key={record.id} className="relative flex items-start gap-6">
            {/* Timeline Node */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-16 h-16 rounded-full ${getTimelineColor(
                  record
                )} flex items-center justify-center text-white shadow-lg`}
              >
                {getTimelineIcon(record)}
              </div>
              {/* Date Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge
                  variant="secondary"
                  className="text-xs whitespace-nowrap"
                >
                  {formatShortDate(record.session_date)}
                </Badge>
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {formatDate(record.session_date)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Registrado el {formatTimestamp(record.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRecord(record)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-4">
                    {/* Session Notes */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">
                          Notas de la Sesión
                        </h4>
                      </div>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        {record.session_notes}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    {record.diagnosis && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="h-4 w-4 text-green-600" />
                          <h4 className="font-medium text-green-900">
                            Diagnóstico
                          </h4>
                        </div>
                        <p className="text-green-800 text-sm leading-relaxed">
                          {record.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Treatment */}
                    {record.treatment && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <h4 className="font-medium text-purple-900">
                            Tratamiento
                          </h4>
                        </div>
                        <p className="text-purple-800 text-sm leading-relaxed">
                          {record.treatment}
                        </p>
                      </div>
                    )}

                    {/* Observations */}
                    {record.observations && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-yellow-600" />
                          <h4 className="font-medium text-yellow-900">
                            Observaciones
                          </h4>
                        </div>
                        <p className="text-yellow-800 text-sm leading-relaxed">
                          {record.observations}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timeline Position Indicator */}
                  {index === 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200"
                      >
                        Sesión más reciente
                      </Badge>
                    </div>
                  )}
                  {index === records.length - 1 && records.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Badge
                        variant="outline"
                        className="text-xs text-gray-600 border-gray-200"
                      >
                        Primera sesión
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline End */}
      <div className="relative flex items-center gap-6 mt-8">
        <div className="relative z-10 flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-sm italic">
            Inicio del historial médico
          </p>
        </div>
      </div>
    </div>
  );
}
