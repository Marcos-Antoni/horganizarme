'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { PomodoroSettings, Subtask } from '@/types';

interface PomodoroTimerProps {
  settings: PomodoroSettings | null;
  selectedSubtask: Subtask | null;
  onSettingsUpdate: (settings: Partial<PomodoroSettings>) => Promise<void>;
  onSessionComplete: (sessionType: string, duration: number) => Promise<void>;
  onSubtaskUpdate: () => Promise<void>;
}

export default function PomodoroTimer({
  settings,
  selectedSubtask,
  onSettingsUpdate,
  onSessionComplete,
  onSubtaskUpdate,
}: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [editSettings, setEditSettings] = useState<Partial<PomodoroSettings>>({});
  const [currentSubtask, setCurrentSubtask] = useState<Subtask | null>(null);
  const [customBreakDuration, setCustomBreakDuration] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (settings) {
      setEditSettings({
        work_duration: settings.work_duration,
        short_break: settings.short_break,
        long_break: settings.long_break,
        sessions_until_long_break: settings.sessions_until_long_break,
      });
    }
  }, [settings]);

  // Cuando se selecciona una subtarea, configurar el timer con su tiempo
  useEffect(() => {
    if (selectedSubtask && !isRunning) {
      setCurrentSubtask(selectedSubtask);
      setTimeLeft(selectedSubtask.estimated_minutes * 60);
      setSessionType('work');
    }
  }, [selectedSubtask]);

  useEffect(() => {
    if (settings && !currentSubtask) {
      let duration;

      if (sessionType === 'work') {
        duration = settings.work_duration;
      } else if (customBreakDuration !== null) {
        // Usar descanso personalizado basado en la subtarea completada
        duration = customBreakDuration;
      } else if (sessionType === 'short_break') {
        duration = settings.short_break;
      } else {
        duration = settings.long_break;
      }

      setTimeLeft(duration * 60);
    }
  }, [sessionType, settings, currentSubtask, customBreakDuration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);

    // Reproducir sonido (opcional)
    playSound();

    // Si hay una subtarea en progreso, marcarla como completada
    if (currentSubtask && sessionType === 'work') {
      try {
        await fetch(`/api/subtasks/${currentSubtask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completed: true,
            completed_at: new Date().toISOString(),
          }),
        });
        await onSubtaskUpdate();

        // Calcular descanso proporcional (20% del tiempo trabajado)
        const breakTime = Math.max(1, Math.round(currentSubtask.estimated_minutes / 5));
        setCustomBreakDuration(breakTime);

        setCurrentSubtask(null);
      } catch (error) {
        console.error('Error completing subtask:', error);
      }
    }

    // Guardar sesión en la base de datos
    const duration = currentSubtask
      ? currentSubtask.estimated_minutes
      : sessionType === 'work'
      ? settings?.work_duration || 25
      : customBreakDuration !== null
      ? customBreakDuration
      : sessionType === 'short_break'
      ? settings?.short_break || 5
      : settings?.long_break || 15;

    await onSessionComplete(sessionType, duration);

    // Si completó una sesión de trabajo, incrementar contador
    if (sessionType === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);

      // Determinar el siguiente tipo de descanso
      if (newCount % (settings?.sessions_until_long_break || 4) === 0) {
        setSessionType('long_break');
      } else {
        setSessionType('short_break');
      }
    } else {
      // Después de un descanso, volver a trabajo y limpiar descanso personalizado
      setCustomBreakDuration(null);
      setSessionType('work');
    }
  };

  const playSound = () => {
    // Simple beep usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = async () => {
    if (!isRunning && currentSubtask && !currentSubtask.started_at) {
      // Registrar el inicio de la subtarea
      try {
        await fetch(`/api/subtasks/${currentSubtask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            started_at: new Date().toISOString(),
          }),
        });
        await onSubtaskUpdate();
      } catch (error) {
        console.error('Error starting subtask:', error);
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (currentSubtask) {
      setTimeLeft(currentSubtask.estimated_minutes * 60);
    } else if (settings) {
      const duration = sessionType === 'work'
        ? settings.work_duration
        : sessionType === 'short_break'
        ? settings.short_break
        : settings.long_break;
      setTimeLeft(duration * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsSave = async () => {
    await onSettingsUpdate(editSettings);
    setShowSettings(false);
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'bg-red-500';
      case 'short_break':
        return 'bg-green-500';
      case 'long_break':
        return 'bg-blue-500';
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Trabajo';
      case 'short_break':
        return 'Descanso Corto';
      case 'long_break':
        return 'Descanso Largo';
    }
  };

  if (!settings) {
    return <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-4">
        <h2 className="text-lg sm:text-lg font-semibold">Pomodoro</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors touch-manipulation"
          aria-label="Configuración"
        >
          <Settings className="w-6 h-6 sm:w-5 sm:h-5" />
        </button>
      </div>

      {showSettings ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-sm font-medium text-gray-700 mb-1">
              Duración de trabajo (minutos)
            </label>
            <input
              type="number"
              value={editSettings.work_duration || 25}
              onChange={(e) => setEditSettings({ ...editSettings, work_duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-sm font-medium text-gray-700 mb-1">
              Descanso corto (minutos)
            </label>
            <input
              type="number"
              value={editSettings.short_break || 5}
              onChange={(e) => setEditSettings({ ...editSettings, short_break: parseInt(e.target.value) })}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-sm font-medium text-gray-700 mb-1">
              Descanso largo (minutos)
            </label>
            <input
              type="number"
              value={editSettings.long_break || 15}
              onChange={(e) => setEditSettings({ ...editSettings, long_break: parseInt(e.target.value) })}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-sm font-medium text-gray-700 mb-1">
              Sesiones hasta descanso largo
            </label>
            <input
              type="number"
              value={editSettings.sessions_until_long_break || 4}
              onChange={(e) => setEditSettings({ ...editSettings, sessions_until_long_break: parseInt(e.target.value) })}
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSettingsSave}
              className="flex-1 px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="flex-1 px-4 py-2.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors touch-manipulation"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Subtarea seleccionada */}
          {currentSubtask && (
            <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-blue-600 font-medium mb-1">Mini Tarea Seleccionada</p>
                  <p className="text-sm font-medium text-gray-900">{currentSubtask.title}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentSubtask(null);
                    if (settings) {
                      setTimeLeft(settings.work_duration * 60);
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 active:text-blue-800 px-2 py-1"
                  disabled={isRunning}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Indicador de sesión */}
          <div className="text-center mb-6 sm:mb-4">
            <span className={`inline-block px-5 py-2.5 sm:px-4 sm:py-2 rounded-full text-white text-base sm:text-base font-medium ${getSessionColor()}`}>
              {getSessionLabel()}
            </span>
          </div>

          {/* Timer display */}
          <div className="text-center mb-8 sm:mb-6">
            <div className="text-7xl sm:text-6xl font-bold text-gray-800 mb-3 sm:mb-2 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className="text-base sm:text-sm text-gray-500">
              Sesiones completadas: {completedSessions}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 sm:mb-0">
            <button
              onClick={toggleTimer}
              className={`
                flex items-center justify-center gap-2 px-8 py-4 sm:px-6 sm:py-3 rounded-lg text-white font-medium transition-colors touch-manipulation text-lg sm:text-base
                ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700' : 'bg-green-500 hover:bg-green-600 active:bg-green-700'}
              `}
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6 sm:w-5 sm:h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 sm:w-5 sm:h-5" />
                  Iniciar
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center justify-center gap-2 px-8 py-4 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium touch-manipulation text-lg sm:text-base"
            >
              <RotateCcw className="w-6 h-6 sm:w-5 sm:h-5" />
              Reiniciar
            </button>
          </div>

          {/* Quick session selector */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => {
                setSessionType('work');
                setIsRunning(false);
                setCustomBreakDuration(null);
              }}
              className={`flex-1 px-3 py-3 sm:py-2 rounded-lg text-sm sm:text-sm font-medium transition-colors touch-manipulation ${
                sessionType === 'work' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Trabajo
            </button>
            <button
              onClick={() => {
                setSessionType('short_break');
                setIsRunning(false);
                setCustomBreakDuration(null);
              }}
              className={`flex-1 px-3 py-3 sm:py-2 rounded-lg text-sm sm:text-sm font-medium transition-colors touch-manipulation ${
                sessionType === 'short_break' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Descanso
            </button>
            <button
              onClick={() => {
                setSessionType('long_break');
                setIsRunning(false);
                setCustomBreakDuration(null);
              }}
              className={`flex-1 px-3 py-3 sm:py-2 rounded-lg text-sm sm:text-sm font-medium transition-colors touch-manipulation ${
                sessionType === 'long_break' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Largo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
