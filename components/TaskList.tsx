'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, Check } from 'lucide-react';
import { Task } from '@/types';

interface TaskListProps {
  selectedDate: Date;
  tasks: Task[];
  onTaskCreate: (title: string, description: string) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await onTaskCreate(newTaskTitle, newTaskDescription);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Tareas del {format(selectedDate, "d 'de' MMMM", { locale: es })}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </button>
      </div>

      {/* Formulario para nueva tarea */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border border-gray-200 rounded-lg">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de tareas */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No hay tareas para este día
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`
                p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all
                ${task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'}
              `}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onTaskToggle(task.id, !task.completed)}
                  className={`
                    mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'}
                  `}
                >
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </button>

                <div className="flex-1">
                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
