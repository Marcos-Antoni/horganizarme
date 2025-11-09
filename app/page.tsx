'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Timer } from 'lucide-react';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import { Task } from '@/types';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksCount, setTasksCount] = useState<Record<string, number>>({});

  // Cargar todas las tareas para el contador del calendario
  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Cargar tareas del día seleccionado
  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const fetchAllTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setAllTasks(data.tasks);

      // Calcular contador de tareas por fecha
      const counts: Record<string, number> = {};
      data.tasks.forEach((task: Task) => {
        counts[task.task_date] = (counts[task.task_date] || 0) + 1;
      });
      setTasksCount(counts);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  };

  const fetchTasks = async (date: Date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/tasks?date=${dateString}`);
      const data = await res.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskCreate = async (title: string, description: string) => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, task_date: dateString }),
      });

      if (res.ok) {
        await fetchTasks(selectedDate);
        await fetchAllTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (res.ok) {
        await fetchTasks(selectedDate);
        await fetchAllTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTasks(selectedDate);
        await fetchAllTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="bg-navy border-b border-orange/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-cream truncate">Horganizar</h1>
              <p className="text-xs sm:text-sm text-cream/70 hidden sm:block">Organiza tu tiempo y aumenta tu productividad</p>
            </div>
            <Link
              href="/pomodoro"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-orange text-cream rounded-lg hover:bg-orange/90 active:bg-orange/80 transition-colors touch-manipulation flex-shrink-0 font-medium"
            >
              <Timer className="w-5 h-5" />
              <span className="hidden sm:inline text-sm sm:text-base">Pomodoro</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendario */}
          <div className="lg:col-span-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              tasksCount={tasksCount}
            />
          </div>

          {/* Tareas del día */}
          <div className="lg:col-span-2">
            <TaskList
              selectedDate={selectedDate}
              tasks={tasks}
              onTaskCreate={handleTaskCreate}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
