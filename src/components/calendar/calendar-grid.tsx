"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import type { Locale } from "date-fns";
import { isSameMonth, format } from "date-fns";
import type { Appointment } from "@/types/calendar";
import { hasAppointmentsOnDay } from "@/lib/calendar-helpers";

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
  showAppointmentIndicator: boolean; // New prop
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
  showAppointmentIndicator, // Destructure new prop
}: CalendarGridProps) {
  const today = new Date();

  const totalCellsInGrid = 42;
  const daysRendered = startingDayIndex + daysInMonth.length;
  const trailingEmptyCells = totalCellsInGrid - daysRendered;

  return (
    <Card className="shadow-lg border-purple-100 h-[650px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-purple-600" />
          Selecciona tu Fecha
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
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5 text-purple-600" />
          </Button>
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
            const isDisabled = isPastDay || isSunday;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            let dayButtonClasses = `h-12 w-full flex flex-col items-center justify-center relative rounded-lg transition-all duration-200`;
            let dayNumberClasses = ``;

            if (isSelected) {
              dayButtonClasses += ` bg-purple-600 hover:bg-purple-700 shadow-md`;
              dayNumberClasses += ` text-white`;
            } else if (isDisabled) {
              dayButtonClasses += ` cursor-not-allowed opacity-60 bg-gray-100`;
              dayNumberClasses += ` text-gray-400`;
            } else if (isFullyBookedDay) {
              dayButtonClasses += ` bg-red-100 hover:bg-red-200`;
              dayNumberClasses += ` text-gray-900`;
            } else if (isCurrentDay) {
              dayButtonClasses += ` border-2 border-purple-400 hover:bg-purple-50`;
              dayNumberClasses += ` text-purple-700 font-semibold`;
            } else {
              dayButtonClasses += ` hover:bg-purple-50`;
              dayNumberClasses += ` text-gray-900`;
            }

            return (
              <Button
                key={index}
                variant="ghost"
                className={dayButtonClasses}
                onClick={() => handleDateSelect(day)}
                disabled={isDisabled}
              >
                <span className={dayNumberClasses}>{formatFn(day, "d")}</span>
                {showAppointmentIndicator &&
                  hasAppts &&
                  !isDisabled &&
                  !isFullyBookedDay && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  )}
                {showAppointmentIndicator && hasAppts && isFullyBookedDay && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </Button>
            );
          })}
          {Array.from({ length: trailingEmptyCells }).map((_, i) => (
            <div key={`empty-end-${i}`} className="h-12"></div>
          ))}
        </div>

        {/* Leyenda del Calendario */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-600 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {showAppointmentIndicator && ( // Conditional rendering for the legend entry
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              <span>Día con citas</span>
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
            <span className="w-4 h-4 bg-red-100 rounded-lg opacity-60"></span>
            <span>Día sin horarios</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-100 rounded-lg opacity-60"></span>
            <span>Día no disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
