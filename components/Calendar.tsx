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
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
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
                aspect-square p-1 rounded-lg text-sm font-medium transition-all
                ${isSelected ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-100'}
                ${isTodayDate && !isSelected ? 'border-2 border-blue-500' : ''}
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : 'text-gray-900'}
                relative
              `}
            >
              <div>{format(day, 'd')}</div>
              {count > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`
                    w-1.5 h-1.5 rounded-full
                    ${isSelected ? 'bg-white' : 'bg-blue-500'}
                  `} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
