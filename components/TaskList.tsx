'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Check, Clock } from 'lucide-react';
import { Task } from '@/types';
import { useCurrentTime } from '@/components/hooks/useCurrentTime';
import { isTimeActive, formatTime } from '@/utils/timeUtils';

interface TaskListProps {
  selectedDate: Date;
  tasks: Task[];
  onTaskCreate: (title: string, description: string, scheduledTime?: string) => Promise<void>;
  onTaskToggle: (taskId: number, completed: boolean) => Promise<void>;
  onTaskDelete: (taskId: number) => Promise<void>;
}

export default function TaskList({
  selectedDate,
  tasks,
  onTaskCreate,
  onTaskToggle,
  onTaskDelete,
}: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');

  // Hook para detectar tareas activas en tiempo real
  const currentTime = useCurrentTime();

  // Obtener todas las horas programadas del día para la lógica de activación
  const allScheduledTimes = tasks
    .map(task => task.scheduled_time)
    .filter((time): time is string => !!time);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await onTaskCreate(newTaskTitle, newTaskDescription, newTaskTime || undefined);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskTime('');
    setIsAdding(false);
  };

  return (
    <div className="bg-navy/50 border border-gold/20 rounded-lg shadow-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-cream">
          Tareas del {format(selectedDate, "d 'de' MMMM", { locale: es })}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-gold text-navy rounded-lg hover:bg-gold/90 active:bg-gold/80 transition-colors touch-manipulation text-sm sm:text-base whitespace-nowrap font-medium"
        >
          <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Nueva Tarea</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Formulario para nueva tarea */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-3 sm:mb-4 p-3 sm:p-4 border border-gold/20 rounded-lg bg-navy/30">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gold/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gold bg-navy/50 text-cream placeholder:text-cream/50 text-base"
            autoFocus
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gold/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gold bg-navy/50 text-cream placeholder:text-cream/50 resize-none text-base"
            rows={3}
          />
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm font-medium text-cream/80 mb-2">
              <Clock className="w-4 h-4 text-gold" />
              Hora programada (opcional)
            </label>
            <div className="relative">
              <input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border-2 border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-gold/5 text-cream text-base transition-all hover:border-gold/50"
                style={{
                  colorScheme: 'dark'
                }}
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-gold text-navy rounded-lg hover:bg-gold/90 active:bg-gold/80 transition-colors touch-manipulation font-medium"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setNewTaskTime('');
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-cream/20 text-cream rounded-lg hover:bg-cream/30 active:bg-cream/40 transition-colors touch-manipulation"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de tareas */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-cream/50 py-8 text-sm sm:text-base">
            No hay tareas para este día
          </p>
        ) : (
          tasks.map((task) => {
            const isScheduled = isTimeActive(task.scheduled_time, allScheduledTimes);
            return (
              <div
                key={task.id}
                className={`
                  p-3 sm:p-3 border rounded-lg hover:shadow-md transition-all duration-500
                  ${isScheduled && !task.completed
                    ? 'bg-gold/20 border-2 border-gold shadow-lg shadow-gold/50 hover:shadow-gold/30'
                    : task.completed
                      ? 'bg-navy/20 border-gold/10 opacity-75 hover:shadow-gold/10'
                      : 'bg-navy/30 border-gold/20 hover:shadow-gold/10'
                  }
                `}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <button
                    onClick={() => onTaskToggle(task.id, !task.completed)}
                    className={`
                      mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0
                      ${task.completed ? 'bg-gold border-gold' : 'border-gold/30 hover:border-gold active:border-gold/80'}
                    `}
                    aria-label={task.completed ? 'Marcar como no completada' : 'Marcar como completada'}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-navy" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm sm:text-base break-words ${task.completed ? 'line-through text-cream/50' : 'text-cream'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-xs sm:text-sm mt-1 break-words ${task.completed ? 'line-through text-cream/40' : 'text-cream/70'}`}>
                        {task.description}
                      </p>
                    )}
                    {task.scheduled_time && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isScheduled && !task.completed ? 'text-gold font-semibold' : 'text-cream/60'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(task.scheduled_time)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onTaskDelete(task.id)}
                    className="p-2 sm:p-1 text-red hover:bg-red/10 active:bg-red/20 rounded transition-colors touch-manipulation flex-shrink-0"
                    aria-label="Eliminar tarea"
                  >
                    <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
