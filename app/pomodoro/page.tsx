'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import PomodoroTimer from '@/components/PomodoroTimer';
import DaySelector from '@/components/DaySelector';
import SubtasksList from '@/components/SubtasksList';
import { PomodoroSettings, Task, Subtask } from '@/types';

export default function PomodoroPage() {
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);

  useEffect(() => {
    fetchPomodoroSettings();
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchSubtasks();
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

  const fetchTasks = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/tasks?date=${dateStr}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSubtasks = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/subtasks?date=${dateStr}`);
      const data = await res.json();
      setSubtasks(data.subtasks || []);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
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

  const handleSubtaskCreate = async (taskId: number | null, title: string, minutes: number, scheduledTime?: string) => {
    try {
      const body: any = { task_id: taskId, title, estimated_minutes: minutes };
      if (scheduledTime) body.scheduled_time = scheduledTime;

      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchSubtasks();
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleSubtaskToggle = async (subtaskId: number, completed: boolean) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (res.ok) {
        await fetchSubtasks();
        // Si la subtarea seleccionada se completó, deseleccionarla
        if (selectedSubtask?.id === subtaskId && completed) {
          setSelectedSubtask(null);
        }
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleSubtaskDelete = async (subtaskId: number) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchSubtasks();
        // Si la subtarea seleccionada fue eliminada, deseleccionarla
        if (selectedSubtask?.id === subtaskId) {
          setSelectedSubtask(null);
        }
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleSubtaskSelect = (subtask: Subtask) => {
    setSelectedSubtask(subtask);
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="bg-navy border-b border-orange/20 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-cream/70 hover:text-cream active:text-cream mb-2 transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="text-sm sm:text-base">Volver a Tareas</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-cream">Temporizador Pomodoro</h1>
          <p className="text-xs sm:text-sm text-cream/70 hidden sm:block">Aumenta tu productividad con la técnica Pomodoro</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-safe space-y-4">
        {/* Day Selector */}
        <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Subtasks List */}
        <SubtasksList
          tasks={tasks}
          subtasks={subtasks}
          selectedSubtask={selectedSubtask}
          onSubtaskCreate={handleSubtaskCreate}
          onSubtaskToggle={handleSubtaskToggle}
          onSubtaskDelete={handleSubtaskDelete}
          onSubtaskSelect={handleSubtaskSelect}
        />

        {/* Pomodoro Timer */}
        <PomodoroTimer
          settings={pomodoroSettings}
          selectedSubtask={selectedSubtask}
          onSettingsUpdate={handlePomodoroSettingsUpdate}
          onSessionComplete={handleSessionComplete}
          onSubtaskUpdate={fetchSubtasks}
        />
      </main>
    </div>
  );
}
