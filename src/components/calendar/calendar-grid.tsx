"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import type { Locale } from "date-fns";
import { isSameMonth, format, isAfter, startOfMonth } from "date-fns"; // Añadir isPast e isToday
import type { Appointment } from "@/types/calendar";
import { hasAppointmentsOnDay } from "@/lib/calendar-helpers";
import type { AvailabilityBlock } from "@/types/availability";
import { isDayBlocked } from "@/lib/calendar-helpers";

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  daysInMonth: Date[];
  startingDayIndex: number;
  daysOfWeek: string[];
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleDateSelect: (date: Date) => void;
  isPast: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  isSameDay: (dateLeft: Date, dateRight: Date) => boolean;
  format: (
    date: Date,
    formatStr: string,
    options?: { locale?: Locale }
  ) => string;
  es: Locale;
  isDayFullyBooked: (date: Date, allAppointments: Appointment[]) => boolean;
  appointments: Appointment[];
  showAppointmentIndicator: boolean;
  maxSelectableDate: Date;
  availabilityBlocks: AvailabilityBlock[];
  isAdminView?: boolean; // Nuevo prop para identificar si es vista de admin
}

export function CalendarGrid({
  currentMonth,
  selectedDate,
  daysInMonth,
  startingDayIndex,
  daysOfWeek,
  handlePrevMonth,
  handleNextMonth,
  handleDateSelect,
  isPast,
  isToday,
  isSameDay,
  format: formatFn,
  es,
  isDayFullyBooked,
  appointments,
  showAppointmentIndicator,
  maxSelectableDate,
  availabilityBlocks,
  isAdminView = false, // Valor por defecto
}: CalendarGridProps) {
  const today = new Date();

  const totalCellsInGrid = 42;
  const daysRendered = startingDayIndex + daysInMonth.length;
  const trailingEmptyCells = totalCellsInGrid - daysRendered;

  // Validación defensiva para asegurar que maxSelectableDate es un objeto Date válido
  const safeMaxSelectableDate =
    maxSelectableDate instanceof Date && !isNaN(maxSelectableDate.getTime())
      ? maxSelectableDate
      : new Date(); // Fallback a la fecha actual si no es válido

  // Determinar si el botón de "siguiente mes" debe estar deshabilitado
  // Se deshabilita si el mes actual es el mismo que el mes de safeMaxSelectableDate
  // Usamos startOfMonth para asegurar que la comparación sea solo por mes y año
  const isNextMonthDisabled = isSameMonth(
    startOfMonth(currentMonth),
    startOfMonth(safeMaxSelectableDate)
  );

  return (
    <Card className="shadow-lg border-purple-100 h-[650px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-purple-600" />
          {isAdminView ? "Calendario de Administración" : "Selecciona tu Fecha"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Navegación del Mes */}
        <div className="flex items-center justify-between mb-6">
          {!isSameMonth(currentMonth, today) && (
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5 text-purple-600" />
            </Button>
          )}
          {isSameMonth(currentMonth, today) && <div className="w-10"></div>}
          <h3 className="text-xl font-semibold text-gray-900 capitalize">
            {formatFn(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          {/* Condicionalmente renderizar el botón de siguiente mes */}
          {!isNextMonthDisabled && (
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5 text-purple-600" />
            </Button>
          )}
          {isNextMonthDisabled && <div className="w-10"></div>}{" "}
          {/* Espaciador para mantener el diseño */}
        </div>

        {/* Días de la Semana */}
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Días del Mes */}
        <div
          key={format(currentMonth, "yyyy-MM")}
          className="grid grid-cols-7 gap-1"
        >
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-start-${i}`} className="h-12"></div>
          ))}
          {daysInMonth.map((day, index) => {
            const isPastDay = isPast(day) && !isToday(day);
            const isSunday = day.getDay() === 0;
            const isFullyBookedDay = isDayFullyBooked(day, appointments);
            const hasAppts = hasAppointmentsOnDay(day, appointments);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isBeyondMaxDate = isAfter(day, safeMaxSelectableDate);
            const isDayBlockedByAdmin = isDayBlocked(day, availabilityBlocks);

            // Determine if the button should be disabled based on context
            let isDisabledForClick = false;
            if (isAdminView) {
              // Vista de admin:
              // - Días futuros: Domingos, más allá del límite, y bloqueados son no clicables
              // - Días pasados: Solo clicables si tienen citas
              if (isPastDay) {
                isDisabledForClick = !hasAppts; // Solo clicable si tiene citas
              } else {
                isDisabledForClick =
                  isSunday || isBeyondMaxDate || isDayBlockedByAdmin;
              }
            } else {
              // Vista pública: días pasados, domingos, completamente reservados, más allá del límite, y bloqueados son no clicables
              isDisabledForClick =
                isPastDay ||
                isSunday ||
                isFullyBookedDay ||
                isBeyondMaxDate ||
                isDayBlockedByAdmin;
            }

            let dayButtonClasses = `h-12 w-full flex flex-col items-center justify-center relative rounded-lg transition-all duration-200`;
            let dayNumberClasses = ``;

            // Apply styles based on selection, current day, and availability
            if (isSelected) {
              dayButtonClasses += ` bg-purple-600 hover:bg-purple-700 shadow-md`;
              dayNumberClasses += ` text-white`;
            } else if (isPastDay) {
              // TODOS los días pasados se ven iguales (como el día 5 en la imagen)
              dayButtonClasses += ` opacity-60 bg-gray-100`;
              dayNumberClasses += ` text-gray-400`;
            } else if (isDisabledForClick) {
              // Apply "not available" style for non-past days
              dayButtonClasses += ` opacity-60 bg-gray-100`;
              dayNumberClasses += ` text-gray-400`;
            } else {
              // Default available style
              dayButtonClasses += ` hover:bg-purple-50`;
              dayNumberClasses += ` text-gray-900`;
            }

            // Always apply current day border if it's the current day and not selected
            if (isCurrentDay && !isSelected) {
              dayButtonClasses += ` border-2 border-purple-400`;
              // If it's the current day and not selected, and not disabled, text is purple
              if (!isDisabledForClick) {
                dayNumberClasses = ` text-purple-700 font-semibold`;
              }
            }

            return (
              <Button
                key={index}
                variant="ghost"
                className={dayButtonClasses}
                onClick={() => handleDateSelect(day)}
                disabled={isDisabledForClick}
              >
                <span className={dayNumberClasses}>{formatFn(day, "d")}</span>

                {/* Indicadores para vista de admin - mismo tamaño para todos */}
                {isAdminView && hasAppts && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                )}

                {/* Indicador para vista pública (solo días futuros disponibles con citas) */}
                {!isAdminView &&
                  showAppointmentIndicator &&
                  hasAppts &&
                  !isDisabledForClick && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  )}
              </Button>
            );
          })}
          {Array.from({ length: trailingEmptyCells }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-12"></div>
          ))}
        </div>

        {/* Leyenda del Calendario */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600 flex flex-wrap justify-center gap-x-0.5 sm:gap-x-6 gap-y-2">
          {isAdminView ? (
            // Leyenda para vista de admin
            <>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>Día con citas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-400 rounded-lg"></span>
                <span>Día actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-600 rounded-lg"></span>
                <span>Día seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-100 rounded-lg opacity-60"></span>
                <span>Día no disponible/sin citas</span>
              </div>
            </>
          ) : (
            // Leyenda para vista pública
            <>
              {showAppointmentIndicator && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  <span>Día con citas (disponible)</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-400 rounded-lg"></span>
                <span>Día actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-purple-600 rounded-lg"></span>
                <span>Día seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-100 rounded-lg opacity-60"></span>
                <span>Día no disponible/sin horarios</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
