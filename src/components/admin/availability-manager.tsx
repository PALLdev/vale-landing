"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Clock,
  Ban,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  X,
  CalendarDays,
  History,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  format,
  isAfter,
  addMonths,
  eachDayOfInterval,
  isBefore,
  isPast,
  isToday,
  endOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  AvailabilityBlock,
  CreateAvailabilityBlockInput,
} from "@/types/availability";
import {
  getAvailabilityBlocks,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
} from "@/actions/availability";

interface AvailabilityManagerProps {
  onAvailabilityChange: () => void;
  showOnlyRecent?: boolean;
}

export function AvailabilityManager({
  onAvailabilityChange,
  showOnlyRecent = false,
}: AvailabilityManagerProps) {
  const [availabilityBlocks, setAvailabilityBlocks] = useState<
    AvailabilityBlock[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<AvailabilityBlock | null>(
    null
  );

  // Estados para selección múltiple
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Form state
  const [blockingMode, setBlockingMode] = useState<"single" | "range">(
    "single"
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [blockType, setBlockType] = useState<
    "unavailable" | "vacation" | "maintenance"
  >("unavailable");
  const [reason, setReason] = useState("");
  const [isFullDay, setIsFullDay] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  // Calcular correctamente la fecha máxima: final del 6º mes desde hoy
  const maxBookingDate = useMemo(() => {
    const today = new Date();
    const sixMonthsFromNow = addMonths(today, 6);
    return endOfMonth(sixMonthsFromNow);
  }, []);

  // Time slots for selection
  const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  // Filtrar bloqueos para mostrar solo los recientes si es necesario
  const displayedBlocks = showOnlyRecent
    ? availabilityBlocks.slice(0, 3)
    : availabilityBlocks;

  useEffect(() => {
    loadAvailabilityBlocks();
  }, []);

  // Limpiar selección cuando se cierra el historial
  useEffect(() => {
    if (!isHistoryDialogOpen) {
      setSelectedBlocks(new Set());
      setIsSelectMode(false);
    }
  }, [isHistoryDialogOpen]);

  const loadAvailabilityBlocks = async () => {
    setIsLoading(true);
    try {
      const blocks = await getAvailabilityBlocks();
      setAvailabilityBlocks(blocks);
    } catch (error) {
      console.error("Error loading availability blocks:", error);
      toast.error("Error al cargar bloqueos", {
        description: "No se pudieron cargar los bloqueos de disponibilidad.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedTimes([]);
    setBlockType("unavailable");
    setReason("");
    setIsFullDay(true);
    setBlockingMode("single");
  };

  // Funciones para selección múltiple
  const toggleBlockSelection = (blockId: string) => {
    const newSelected = new Set(selectedBlocks);
    if (newSelected.has(blockId)) {
      newSelected.delete(blockId);
    } else {
      newSelected.add(blockId);
    }
    setSelectedBlocks(newSelected);
  };

  const selectAllBlocks = () => {
    const allIds = new Set(availabilityBlocks.map((block) => block.id));
    setSelectedBlocks(allIds);
  };

  const clearSelection = () => {
    setSelectedBlocks(new Set());
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      clearSelection();
    }
  };

  // Función para alternar la selección de un horario
  const toggleTimeSelection = (time: string) => {
    setSelectedTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  };

  // Función para seleccionar todos los horarios
  const selectAllTimes = () => {
    setSelectedTimes([...timeSlots]);
  };

  // Función para deseleccionar todos los horarios
  const clearAllTimes = () => {
    setSelectedTimes([]);
  };

  // Función para obtener las fechas del rango
  const getDatesInRange = () => {
    if (blockingMode === "single") {
      return selectedDate ? [selectedDate] : [];
    } else {
      if (!startDate || !endDate) return [];
      if (isAfter(startDate, endDate)) return [];
      return eachDayOfInterval({ start: startDate, end: endDate });
    }
  };

  const handleCreateBlock = async () => {
    const datesToBlock = getDatesInRange();

    if (datesToBlock.length === 0) {
      toast.error("Fecha(s) requerida(s)", {
        description:
          blockingMode === "single"
            ? "Por favor selecciona una fecha."
            : "Por favor selecciona las fechas de inicio y fin.",
      });
      return;
    }

    if (!isFullDay && selectedTimes.length === 0) {
      toast.error("Horarios requeridos", {
        description:
          "Por favor selecciona al menos un horario o marca como día completo.",
      });
      return;
    }

    // Validar que todas las fechas estén dentro del rango permitido
    const invalidDates = datesToBlock.filter((date) =>
      isAfter(date, maxBookingDate)
    );
    if (invalidDates.length > 0) {
      toast.error("Fechas fuera de rango", {
        description: `${invalidDates.length} fecha(s) están fuera del rango permitido de 6 meses.`,
      });
      return;
    }

    setIsCreating(true);

    try {
      const blocksToCreate: CreateAvailabilityBlockInput[] = [];

      for (const date of datesToBlock) {
        const localDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        if (isFullDay) {
          // Crear un bloqueo para todo el día
          blocksToCreate.push({
            date: localDate,
            timeSlot: undefined,
            blockType,
            reason: reason.trim() || undefined,
          });
        } else {
          // Crear múltiples bloqueos, uno para cada horario seleccionado
          for (const time of selectedTimes) {
            blocksToCreate.push({
              date: localDate,
              timeSlot: time,
              blockType,
              reason: reason.trim() || undefined,
            });
          }
        }
      }

      // Crear todos los bloqueos
      const results = await Promise.all(
        blocksToCreate.map((blockData) => createAvailabilityBlock(blockData))
      );

      // Verificar si algún bloqueo falló
      const failedResults = results.filter((result) => !result.success);
      if (failedResults.length > 0) {
        throw new Error(
          `Algunos bloqueos fallaron: ${failedResults
            .map((r) => r.message)
            .join(", ")}`
        );
      }

      const totalBlocksCreated = results.length;
      const daysBlocked = datesToBlock.length;

      toast.success("Bloqueo(s) creado(s)", {
        description:
          blockingMode === "single"
            ? isFullDay
              ? `Día completo bloqueado exitosamente.`
              : `${selectedTimes.length} horario(s) bloqueado(s) exitosamente.`
            : isFullDay
            ? `${daysBlocked} día(s) completo(s) bloqueado(s) exitosamente.`
            : `${totalBlocksCreated} bloqueo(s) creado(s) para ${daysBlocked} día(s).`,
      });

      await loadAvailabilityBlocks();
      onAvailabilityChange();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Error al crear bloqueo(s)", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (block: AvailabilityBlock) => {
    setBlockToDelete(block);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;

    setIsDeleting(true);
    const result = await deleteAvailabilityBlock(blockToDelete.id);

    if (result.success) {
      toast.success("Bloqueo eliminado", {
        description: "El bloqueo de disponibilidad ha sido eliminado.",
      });
      await loadAvailabilityBlocks();
      onAvailabilityChange();
    } else {
      toast.error("Error al eliminar", {
        description: result.message,
      });
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setBlockToDelete(null);
  };

  // Función para eliminar múltiples bloqueos
  const handleBulkDelete = () => {
    if (selectedBlocks.size === 0) {
      toast.error("Sin selección", {
        description: "Por favor selecciona al menos un bloqueo para eliminar.",
      });
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedBlocks.size === 0) return;

    setIsBulkDeleting(true);
    const blockIds = Array.from(selectedBlocks);

    try {
      // Eliminar todos los bloqueos seleccionados
      const results = await Promise.all(
        blockIds.map((id) => deleteAvailabilityBlock(id))
      );

      // Verificar si alguna eliminación falló
      const failedResults = results.filter((result) => !result.success);

      if (failedResults.length > 0) {
        toast.error("Error parcial", {
          description: `${failedResults.length} de ${blockIds.length} bloqueos no pudieron ser eliminados.`,
        });
      } else {
        toast.success("Bloqueos eliminados", {
          description: `${blockIds.length} bloqueo(s) eliminado(s) exitosamente.`,
        });
      }

      await loadAvailabilityBlocks();
      onAvailabilityChange();
      clearSelection();
      setIsSelectMode(false);
    } catch (error) {
      toast.error("Error al eliminar bloqueos", {
        description:
          "Ocurrió un error inesperado al eliminar los bloqueos seleccionados.",
      });
    } finally {
      setIsBulkDeleting(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case "unavailable":
        return "No disponible";
      case "vacation":
        return "Vacaciones";
      case "maintenance":
        return "Mantenimiento";
      default:
        return type;
    }
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "vacation":
        return "bg-blue-100 text-blue-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para determinar si una fecha debe estar deshabilitada
  const isDateDisabled = (date: Date) => {
    // Solo deshabilitar fechas pasadas (excepto hoy) y fechas después del límite de 6 meses
    return (isPast(date) && !isToday(date)) || isAfter(date, maxBookingDate);
  };

  // Componente para renderizar la lista de bloqueos
  const BlocksList = ({
    blocks,
    showDeleteButton = true,
    showSelection = false,
  }: {
    blocks: AvailabilityBlock[];
    showDeleteButton?: boolean;
    showSelection?: boolean;
  }) => (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={cn(
            "flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg transition-colors",
            showSelection && selectedBlocks.has(block.id)
              ? "bg-purple-50 border-purple-200"
              : "bg-gray-50"
          )}
        >
          {showSelection && (
            <Checkbox
              checked={selectedBlocks.has(block.id)}
              onCheckedChange={() => toggleBlockSelection(block.id)}
              className="flex-shrink-0 self-start sm:self-center"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className="font-medium text-sm sm:text-base">
                {format(block.date, "dd MMM yyyy", { locale: es })}
              </span>
              {block.timeSlot && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                  <Clock className="h-3 w-3" />
                  {block.timeSlot}
                </div>
              )}
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium w-fit",
                  getBlockTypeColor(block.blockType)
                )}
              >
                {getBlockTypeLabel(block.blockType)}
              </span>
            </div>
            {block.reason && (
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {block.reason}
              </p>
            )}
          </div>

          {showDeleteButton && !showSelection && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(block)}
              className="self-end sm:self-center w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
              <span className="sm:hidden">Eliminar</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card className="shadow-lg border-purple-100">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-2" />
          <span>Cargando bloqueos de disponibilidad...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-purple-100">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Ban className="h-5 w-5 text-purple-600" />
              Gestión de Disponibilidad
              {showOnlyRecent && availabilityBlocks.length > 3 && (
                <span className="text-xs sm:text-sm font-normal text-gray-500 block sm:inline">
                  (Mostrando {Math.min(3, availabilityBlocks.length)} de{" "}
                  {availabilityBlocks.length})
                </span>
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {showOnlyRecent && availabilityBlocks.length > 3 && (
                <Button
                  variant="outline"
                  onClick={() => setIsHistoryDialogOpen(true)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50 w-full sm:w-auto"
                >
                  <History className="mr-2 h-4 w-4" />
                  <span className="sm:hidden">
                    Historial ({availabilityBlocks.length})
                  </span>
                  <span className="hidden sm:inline">
                    Ver Historial ({availabilityBlocks.length})
                  </span>
                </Button>
              )}
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="sm:hidden">Bloquear</span>
                <span className="hidden sm:inline">Bloquear Horario</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {displayedBlocks.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {availabilityBlocks.length === 0
                  ? "No hay bloqueos de disponibilidad configurados."
                  : "No hay bloqueos recientes para mostrar."}
              </p>
            </div>
          ) : (
            <BlocksList blocks={displayedBlocks} />
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear bloqueos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Ban className="h-5 w-5 text-purple-600" />
              Bloquear Disponibilidad
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Modo de bloqueo */}
            <div>
              <Label className="text-sm sm:text-base">Modo de bloqueo</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  type="button"
                  variant={blockingMode === "single" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBlockingMode("single");
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full sm:w-auto",
                    blockingMode === "single"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Día único
                </Button>
                <Button
                  type="button"
                  variant={blockingMode === "range" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBlockingMode("range");
                    setSelectedDate(undefined);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full sm:w-auto",
                    blockingMode === "range"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  Rango de fechas
                </Button>
              </div>
            </div>

            {/* Selección de fecha(s) */}
            {blockingMode === "single" ? (
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "dd MMMM yyyy", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date && isAfter(date, maxBookingDate)) {
                          toast.error("Fecha fuera de rango", {
                            description:
                              "Solo puedes bloquear fechas dentro de los próximos 6 meses.",
                          });
                          return;
                        }
                        setSelectedDate(date);
                        setPopoverOpen(false);
                      }}
                      initialFocus
                      locale={es}
                      disabled={isDateDisabled}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Fecha de inicio */}
                <div>
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Popover
                    open={startDatePopoverOpen}
                    onOpenChange={setStartDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "dd MMM yyyy", { locale: es })
                        ) : (
                          <span>Inicio</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date && isAfter(date, maxBookingDate)) {
                            toast.error("Fecha fuera de rango", {
                              description:
                                "Solo puedes bloquear fechas dentro de los próximos 6 meses.",
                            });
                            return;
                          }
                          setStartDate(date);
                          // Si la fecha de fin es anterior a la nueva fecha de inicio, resetearla
                          if (endDate && date && isAfter(date, endDate)) {
                            setEndDate(undefined);
                          }
                          setStartDatePopoverOpen(false);
                        }}
                        initialFocus
                        locale={es}
                        disabled={isDateDisabled}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha de fin */}
                <div>
                  <Label htmlFor="endDate">Fecha de fin</Label>
                  <Popover
                    open={endDatePopoverOpen}
                    onOpenChange={setEndDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={!startDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "dd MMM yyyy", { locale: es })
                        ) : (
                          <span>Fin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          if (date && isAfter(date, maxBookingDate)) {
                            toast.error("Fecha fuera de rango", {
                              description:
                                "Solo puedes bloquear fechas dentro de los próximos 6 meses.",
                            });
                            return;
                          }
                          setEndDate(date);
                          setEndDatePopoverOpen(false);
                        }}
                        initialFocus
                        locale={es}
                        disabled={(date) =>
                          isDateDisabled(date) ||
                          (startDate ? isBefore(date, startDate) : false)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Vista previa del rango */}
            {blockingMode === "range" && startDate && endDate && (
              <div className="p-3 bg-purple-50 rounded-md">
                <p className="text-sm text-purple-700 font-medium mb-1">
                  Rango seleccionado:
                </p>
                <p className="text-sm text-purple-600">
                  Desde {format(startDate, "dd MMMM yyyy", { locale: es })}{" "}
                  hasta {format(endDate, "dd MMMM yyyy", { locale: es })}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  Total: {getDatesInRange().length} día(s)
                </p>
              </div>
            )}

            {/* Tipo de bloqueo */}
            <div>
              <Label className="text-sm sm:text-base">Tipo de bloqueo</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Button
                  type="button"
                  variant={isFullDay ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsFullDay(true);
                    setSelectedTimes([]);
                  }}
                  className={cn(
                    "w-full sm:w-auto",
                    isFullDay ? "bg-purple-600 hover:bg-purple-700" : ""
                  )}
                >
                  Día completo
                </Button>
                <Button
                  type="button"
                  variant={!isFullDay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFullDay(false)}
                  className={cn(
                    "w-full sm:w-auto",
                    !isFullDay ? "bg-purple-600 hover:bg-purple-700" : ""
                  )}
                >
                  Horarios específicos
                </Button>
              </div>
            </div>

            {/* Selección múltiple de horarios */}
            {!isFullDay && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <Label className="text-sm sm:text-base">
                    Horarios a bloquear
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllTimes}
                      className="text-xs bg-transparent flex-1 sm:flex-none"
                    >
                      Todos
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllTimes}
                      className="text-xs bg-transparent flex-1 sm:flex-none"
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={
                        selectedTimes.includes(time) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleTimeSelection(time)}
                      className={cn(
                        "text-xs sm:text-sm",
                        selectedTimes.includes(time)
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "hover:bg-purple-50"
                      )}
                    >
                      {time}
                    </Button>
                  ))}
                </div>

                {selectedTimes.length > 0 && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-md">
                    <p className="text-xs sm:text-sm text-purple-700 font-medium mb-1">
                      Horarios seleccionados ({selectedTimes.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTimes.map((time) => (
                        <span
                          key={time}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs"
                        >
                          {time}
                          <button
                            type="button"
                            onClick={() => toggleTimeSelection(time)}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categoría */}
            <div>
              <Label htmlFor="blockType">Categoría</Label>
              <Select
                value={blockType}
                onValueChange={(
                  value: "unavailable" | "vacation" | "maintenance"
                ) => setBlockType(value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">No disponible</SelectItem>
                  <SelectItem value="vacation">Vacaciones</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Razón */}
            <div>
              <Label htmlFor="reason">Razón (opcional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe la razón del bloqueo..."
                className="mt-1"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateBlock}
                disabled={isCreating}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  (() => {
                    const datesCount = getDatesInRange().length;
                    const timesCount = isFullDay ? 1 : selectedTimes.length;
                    const totalBlocks = datesCount * timesCount;

                    if (blockingMode === "single") {
                      return `Crear ${
                        isFullDay ? "Bloqueo" : `${timesCount} Bloqueo(s)`
                      }`;
                    } else {
                      return `Crear ${totalBlocks} Bloqueo(s)`;
                    }
                  })()
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para historial completo con altura fija */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[768px] lg:max-w-[900px] max-w-[95vw] h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <History className="h-5 w-5 text-purple-600" />
                  Historial de Bloqueos ({availabilityBlocks.length})
                </DialogTitle>
              </div>
            </div>

            {/* Barra de controles */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {isSelectMode && selectedBlocks.size > 0 && (
                  <span className="text-xs sm:text-sm text-gray-600 bg-purple-50 px-2 py-1 rounded-md">
                    {selectedBlocks.size} seleccionado
                    {selectedBlocks.size > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectMode}
                disabled={isBulkDeleting}
                className={cn(
                  "flex items-center gap-2 w-full sm:w-auto",
                  isSelectMode
                    ? "bg-purple-50 border-purple-200 text-purple-700"
                    : ""
                )}
              >
                {isSelectMode ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <CheckSquare className="h-4 w-4" />
                )}
                <span className="sm:hidden">
                  {isSelectMode ? "Cancelar" : "Seleccionar"}
                </span>
                <span className="hidden sm:inline">
                  {isSelectMode ? "Cancelar selección" : "Seleccionar múltiple"}
                </span>
              </Button>
            </div>
          </DialogHeader>

          {/* Barra de acciones para selección múltiple */}
          {isSelectMode && (
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-purple-50 rounded-md border border-purple-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllBlocks}
                  disabled={
                    selectedBlocks.size === availabilityBlocks.length ||
                    isBulkDeleting
                  }
                  className="w-full sm:w-auto bg-transparent"
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedBlocks.size === 0 || isBulkDeleting}
                  className="w-full sm:w-auto bg-transparent"
                >
                  Limpiar selección
                </Button>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={selectedBlocks.size === 0 || isBulkDeleting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Eliminar seleccionados ({selectedBlocks.size})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto pr-2">
            {availabilityBlocks.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  No hay bloqueos de disponibilidad configurados.
                </p>
              </div>
            ) : (
              <BlocksList
                blocks={availabilityBlocks}
                showDeleteButton={!isSelectMode}
                showSelection={isSelectMode}
              />
            )}
          </div>

          {/* Footer fijo */}
          <div className="flex-shrink-0 flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (individual) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar bloqueo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el bloqueo de disponibilidad para{" "}
              <span className="font-semibold">
                {blockToDelete &&
                  format(blockToDelete.date, "dd MMMM yyyy", { locale: es })}
                {blockToDelete?.timeSlot && ` a las ${blockToDelete.timeSlot}`}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {selectedBlocks.size} bloqueo
              {selectedBlocks.size > 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedBlocks.size}{" "}
              bloqueo{selectedBlocks.size > 1 ? "s" : ""} de disponibilidad
              seleccionado{selectedBlocks.size > 1 ? "s" : ""}. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
