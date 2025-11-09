'use client';

import { format, addDays, subDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DaySelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DaySelector({ selectedDate, onDateChange }: DaySelectorProps) {
  const goToPreviousDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(new Date());

  const isTodaySelected = isToday(selectedDate);

  return (
    <div className="bg-navy/50 border border-gold/20 rounded-lg shadow-lg p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-gold/10 active:bg-gold/20 rounded-full transition-colors touch-manipulation text-cream"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-base sm:text-lg font-semibold capitalize text-cream">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </div>
          {!isTodaySelected && (
            <button
              onClick={goToToday}
              className="mt-1 text-xs sm:text-sm text-gold hover:text-gold/80 active:text-gold/60 transition-colors touch-manipulation inline-flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Ir a hoy
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 hover:bg-gold/10 active:bg-gold/20 rounded-full transition-colors touch-manipulation text-cream"
          aria-label="Día siguiente"
        >
          <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
