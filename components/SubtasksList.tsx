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
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Mini Tareas</h2>
        <button
          onClick={() => setIsAddingIndependent(true)}
          className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors touch-manipulation text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      {/* Formulario para mini tarea independiente */}
      {isAddingIndependent && (
        <div className="mb-3 p-3 sm:p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
          <h3 className="text-sm font-medium mb-2">Mini tarea independiente</h3>
          <input
            type="text"
            placeholder="Título de la mini tarea"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
            autoFocus
          />
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo estimado (minutos)
            </label>
            <input
              type="number"
              value={newSubtaskMinutes}
              onChange={(e) => setNewSubtaskMinutes(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              min="1"
              max="999"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit(null)}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-colors touch-manipulation"
            >
              Agregar
            </button>
            <button
              onClick={() => {
                setIsAddingIndependent(false);
                setNewSubtaskTitle('');
                setNewSubtaskMinutes(25);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors touch-manipulation"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Mini tareas independientes */}
      {independentSubtasks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sin tarea asignada</h3>
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
        <p className="text-center text-gray-400 py-8 text-sm sm:text-base">
          No hay tareas ni mini tareas para este día
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const taskSubtasks = getSubtasksForTask(task.id);
            const isExpanded = expandedTaskId === task.id;
            const isAdding = addingToTaskId === task.id;

            return (
              <div key={task.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {taskSubtasks.length} mini {taskSubtasks.length === 1 ? 'tarea' : 'tareas'}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 bg-gray-50">
                    <button
                      onClick={() => setAddingToTaskId(task.id)}
                      className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar mini tarea
                    </button>

                    {isAdding && (
                      <div className="mb-2 p-3 border border-gray-200 rounded-lg bg-white">
                        <input
                          type="text"
                          placeholder="Título"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                        <input
                          type="number"
                          value={newSubtaskMinutes}
                          onChange={(e) => setNewSubtaskMinutes(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Minutos"
                          min="1"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmit(task.id)}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors text-sm"
                          >
                            Agregar
                          </button>
                          <button
                            onClick={() => {
                              setAddingToTaskId(null);
                              setNewSubtaskTitle('');
                              setNewSubtaskMinutes(25);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      {taskSubtasks.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 text-xs">
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
        ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border border-gray-200'}
        ${subtask.completed ? 'opacity-60' : ''}
      `}
    >
      <button
        onClick={() => onToggle(subtask.id, !subtask.completed)}
        className={`
          w-5 h-5 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0
          ${subtask.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500 active:border-green-600'}
        `}
        aria-label={subtask.completed ? 'Marcar como no completada' : 'Marcar como completada'}
      >
        {subtask.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm break-words ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {subtask.title}
        </p>
        <p className="text-xs text-gray-500">{subtask.estimated_minutes} min</p>
      </div>

      {!subtask.completed && (
        <button
          onClick={() => onSelect(subtask)}
          className={`
            p-1.5 sm:p-1.5 rounded transition-colors touch-manipulation flex-shrink-0
            ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-200'}
          `}
          aria-label="Usar en Pomodoro"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => onDelete(subtask.id)}
        className="p-1.5 text-red-500 hover:bg-red-50 active:bg-red-100 rounded transition-colors touch-manipulation flex-shrink-0"
        aria-label="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
