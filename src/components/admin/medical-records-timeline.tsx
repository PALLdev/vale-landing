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
  Paperclip,
} from "lucide-react";
import type { MedicalRecord } from "@/actions/medical-records";
import { AttachmentsManager } from "./attachments-manager";

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
      return "bg-primary"; // Using primary color for complete sessions
    } else if (record.treatment) {
      return "bg-secondary"; // Using secondary color for treatment sessions
    } else {
      return "bg-muted-foreground"; // Using muted color for basic sessions
    }
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No hay fichas médicas registradas
        </h3>
        <p className="text-muted-foreground text-center">
          El timeline aparecerá aquí cuando agregues fichas médicas
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

      <div className="space-y-8">
        {records.map((record, index) => (
          <div key={record.id} className="relative flex items-start gap-6">
            {/* Timeline Node */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-16 h-16 rounded-full ${getTimelineColor(
                  record
                )} flex items-center justify-center text-primary-foreground shadow-lg`}
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
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(record.session_date)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Registrado el {formatTimestamp(record.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRecord(record)}
                        className="text-muted-foreground hover:text-[var(--color-prim)] hover:bg-[var(--color-prim-very-lighter)]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-4">
                    {/* Session Notes */}
                    <div className="bg-[var(--color-prim-very-lighter)]/50 border border-[var(--color-prim)]/10 rounded-lg p-4 dark:bg-[var(--color-prim-darker)]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-[var(--color-prim)]" />
                        <h4 className="font-medium text-[var(--color-prim)]">
                          Notas de la Sesión
                        </h4>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">
                        {record.session_notes}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    {record.diagnosis && (
                      <div className="bg-accent/50 border border-accent rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="h-4 w-4 text-accent-foreground" />
                          <h4 className="font-medium text-accent-foreground">
                            Diagnóstico
                          </h4>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          {record.diagnosis}
                        </p>
                      </div>
                    )}

                    {/* Treatment */}
                    {record.treatment && (
                      <div className="bg-secondary/50 border border-secondary rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-4 w-4 text-secondary-foreground" />
                          <h4 className="font-medium text-secondary-foreground">
                            Tratamiento
                          </h4>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          {record.treatment}
                        </p>
                      </div>
                    )}

                    {/* Observations */}
                    {record.observations && (
                      <div className="bg-muted border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-muted-foreground">
                            Observaciones
                          </h4>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          {record.observations}
                        </p>
                      </div>
                    )}

                    {/* Attachments */}
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="h-4 w-4 text-[var(--color-prim)]" />
                        <h4 className="font-medium text-[var(--color-prim)]">
                          Archivos Adjuntos
                        </h4>
                      </div>
                      <AttachmentsManager
                        medicalRecordId={record.id}
                        canDelete={true}
                      />
                    </div>
                  </div>

                  {/* Timeline Position Indicator */}
                  {index === 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Badge
                        variant="outline"
                        className="text-xs text-[var(--color-prim)] border-[var(--color-prim)]/20"
                      >
                        Sesión más reciente
                      </Badge>
                    </div>
                  )}
                  {index === records.length - 1 && records.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground border-border"
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
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm italic">
            Inicio del historial médico
          </p>
        </div>
      </div>
    </div>
  );
}
