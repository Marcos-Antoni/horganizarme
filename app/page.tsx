'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Calendar from '@/components/Calendar';
import TaskList from '@/components/TaskList';
import PomodoroTimer from '@/components/PomodoroTimer';
import { Task, PomodoroSettings } from '@/types';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings | null>(null);
  const [tasksCount, setTasksCount] = useState<Record<string, number>>({});

  // Cargar configuración de Pomodoro
  useEffect(() => {
    fetchPomodoroSettings();
  }, []);

  // Cargar todas las tareas para el contador del calendario
  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Cargar tareas del día seleccionado
  useEffect(() => {
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const fetchPomodoroSettings = async () => {
    try {
      const res = await fetch('/api/pomodoro/settings');
      const data = await res.json();
      setPomodoroSettings(data.settings);
    } catch (error) {
      console.error('Error fetching pomodoro settings:', error);
    }
  };

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

  const handlePomodoroSettingsUpdate = async (settings: Partial<PomodoroSettings>) => {
    try {
      const res = await fetch('/api/pomodoro/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        await fetchPomodoroSettings();
      }
    } catch (error) {
      console.error('Error updating pomodoro settings:', error);
    }
  };

  const handleSessionComplete = async (sessionType: string, duration: number) => {
    try {
      await fetch('/api/pomodoro/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_type: sessionType, duration }),
      });
    } catch (error) {
      console.error('Error creating pomodoro session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Horganizar</h1>
          <p className="text-sm text-gray-600">Organiza tu tiempo y aumenta tu productividad</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Temporizador Pomodoro */}
          <div className="lg:col-span-3">
            <PomodoroTimer
              settings={pomodoroSettings}
              onSettingsUpdate={handlePomodoroSettingsUpdate}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
