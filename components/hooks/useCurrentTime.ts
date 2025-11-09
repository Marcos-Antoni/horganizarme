'use client';

import { useState, useEffect } from 'react';
import { getCurrentTimeString } from '@/utils/timeUtils';

/**
 * Hook que retorna la hora actual y se actualiza cada minuto
 * Útil para resaltar tareas en tiempo real
 */
export function useCurrentTime(): string {
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());

  useEffect(() => {
    // Actualizar inmediatamente
    setCurrentTime(getCurrentTimeString());

    // Actualizar cada 60 segundos
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeString());
    }, 60000); // 60000ms = 1 minuto

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return currentTime;
}
