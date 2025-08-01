"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import type { Locale } from "date-fns";

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
  format,
  es,
}: CalendarGridProps) {
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
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5 text-purple-600" />
          </Button>
          <h3 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
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
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12"></div>
          ))}
          {daysInMonth.map((day, index) => {
            const isDisabled = isPast(day) && !isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <Button
                key={index}
                variant="ghost"
                className={`h-12 w-full flex flex-col items-center justify-center relative rounded-lg transition-all duration-200
                ${
                  isDisabled
                    ? "text-gray-400 cursor-not-allowed opacity-60"
                    : "hover:bg-purple-50"
                }
                ${
                  isSelected
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                    : ""
                }
                ${
                  isCurrentDay && !isSelected
                    ? "border-2 border-purple-400 text-purple-700 font-semibold"
                    : ""
                }
              `}
                onClick={() => handleDateSelect(day)}
                disabled={isDisabled}
              >
                <span
                  className={`${isSelected ? "text-white" : "text-gray-900"}`}
                >
                  {format(day, "d")}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Leyenda del Calendario */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-600 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-purple-600 rounded-lg"></span>
            <span>Día seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-purple-400 rounded-lg"></span>
            <span>Día actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-400 rounded-lg opacity-60"></span>
            <span>Día no disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
