import { useState, useCallback, useRef } from 'react';
import { BackgroundTask, AppNotification, TaskType } from '../types';
import {
  sendBrowserNotification,
  playNotificationChime,
} from '../utils/browserNotifications';

export function useBackgroundTaskManager() {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Helper to add or replace a background task
  const startTask = useCallback(
    (params: {
      id: string;
      type: TaskType;
      title: string;
      description: string;
      totalSteps?: number;
      onPause?: () => void;
      onResume?: () => void;
      onCancel?: () => void;
      onDownload?: () => void;
    }) => {
      const newTask: BackgroundTask = {
        id: params.id,
        type: params.type,
        title: params.title,
        description: params.description,
        progress: 0,
        currentStep: 0,
        totalSteps: params.totalSteps,
        status: 'running',
        createdAt: Date.now(),
        onPause: params.onPause,
        onResume: params.onResume,
        onCancel: params.onCancel,
        onDownload: params.onDownload,
      };

      setTasks((prev) => {
        const filtered = prev.filter((t) => t.id !== params.id);
        return [newTask, ...filtered];
      });

      return params.id;
    },
    []
  );

  // Update task progress in real-time
  const updateTaskProgress = useCallback(
    (
      id: string,
      updates: {
        progress?: number;
        description?: string;
        currentStep?: number;
        status?: 'running' | 'paused' | 'completed' | 'error';
        errorMessage?: string;
        onDownload?: () => void;
      }
    ) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            progress: updates.progress !== undefined ? Math.min(100, Math.max(0, updates.progress)) : t.progress,
            description: updates.description ?? t.description,
            currentStep: updates.currentStep ?? t.currentStep,
            status: updates.status ?? t.status,
            errorMessage: updates.errorMessage ?? t.errorMessage,
            onDownload: updates.onDownload ?? t.onDownload,
          };
        })
      );
    },
    []
  );

  // Mark task as completed, show notification, play chime, send browser notification
  const completeTask = useCallback(
    (
      id: string,
      details: {
        title: string;
        message: string;
        actionLabel?: string;
        onAction?: () => void;
        onDownload?: () => void;
      }
    ) => {
      // 1. Update task state
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            progress: 100,
            status: 'completed',
            completedAt: Date.now(),
            description: details.message,
            onDownload: details.onDownload || t.onDownload,
          };
        })
      );

      // 2. Add in-app notification
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newNotif: AppNotification = {
        id: notifId,
        type: 'success',
        title: details.title,
        message: details.message,
        timestamp: Date.now(),
        read: false,
        actionLabel: details.actionLabel,
        onAction: details.onAction,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]); // keep last 20

      // 3. Play gentle pleasant chime
      playNotificationChime();

      // 4. Send native browser notification if user in another tab
      sendBrowserNotification(details.title, {
        body: details.message,
        tag: id,
      });
    },
    []
  );

  // Mark task as error
  const failTask = useCallback(
    (id: string, errorMessage: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            status: 'error',
            errorMessage,
            description: errorMessage,
          };
        })
      );

      const notifId = `notif-err-${Date.now()}`;
      setNotifications((prev) => [
        {
          id: notifId,
          type: 'error',
          title: 'تعثرت المهمة في الخلفية',
          message: errorMessage,
          timestamp: Date.now(),
          read: false,
        },
        ...prev,
      ]);
    },
    []
  );

  // Remove task from list
  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Dismiss a notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const activeTasksCount = tasks.filter(
    (t) => t.status === 'running' || t.status === 'paused'
  ).length;

  return {
    tasks,
    notifications,
    activeTasksCount,
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    startTask,
    updateTaskProgress,
    completeTask,
    failTask,
    removeTask,
    dismissNotification,
    clearAllNotifications,
  };
}
