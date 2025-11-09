'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, Play } from 'lucide-react';
import { Task, Subtask } from '@/types';

interface SubtasksListProps {
  tasks: Task[];
  subtasks: Subtask[];
  selectedSubtask: Subtask | null;
  onSubtaskCreate: (taskId: number | null, title: string, minutes: number) => Promise<void>;
  onSubtaskToggle: (subtaskId: number, completed: boolean) => Promise<void>;
  onSubtaskDelete: (subtaskId: number) => Promise<void>;
  onSubtaskSelect: (subtask: Subtask) => void;
}

export default function SubtasksList({
  tasks,
  subtasks,
  selectedSubtask,
  onSubtaskCreate,
  onSubtaskToggle,
  onSubtaskDelete,
  onSubtaskSelect,
}: SubtasksListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [isAddingIndependent, setIsAddingIndependent] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskMinutes, setNewSubtaskMinutes] = useState(25);
  const [addingToTaskId, setAddingToTaskId] = useState<number | null>(null);

  const handleSubmit = async (taskId: number | null) => {
    if (!newSubtaskTitle.trim() || newSubtaskMinutes <= 0) return;

    await onSubtaskCreate(taskId, newSubtaskTitle, newSubtaskMinutes);
    setNewSubtaskTitle('');
    setNewSubtaskMinutes(25);
    setIsAddingIndependent(false);
    setAddingToTaskId(null);
  };

  const getSubtasksForTask = (taskId: number) => {
    return subtasks.filter(st => st.task_id === taskId);
  };

  const independentSubtasks = subtasks.filter(st => !st.task_id);

  return (
    <div className="bg-navy/50 border border-gold/20 rounded-lg shadow-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-cream">Mini Tareas</h2>
        <button
          onClick={() => setIsAddingIndependent(true)}
          className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-orange text-cream rounded-lg hover:bg-orange/90 active:bg-orange/80 transition-colors touch-manipulation text-sm sm:text-base whitespace-nowrap font-medium"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      {/* Formulario para mini tarea independiente */}
      {isAddingIndependent && (
        <div className="mb-3 p-3 sm:p-4 border-2 border-orange/30 rounded-lg bg-navy/30">
          <h3 className="text-sm font-medium mb-2 text-cream">Mini tarea independiente</h3>
          <input
            type="text"
            placeholder="Título de la mini tarea"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gold/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange bg-navy/50 text-cream placeholder:text-cream/50 text-base"
            autoFocus
          />
          <div className="mb-3">
            <label className="block text-sm font-medium text-cream/80 mb-1">
              Tiempo estimado (minutos)
            </label>
            <input
              type="number"
              value={newSubtaskMinutes}
              onChange={(e) => setNewSubtaskMinutes(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 sm:py-2 border border-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange bg-navy/50 text-cream text-base"
              min="1"
              max="999"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit(null)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-orange text-cream rounded-lg hover:bg-orange/90 active:bg-orange/80 transition-colors touch-manipulation font-medium"
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setIsAddingIndependent(false);
                setNewSubtaskTitle('');
                setNewSubtaskMinutes(25);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-cream/20 text-cream rounded-lg hover:bg-cream/30 active:bg-cream/40 transition-colors touch-manipulation"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mini tareas independientes */}
      {independentSubtasks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-cream/70 mb-2">Sin tarea asignada</h3>
          <div className="space-y-2">
            {independentSubtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                isSelected={selectedSubtask?.id === subtask.id}
                onToggle={onSubtaskToggle}
                onDelete={onSubtaskDelete}
                onSelect={onSubtaskSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tareas con sus mini tareas */}
      {tasks.length === 0 && independentSubtasks.length === 0 ? (
        <p className="text-center text-cream/50 py-8 text-sm sm:text-base">
          No hay tareas ni mini tareas para este día
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const taskSubtasks = getSubtasksForTask(task.id);
            const isExpanded = expandedTaskId === task.id;
            const isAdding = addingToTaskId === task.id;

            return (
              <div key={task.id} className="border border-gold/20 rounded-lg overflow-hidden bg-navy/30">
                <button
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gold/5 active:bg-gold/10 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-cream/50' : 'text-cream'}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-cream/60 mt-1">
                      {taskSubtasks.length} mini {taskSubtasks.length === 1 ? 'tarea' : 'tareas'}
                    </p>
                  </div>
                  <div className="text-cream/60">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 bg-navy/20">
                    <button
                      onClick={() => setAddingToTaskId(task.id)}
                      className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 bg-navy/50 border border-gold/20 text-cream rounded-lg hover:bg-gold/10 active:bg-gold/20 transition-colors touch-manipulation text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar mini tarea
                    </button>

                    {isAdding && (
                      <div className="mb-2 p-3 border border-gold/20 rounded-lg bg-navy/30">
                        <input
                          type="text"
                          placeholder="Título"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gold/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gold bg-navy/50 text-cream placeholder:text-cream/50 text-sm"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={newSubtaskMinutes}
                          onChange={(e) => setNewSubtaskMinutes(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gold/30 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-gold bg-navy/50 text-cream placeholder:text-cream/50 text-sm"
                          placeholder="Minutos"
                          min="1"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmit(task.id)}
                            className="flex-1 px-3 py-2 bg-gold text-navy rounded-lg hover:bg-gold/90 active:bg-gold/80 transition-colors text-sm font-medium"
                          >
                            Agregar
                          </button>
                          <button
                            onClick={() => {
                              setAddingToTaskId(null);
                              setNewSubtaskTitle('');
                              setNewSubtaskMinutes(25);
                            }}
                            className="flex-1 px-3 py-2 bg-cream/20 text-cream rounded-lg hover:bg-cream/30 active:bg-cream/40 transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      {taskSubtasks.length === 0 ? (
                        <p className="text-center text-cream/50 py-4 text-xs">
                          No hay mini tareas
                        </p>
                      ) : (
                        taskSubtasks.map((subtask) => (
                          <SubtaskItem
                            key={subtask.id}
                            subtask={subtask}
                            isSelected={selectedSubtask?.id === subtask.id}
                            onToggle={onSubtaskToggle}
                            onDelete={onSubtaskDelete}
                            onSelect={onSubtaskSelect}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SubtaskItemProps {
  subtask: Subtask;
  isSelected: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onSelect: (subtask: Subtask) => void;
}

function SubtaskItem({ subtask, isSelected, onToggle, onDelete, onSelect }: SubtaskItemProps) {
  return (
    <div
      className={`
        p-2 rounded-lg flex items-center gap-2 transition-all
        ${isSelected ? 'bg-orange/20 border-2 border-orange' : 'bg-navy/30 border border-gold/20'}
        ${subtask.completed ? 'opacity-60' : ''}
      `}
    >
      <button
        onClick={() => onToggle(subtask.id, !subtask.completed)}
        className={`
          w-5 h-5 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0
          ${subtask.completed ? 'bg-gold border-gold' : 'border-gold/30 hover:border-gold active:border-gold/80'}
        `}
        aria-label={subtask.completed ? 'Marcar como no completada' : 'Marcar como completada'}
      >
        {subtask.completed && <Check className="w-3 h-3 text-navy" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm break-words ${subtask.completed ? 'line-through text-cream/50' : 'text-cream'}`}>
          {subtask.title}
        </p>
        <p className="text-xs text-cream/60">{subtask.estimated_minutes} min</p>
      </div>

      {!subtask.completed && (
        <button
          onClick={() => onSelect(subtask)}
          className={`
            p-1.5 sm:p-1.5 rounded transition-colors touch-manipulation flex-shrink-0
            ${isSelected ? 'bg-orange text-cream' : 'bg-orange/20 text-orange hover:bg-orange/30 active:bg-orange/40'}
          `}
          aria-label="Usar en Pomodoro"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => onDelete(subtask.id)}
        className="p-1.5 text-red hover:bg-red/10 active:bg-red/20 rounded transition-colors touch-manipulation flex-shrink-0"
        aria-label="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
