/**
 * Utilidades para manejo de tiempo y comparación de horas
 */

/**
 * Convierte una hora en formato "HH:mm" o "HH:mm:ss" a objeto Date de hoy
 */
export function parseTimeToDate(timeString: string): Date | null {
  if (!timeString) return null;

  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch {
    return null;
  }
}

/**
 * Obtiene la hora actual como string "HH:mm"
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Compara si una hora programada está activa ahora
 * @param scheduledTime - Hora en formato "HH:mm"
 * @param allScheduledTimes - Array de todas las horas programadas del día (opcional)
 * @returns true si la hora programada está activa (desde su hora hasta la siguiente tarea)
 */
export function isTimeActive(scheduledTime: string | undefined, allScheduledTimes?: string[]): boolean {
  if (!scheduledTime) return false;

  const scheduledDate = parseTimeToDate(scheduledTime);
  if (!scheduledDate) return false;

  const now = new Date();

  // Si todavía no ha llegado la hora programada, no está activa
  if (now.getTime() < scheduledDate.getTime()) {
    return false;
  }

  // Si no hay lista de todas las horas, usar la lógica antigua (±5 minutos)
  if (!allScheduledTimes || allScheduledTimes.length === 0) {
    const diffMs = Math.abs(now.getTime() - scheduledDate.getTime());
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= 5;
  }

  // Filtrar y ordenar las horas programadas que vienen después de esta
  const laterTimes = allScheduledTimes
    .filter(time => time && time !== scheduledTime)
    .map(time => parseTimeToDate(time))
    .filter((date): date is Date => date !== null && date.getTime() > scheduledDate.getTime())
    .sort((a, b) => a.getTime() - b.getTime());

  // Si hay una siguiente hora programada
  if (laterTimes.length > 0) {
    const nextScheduledTime = laterTimes[0];
    // Está activa si la hora actual es antes de la siguiente hora programada
    return now.getTime() < nextScheduledTime.getTime();
  }

  // Si no hay siguiente hora programada (es la última del día), queda activa
  return true;
}

/**
 * Compara si una hora programada está próxima (dentro de 15 minutos en el futuro)
 * @param scheduledTime - Hora en formato "HH:mm"
 * @returns true si la hora está próxima
 */
export function isTimeUpcoming(scheduledTime: string | undefined): boolean {
  if (!scheduledTime) return false;

  const scheduledDate = parseTimeToDate(scheduledTime);
  if (!scheduledDate) return false;

  const now = new Date();
  const diffMs = scheduledDate.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  // Próxima si está entre 0 y 15 minutos en el futuro
  return diffMinutes > 0 && diffMinutes <= 15;
}

/**
 * Formatea una hora "HH:mm" a formato 12 horas con AM/PM
 */
export function formatTime(timeString: string | undefined): string {
  if (!timeString) return '';

  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeString;

    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
}

/**
 * Compara dos horas para ordenamiento
 * Retorna número negativo si a < b, positivo si a > b, 0 si iguales
 */
export function compareScheduledTimes(a: string | undefined, b: string | undefined): number {
  // Tareas sin hora van al final
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  const dateA = parseTimeToDate(a);
  const dateB = parseTimeToDate(b);

  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;

  return dateA.getTime() - dateB.getTime();
}
