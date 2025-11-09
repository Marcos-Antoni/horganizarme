'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasksCount?: Record<string, number>;
}

export default function Calendar({ selectedDate, onDateSelect, tasksCount = {} }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener el día de la semana del primer día (0 = domingo)
  const firstDayOfWeek = monthStart.getDay();

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={previousMonth}
          className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
          <div key={day} className="text-center text-xs sm:text-xs font-medium text-gray-500 py-1 sm:py-2">
            <span className="sm:hidden">{day}</span>
            <span className="hidden sm:inline">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][index]}</span>
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* Espacios vacíos antes del primer día */}
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Días del mes */}
        {daysInMonth.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const count = tasksCount[dateString] || 0;
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square p-1 sm:p-1 rounded-lg text-sm sm:text-sm font-medium transition-all touch-manipulation
                ${isSelected ? 'bg-blue-500 text-white shadow-md scale-105' : 'hover:bg-gray-100 active:bg-gray-200'}
                ${isTodayDate && !isSelected ? 'border-2 border-blue-500' : ''}
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : 'text-gray-900'}
                relative flex items-center justify-center min-h-[2.5rem] sm:min-h-0
              `}
            >
              <div className="relative">
                <div>{format(day, 'd')}</div>
                {count > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`
                      w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full
                      ${isSelected ? 'bg-white' : 'bg-blue-500'}
                    `} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
